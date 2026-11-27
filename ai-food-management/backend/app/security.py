
import os
from pathlib import Path
from datetime import datetime, timedelta, timezone

from dotenv import load_dotenv
from jose import jwt, JWTError
from bson import ObjectId
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.database import database


BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
JWT_ALGORITHM = "HS256"

NORMAL_TOKEN_EXPIRE_MINUTES = 60 * 24
REMEMBER_TOKEN_EXPIRE_MINUTES = 60 * 24 * 30

if not JWT_SECRET_KEY:
    raise ValueError("JWT_SECRET_KEY is missing in .env")

security_scheme = HTTPBearer()


def create_access_token(
    user_id: str,
    role: str = "customer",
    remember_me: bool = False,
    token_version: int = 0
):
    expiry_minutes = (
        REMEMBER_TOKEN_EXPIRE_MINUTES
        if remember_me
        else NORMAL_TOKEN_EXPIRE_MINUTES
    )

    expire = datetime.now(timezone.utc) + timedelta(
        minutes=expiry_minutes
    )

    payload = {
        "sub": user_id,
        "role": role,
        "ver": token_version,
        "exp": expire
    }

    return jwt.encode(
        payload,
        JWT_SECRET_KEY,
        algorithm=JWT_ALGORITHM
    )


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme)
):
    token = credentials.credentials

    try:
        payload = jwt.decode(
            token,
            JWT_SECRET_KEY,
            algorithms=[JWT_ALGORITHM]
        )

        user_id = payload.get("sub")

        if not user_id or not ObjectId.is_valid(user_id):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication token"
            )

    except JWTError as exc:
    print("JWT VERIFICATION ERROR:", type(exc).__name__, str(exc))

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired authentication token"
    )
    user = await database.users.find_one({
        "_id": ObjectId(user_id)
    })

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account not found"
        )

    # Invalidate old sessions after password changes.
    token_version = int(payload.get("ver", 0))
    current_version = int(user.get("token_version", 0))

    if token_version != current_version:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Your session has expired. Please log in again."
        )

    user["role"] = str(
        user.get("role") or "customer"
    ).lower()

    return user


async def get_current_customer(
    current_user: dict = Depends(get_current_user)
):
    if current_user.get("role") != "customer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Customer access required"
        )

    return current_user


def require_roles(*allowed_roles):

    async def role_checker(
        current_user: dict = Depends(get_current_user)
    ):
        if current_user.get("role") not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to access this resource"
            )

        return current_user

    return role_checker


async def get_current_restaurant(
    current_user: dict = Depends(get_current_user)
):
    if current_user.get("role") != "restaurant":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Restaurant access required"
        )

    return current_user
