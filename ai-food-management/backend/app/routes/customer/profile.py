import re

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from app.database import database
from app.security import get_current_customer

router = APIRouter(
    prefix="/customer/profile",
    tags=["Customer Profile"]
)


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


@router.post("/complete")
async def complete_customer_profile(
    profile: CustomerProfile,
    customer: dict = Depends(get_current_customer)
):
    pincode = profile.pincode.strip()

    if not re.fullmatch(r"[0-9]{6}", pincode):
        raise HTTPException(
            status_code=400,
            detail="Enter a valid 6-digit PIN code."
        )

    alternate_phone = profile.alternate_phone.strip()

    if alternate_phone and not re.fullmatch(
        r"[+]?[0-9]{10,15}", alternate_phone
    ):
        raise HTTPException(
            status_code=400,
            detail="Enter a valid alternate phone number."
        )

    if profile.food_preference not in [
        "Vegetarian",
        "Non-vegetarian",
        "Both"
    ]:
        raise HTTPException(
            status_code=400,
            detail="Choose a valid food preference."
        )

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
        {
            "$set": {
                "address": address,
                "alternate_phone": alternate_phone,
                "food_preference": profile.food_preference,
                "profile_completed": True
            }
        }
    )

    return {
        "success": True,
        "message": "Your profile has been completed successfully.",
        "profile_completed": True
    }


@router.get("/me")
async def get_customer_profile(
    customer: dict = Depends(get_current_customer)
):
    return {
        "success": True,
        "profile": {
            "name": customer.get("name", ""),
            "email": customer.get("email", ""),
            "phone": customer.get("phone", ""),
            "address": customer.get("address", {}),
            "alternate_phone": customer.get("alternate_phone", ""),
            "food_preference": customer.get("food_preference", ""),
            "profile_completed": customer.get(
                "profile_completed", False
            )
        }
    }