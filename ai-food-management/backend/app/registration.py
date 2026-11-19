
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr, Field
from app.database import database
import bcrypt

router = APIRouter(
    prefix="/customer",
    tags=["Customer Registration"]
)


class CustomerRegistration(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(min_length=8, max_length=72)
    confirm_password: str = Field(min_length=8, max_length=72)
    phone: str = Field(min_length=10, max_length=15)
    terms_accepted: bool
    privacy_accepted: bool


@router.post("/register")
async def register_customer(customer: CustomerRegistration):

    email = str(customer.email).lower().strip()

    if customer.password != customer.confirm_password:
        raise HTTPException(
            status_code=400,
            detail="Passwords do not match"
        )

    if len(customer.password.encode("utf-8")) > 72:
        raise HTTPException(
            status_code=400,
            detail="Password is too long"
        )

    if not customer.terms_accepted:
        raise HTTPException(
            status_code=400,
            detail="Please accept the Terms and Conditions"
        )

    if not customer.privacy_accepted:
        raise HTTPException(
            status_code=400,
            detail="Please accept the Privacy Policy"
        )

    existing_user = await database.users.find_one(
        {"email": email}
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email is already registered"
        )

    hashed_password = bcrypt.hashpw(
        customer.password.encode("utf-8"),
        bcrypt.gensalt()
    ).decode("utf-8")

    user_data = {
        "name": customer.name.strip(),
        "email": email,
        "password": hashed_password,
        "phone": customer.phone.strip(),
        "terms_accepted": True,
        "privacy_accepted": True,
        "consent_date": datetime.now(timezone.utc),
        "address": {
            "house_number": "",
            "street": "",
            "area": "",
            "landmark": "",
            "city": "",
            "state": "",
            "pincode": ""
        },
        "alternate_phone": "",
        "food_preference": ""
    }

    result = await database.users.insert_one(user_data)

    return {
        "success": True,
        "message": "Registration successful",
        "user_id": str(result.inserted_id),
        "next_page": "/login"
    }
