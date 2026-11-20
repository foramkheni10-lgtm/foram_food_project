
import re
import uuid
from pathlib import Path
from datetime import datetime, timezone
from typing import Optional

import bcrypt
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from pydantic import BaseModel, Field, EmailStr

from app.database import database
from app.security import get_current_customer


router = APIRouter(
    prefix="/customer/profile",
    tags=["Customer Profile"]
)

PROJECT_DIR = Path(__file__).resolve().parents[3]
PROFILE_IMAGE_DIR = PROJECT_DIR / "static" / "profile_images"
PROFILE_IMAGE_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_IMAGE_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp"
}


class CustomerProfile(BaseModel):
    house_number: str = Field(min_length=1, max_length=100)
    street: str = Field(min_length=2, max_length=150)
    area: str = Field(min_length=2, max_length=150)
    landmark: str = Field(default="", max_length=150)
    city: str = Field(min_length=2, max_length=100)
    state: str = Field(min_length=2, max_length=100)
    pincode: str
    alternate_phone: str = ""
    food_preference: str = "Both"


class ProfileUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=2, max_length=100)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(default=None, min_length=10, max_length=15)
    alternate_phone: Optional[str] = Field(default=None, max_length=15)
    house_number: Optional[str] = Field(default=None, max_length=100)
    street: Optional[str] = Field(default=None, max_length=150)
    area: Optional[str] = Field(default=None, max_length=150)
    landmark: Optional[str] = Field(default=None, max_length=150)
    city: Optional[str] = Field(default=None, max_length=100)
    state: Optional[str] = Field(default=None, max_length=100)
    pincode: Optional[str] = None
    food_preference: Optional[str] = None


class DeleteAccountRequest(BaseModel):
    password: str = Field(min_length=1, max_length=72)


def customer_id_string(customer: dict) -> str:
    return str(customer["_id"])


def validate_phone(value: str, field_name: str):
    if value and not re.fullmatch(r"[+]?[0-9]{10,15}", value):
        raise HTTPException(
            status_code=400,
            detail=f"Enter a valid {field_name}."
        )


def profile_response(customer: dict):
    address = customer.get("address") or {}

    return {
        "name": customer.get("name", ""),
        "email": customer.get("email", ""),
        "phone": customer.get("phone", ""),
        "address": address,
        "house_number": address.get("house_number", ""),
        "street": address.get("street", ""),
        "area": address.get("area", ""),
        "landmark": address.get("landmark", ""),
        "city": address.get("city", ""),
        "state": address.get("state", ""),
        "pincode": address.get("pincode", ""),
        "alternate_phone": customer.get("alternate_phone", ""),
        "food_preference": customer.get("food_preference", "Both"),
        "profile_image": customer.get("profile_image", ""),
        "profile_completed": customer.get("profile_completed", False)
    }


@router.post("/complete")
async def complete_customer_profile(
    profile: CustomerProfile,
    customer: dict = Depends(get_current_customer)
):
    pincode = profile.pincode.strip()
    if not re.fullmatch(r"[0-9]{6}", pincode):
        raise HTTPException(status_code=400, detail="Enter a valid 6-digit pincode.")

    alternate_phone = profile.alternate_phone.strip()
    validate_phone(alternate_phone, "alternate phone number")

    if profile.food_preference not in [
        "Vegetarian", "Non-vegetarian", "Both"
    ]:
        raise HTTPException(status_code=400, detail="Invalid food preference.")

    address = {
        "house_number": profile.house_number.strip(),
        "street": profile.street.strip(),
        "area": profile.area.strip(),
        "landmark": profile.landmark.strip(),
        "city": profile.city.strip(),
        "state": profile.state.strip(),
        "pincode": pincode
    }

    await database.users.update_one(
        {"_id": customer["_id"]},
        {"$set": {
            "address": address,
            "alternate_phone": alternate_phone,
            "food_preference": profile.food_preference,
            "profile_completed": True,
            "updated_at": datetime.now(timezone.utc)
        }}
    )

    return {
        "success": True,
        "message": "Profile details saved successfully.",
        "profile": profile_response({
            **customer,
            "address": address,
            "alternate_phone": alternate_phone,
            "food_preference": profile.food_preference,
            "profile_completed": True
        })
    }


@router.get("/me")
async def get_customer_profile(
    customer: dict = Depends(get_current_customer)
):
    return {
        "success": True,
        "profile": profile_response(customer)
    }


@router.put("/update")
async def update_customer_profile(
    request: ProfileUpdate,
    customer: dict = Depends(get_current_customer)
):
    values = request.dict(exclude_unset=True)

    if not values:
        raise HTTPException(status_code=400, detail="No profile changes provided.")

    updates = {}

    if "name" in values and values["name"] is not None:
        name = values["name"].strip()
        if len(name) < 2:
            raise HTTPException(status_code=400, detail="Enter a valid name.")
        updates["name"] = name

    if "email" in values and values["email"] is not None:
        email = str(values["email"]).lower().strip()
        existing = await database.users.find_one({
            "email": email,
            "_id": {"$ne": customer["_id"]}
        })
        if existing:
            raise HTTPException(status_code=400, detail="This email is already registered.")
        updates["email"] = email

    if "phone" in values and values["phone"] is not None:
        phone = values["phone"].strip()
        validate_phone(phone, "phone number")
        updates["phone"] = phone

    if "alternate_phone" in values and values["alternate_phone"] is not None:
        alternate_phone = values["alternate_phone"].strip()
        validate_phone(alternate_phone, "alternate phone number")
        updates["alternate_phone"] = alternate_phone

    address_fields = [
        "house_number", "street", "area", "landmark",
        "city", "state", "pincode"
    ]

    address = dict(customer.get("address") or {})
    address_changed = False

    for field in address_fields:
        if field in values and values[field] is not None:
            value = values[field].strip()
            if field == "pincode" and value and not re.fullmatch(r"[0-9]{6}", value):
                raise HTTPException(status_code=400, detail="Pincode must contain 6 digits.")
            address[field] = value
            address_changed = True

    if address_changed:
        updates["address"] = address

    if "food_preference" in values and values["food_preference"] is not None:
        preference = values["food_preference"]
        if preference not in ["Vegetarian", "Non-vegetarian", "Both"]:
            raise HTTPException(status_code=400, detail="Invalid food preference.")
        updates["food_preference"] = preference

    updates["updated_at"] = datetime.now(timezone.utc)

    await database.users.update_one(
        {"_id": customer["_id"]},
        {"$set": updates}
    )

    updated_customer = await database.users.find_one({
        "_id": customer["_id"]
    })

    return {
        "success": True,
        "message": "Profile updated successfully.",
        "profile": profile_response(updated_customer)
    }


@router.post("/photo")
async def upload_profile_photo(
    file: UploadFile = File(...),
    customer: dict = Depends(get_current_customer)
):
    content_type = (file.content_type or "").lower()

    if content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Only JPG, PNG and WEBP images are allowed."
        )

    contents = await file.read(5 * 1024 * 1024 + 1)

    if not contents:
        raise HTTPException(status_code=400, detail="The selected image is empty.")

    if len(contents) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Image size must be 5 MB or less.")

    extension = ALLOWED_IMAGE_TYPES[content_type]
    filename = f"{customer_id_string(customer)}_{uuid.uuid4().hex}{extension}"
    destination = PROFILE_IMAGE_DIR / filename

    with destination.open("wb") as image_file:
        image_file.write(contents)

    image_url = f"/static/profile_images/{filename}"

    old_image = customer.get("profile_image", "")
    if old_image.startswith("/static/profile_images/"):
        old_path = PROJECT_DIR / old_image.lstrip("/")
        if old_path.exists() and old_path.is_file():
            try:
                old_path.unlink()
            except OSError:
                pass

    await database.users.update_one(
        {"_id": customer["_id"]},
        {"$set": {
            "profile_image": image_url,
            "updated_at": datetime.now(timezone.utc)
        }}
    )

    return {
        "success": True,
        "message": "Profile photo updated successfully.",
        "profile_image": image_url
    }


@router.delete("/account")
async def delete_customer_account(
    request: DeleteAccountRequest,
    customer: dict = Depends(get_current_customer)
):
    stored_password = customer.get("password", "")

    try:
        password_matches = bcrypt.checkpw(
            request.password.encode("utf-8"),
            stored_password.encode("utf-8")
        )
    except (ValueError, TypeError):
        password_matches = False

    if not password_matches:
        raise HTTPException(status_code=400, detail="Incorrect password.")

    customer_id = customer_id_string(customer)

    # Remove customer-owned data from these collections.
    await database.favorites.delete_many({"customer_id": customer_id})
    await database.carts.delete_many({"customer_id": customer_id})
    await database.feedback.delete_many({"customer_id": customer_id})

    # Preserve historical orders; remove the account and its login access.
    await database.users.delete_one({"_id": customer["_id"]})

    old_image = customer.get("profile_image", "")
    if old_image.startswith("/static/profile_images/"):
        old_path = PROJECT_DIR / old_image.lstrip("/")
        if old_path.exists() and old_path.is_file():
            try:
                old_path.unlink()
            except OSError:
                pass

    return {
        "success": True,
        "message": "Your account has been deleted successfully."
    }
