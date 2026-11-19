
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from app.database import database
from app.security import create_access_token
import bcrypt

router = APIRouter(
    prefix="/customer",
    tags=["Customer Login"]
)


class CustomerLogin(BaseModel):
    email: EmailStr
    password: str


@router.post("/login")
async def login_customer(customer: CustomerLogin):

    email = str(customer.email).lower().strip()

    existing_user = await database.users.find_one(
        {"email": email}
    )

    if not existing_user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    stored_password = existing_user.get("password", "")

    try:
        password_valid = bcrypt.checkpw(
            customer.password.encode("utf-8"),
            stored_password.encode("utf-8")
        )
    except (ValueError, TypeError):
        password_valid = False

    if not password_valid:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    access_token = create_access_token(
        str(existing_user["_id"])
    )

    return {
        "success": True,
        "message": "Login successful",
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": str(existing_user["_id"]),
            "name": existing_user.get("name", ""),
            "email": existing_user.get("email", ""),
            "phone": existing_user.get("phone", "")
        },
        "next_page": "/"
    }
