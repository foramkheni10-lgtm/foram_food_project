
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
import base64
import random


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
# GENERATE CAPTCHA IMAGE
# --------------------------------------------------

def create_captcha_image(answer: str) -> str:

    width = 230
    height = 75

    svg_parts = [
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}">',
        '<rect width="100%" height="100%" fill="#e9dfe7"/>'
    ]

    # Background noise dots
    for _ in range(100):
        x = random.randint(0, width)
        y = random.randint(0, height)
        radius = random.uniform(0.3, 1.5)

        svg_parts.append(
            f'<circle cx="{x}" cy="{y}" r="{radius:.1f}" fill="#8e788e" opacity="0.35"/>'
        )

    # Distorted background lines
    for _ in range(7):
        x1 = random.randint(0, width)
        y1 = random.randint(0, height)
        x2 = random.randint(0, width)
        y2 = random.randint(0, height)

        svg_parts.append(
            f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" '
            f'stroke="#88738c" stroke-width="1.3" opacity="0.55"/>'
        )

    # CAPTCHA characters
    colors = [
        "#593c66",
        "#9b394c",
        "#31506f",
        "#506b39",
        "#73434b",
        "#39334e"
    ]

    start_x = 23

    for index, character in enumerate(answer):

        x = start_x + (index * 32)
        y = random.randint(44, 55)
        rotation = random.randint(-17, 17)
        color = random.choice(colors)
        font_size = random.randint(27, 34)

        svg_parts.append(
            f'<text x="{x}" y="{y}" '
            f'font-family="Arial, sans-serif" '
            f'font-size="{font_size}" '
            f'font-weight="bold" '
            f'fill="{color}" '
            f'transform="rotate({rotation} {x} {y})">'
            f'{character}</text>'
        )

    # Border
    svg_parts.append(
        '<rect x="1" y="1" width="228" height="73" '
        'fill="none" stroke="#b7a8b6" stroke-width="1"/>'
    )

    svg_parts.append('</svg>')

    svg = "".join(svg_parts)

    encoded = base64.b64encode(
        svg.encode("utf-8")
    ).decode("utf-8")

    return "data:image/svg+xml;base64," + encoded


# --------------------------------------------------
# CAPTCHA ENDPOINT
# --------------------------------------------------

@router.get("/captcha")
async def generate_captcha():

    characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"

    answer = "".join(
        secrets.choice(characters)
        for _ in range(6)
    )

    captcha_id = secrets.token_urlsafe(24)

    answer_hash = hashlib.sha256(
        "{}:{}".format(captcha_id, answer).encode()
    ).hexdigest()

    captcha_image = create_captcha_image(answer)

    await database.captcha_challenges.insert_one({
        "captcha_id": captcha_id,
        "answer_hash": answer_hash,
        "attempts": 0,
        "expires_at": datetime.now(timezone.utc) + timedelta(minutes=5)
    })

    return {
        "captcha_id": captcha_id,
        "captcha_image": captcha_image,
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

    normalized_answer = user.captcha_answer.strip().upper()

    answer_hash = hashlib.sha256(
        "{}:{}".format(
            user.captcha_id,
            normalized_answer
        ).encode()
    ).hexdigest()

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

    # CAPTCHA CAN ONLY BE USED ONCE

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

    # 3. FIND USER

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

    # 4. VERIFY PASSWORD

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

    # 5. VERIFY ROLE

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

    # 6. VERIFY EMAIL

    if not existing_user.get("email_verified", False):
        raise HTTPException(
            status_code=403,
            detail="Please verify your email before logging in."
        )

    # 7. SUCCESS

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
