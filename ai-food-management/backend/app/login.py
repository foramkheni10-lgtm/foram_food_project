
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from typing import Literal
from datetime import datetime, timedelta, timezone

from app.database import database
from app.security import create_access_token
from app.auth_helpers import (
    check_login_lock,
    record_failed_login,
    clear_login_attempts
)

import bcrypt
import secrets
import hashlib


router = APIRouter(
    prefix="/customer",
    tags=["Common Login"]
)


class UserLogin(BaseModel):
    email: EmailStr
    password: str
    captcha_id: str
    captcha_answer: str
    remember_me: bool = False
    account_type: Literal["customer", "admin", "inventory"] = "customer"


# --------------------------------------------------
# GENERATE MATH CAPTCHA
# --------------------------------------------------

def generate_math_captcha():

    operations = ["+", "-", "*"]
    operation = secrets.choice(operations)

    if operation == "+":
        first = secrets.randbelow(30) + 1
        second = secrets.randbelow(30) + 1
        answer = first + second

    elif operation == "-":
        first = secrets.randbelow(30) + 10
        second = secrets.randbelow(first)
        answer = first - second

    else:
        first = secrets.randbelow(9) + 2
        second = secrets.randbelow(9) + 2
        answer = first * second

    question = f"{first} {operation} {second} = ?"

    return question, str(answer)


# --------------------------------------------------
# CAPTCHA HASH
# --------------------------------------------------

def hash_captcha_answer(captcha_id: str, answer: str) -> str:

    return hashlib.sha256(
        f"{captcha_id}:{answer}".encode("utf-8")
    ).hexdigest()


# --------------------------------------------------
# CAPTCHA ENDPOINT
# --------------------------------------------------

@router.get("/captcha")
async def generate_captcha():

    question, answer = generate_math_captcha()

    captcha_id = secrets.token_urlsafe(24)

    answer_hash = hash_captcha_answer(
        captcha_id,
        answer
    )

    await database.captcha_challenges.insert_one({
        "captcha_id": captcha_id,
        "answer_hash": answer_hash,
        "attempts": 0,
        "expires_at": datetime.now(timezone.utc) + timedelta(minutes=5)
    })

    return {
        "captcha_id": captcha_id,
        "captcha_question": question,
        "expires_in": 300
    }


# --------------------------------------------------
# COMMON LOGIN
# --------------------------------------------------

@router.post("/login")
async def login_user(user: UserLogin):

    email = str(user.email).lower().strip()

    # 1. CHECK LOGIN LOCK

    remaining = check_login_lock(email, "common")

    if remaining > 0:
        raise HTTPException(
            status_code=429,
            detail="Too many failed attempts. Try again in {} seconds.".format(
                remaining
            )
        )

    # 2. VERIFY CAPTCHA

    normalized_answer = user.captcha_answer.strip()

    if not normalized_answer.isdigit():
        raise HTTPException(
            status_code=400,
            detail="Incorrect CAPTCHA. Please try again."
        )

    now = datetime.now(timezone.utc)

    challenge = await database.captcha_challenges.find_one({
        "captcha_id": user.captcha_id,
        "expires_at": {"$gt": now},
        "attempts": {"$lt": 5}
    })

    if not challenge:
        raise HTTPException(
            status_code=400,
            detail="CAPTCHA expired or invalid. Please refresh it."
        )

    answer_hash = hash_captcha_answer(
        user.captcha_id,
        normalized_answer
    )

    if not secrets.compare_digest(
        challenge["answer_hash"],
        answer_hash
    ):

        await database.captcha_challenges.update_one(
            {
                "captcha_id": user.captcha_id,
                "attempts": {"$lt": 5}
            },
            {"$inc": {"attempts": 1}}
        )

        lock_seconds = record_failed_login(email, "common")

        if lock_seconds:
            raise HTTPException(
                status_code=429,
                detail="3 failed attempts. Login locked for 2 minutes."
            )

        raise HTTPException(
            status_code=400,
            detail="Incorrect CAPTCHA. Please try again."
        )

    # 3. CAPTCHA CAN ONLY BE USED ONCE

    consumed = await database.captcha_challenges.delete_one({
        "captcha_id": user.captcha_id,
        "answer_hash": answer_hash,
        "expires_at": {"$gt": now},
        "attempts": {"$lt": 5}
    })

    if consumed.deleted_count == 0:
        raise HTTPException(
            status_code=400,
            detail="CAPTCHA already used or expired. Please refresh it."
        )

    # 4. FIND USER

    existing_user = await database.users.find_one({
        "email": email
    })

    password_valid = False

    if existing_user:

        stored_password = existing_user.get("password", "")

        try:
            password_valid = bcrypt.checkpw(
                user.password.encode("utf-8"),
                stored_password.encode("utf-8")
            )

        except (ValueError, TypeError, AttributeError):
            password_valid = False

    # 5. VERIFY PASSWORD

    if not existing_user or not password_valid:

        lock_seconds = record_failed_login(email, "common")

        if lock_seconds:
            raise HTTPException(
                status_code=429,
                detail="3 failed login attempts. Login locked for 2 minutes."
            )

        raise HTTPException(
            status_code=401,
            detail="Invalid email or password."
        )

    # 6. VERIFY ROLE

    role = str(
        existing_user.get("role") or "customer"
    ).lower().strip()

    role_pages = {
        "customer": "/",
        "admin": "/admin/dashboard",
        "restaurant": "/restaurant/dashboard",
        "inventory": "/inventory/dashboard",
        "inventory_staff": "/inventory/dashboard",
        "delivery": "/delivery/dashboard"
    }

    allowed_roles = {
        "customer": ["customer"],
        "admin": ["admin"],
        "inventory": ["inventory", "inventory_staff"]
    }

    if role not in allowed_roles.get(user.account_type, []):

        lock_seconds = record_failed_login(email, "common")

        if lock_seconds:
            raise HTTPException(
                status_code=429,
                detail="3 failed attempts. Login locked for 2 minutes."
            )

        raise HTTPException(
            status_code=401,
            detail="Invalid email or password."
        )

    # 7. VERIFY EMAIL

    if not existing_user.get("email_verified", False):
        raise HTTPException(
            status_code=403,
            detail="Please verify your email before logging in."
        )

    # 8. LOGIN SUCCESS

    clear_login_attempts(email, "common")

    access_token = create_access_token(
        str(existing_user["_id"]),
        role,
        remember_me=user.remember_me,
        token_version=int(existing_user.get("token_version", 0))
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
            "phone": existing_user.get("phone", ""),
            "role": role
        },
        "next_page": role_pages[role]
    }
