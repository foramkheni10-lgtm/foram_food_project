
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr, Field

from app.database import database
from app.auth_helpers import (
    create_and_send_otp,
    verify_and_consume_otp,
    otp_collection
)

import bcrypt


router = APIRouter(
    prefix="/customer",
    tags=["Customer Registration and Password Recovery"]
)


# ==========================================
# REQUEST MODELS
# ==========================================

class CustomerRegistration(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(min_length=8, max_length=72)
    confirm_password: str = Field(min_length=8, max_length=72)
    phone: str = Field(min_length=10, max_length=15)
    terms_accepted: bool
    privacy_accepted: bool


class EmailVerification(BaseModel):
    email: EmailStr
    otp: str = Field(min_length=6, max_length=6)


class ResendVerification(BaseModel):
    email: EmailStr


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    email: EmailStr
    otp: str = Field(min_length=6, max_length=6)
    new_password: str = Field(min_length=8, max_length=72)
    confirm_password: str = Field(min_length=8, max_length=72)


# ==========================================
# CUSTOMER REGISTRATION
# ==========================================

@router.post("/register")
async def register_customer(customer: CustomerRegistration):

    email = str(customer.email).lower().strip()

    if customer.password != customer.confirm_password:
        raise HTTPException(
            status_code=400,
            detail="Passwords do not match."
        )

    if len(customer.password.encode("utf-8")) > 72:
        raise HTTPException(
            status_code=400,
            detail="Password is too long."
        )

    if not customer.terms_accepted:
        raise HTTPException(
            status_code=400,
            detail="Please accept the Terms and Conditions."
        )

    if not customer.privacy_accepted:
        raise HTTPException(
            status_code=400,
            detail="Please accept the Privacy Policy."
        )

    existing_user = await database.users.find_one({
        "email": email
    })

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email is already registered."
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
        "role": "customer",
        "email_verified": False,
        "terms_accepted": True,
        "privacy_accepted": True,
        "consent_date": datetime.now(timezone.utc),
        "token_version": 0,
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

    try:
        create_and_send_otp(
            email,
            purpose="signup",
            extra_data=user_data
        )

    except ValueError as error:
        raise HTTPException(
            status_code=429,
            detail=str(error)
        )

    except Exception as error:
        print("SIGNUP EMAIL ERROR:", str(error))

        raise HTTPException(
            status_code=500,
            detail="Unable to send verification email. Check Gmail SMTP settings."
        )

    return {
        "success": True,
        "message": "Verification OTP sent to your email.",
        "email": email,
        "verification_required": True,
        "next_page": "/verify-email"
    }


# ==========================================
# VERIFY CUSTOMER EMAIL
# ==========================================

@router.post("/verify-email")
async def verify_customer_email(data: EmailVerification):

    email = str(data.email).lower().strip()

    pending_data = verify_and_consume_otp(
        email,
        data.otp,
        purpose="signup"
    )

    if not pending_data:
        raise HTTPException(
            status_code=400,
            detail="Invalid or expired OTP. Please request a new OTP."
        )

    existing_user = await database.users.find_one({
        "email": email
    })

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="This email is already registered."
        )

    pending_data["email_verified"] = True
    pending_data["email_verified_at"] = datetime.now(timezone.utc)

    result = await database.users.insert_one(pending_data)

    return {
        "success": True,
        "message": "Email verified and registration completed successfully.",
        "user_id": str(result.inserted_id),
        "next_page": "/login"
    }


# ==========================================
# RESEND SIGNUP VERIFICATION OTP
# ==========================================

@router.post("/resend-verification")
async def resend_customer_verification(data: ResendVerification):

    email = str(data.email).lower().strip()

    existing_user = await database.users.find_one({
        "email": email
    })

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="This email is already registered."
        )

    pending = otp_collection.find_one({
        "email": email,
        "purpose": "signup"
    })

    if not pending or not pending.get("extra_data"):
        raise HTTPException(
            status_code=404,
            detail="Registration not found. Please register again."
        )

    try:
        create_and_send_otp(
            email,
            purpose="signup",
            extra_data=pending["extra_data"]
        )

    except ValueError as error:
        raise HTTPException(
            status_code=429,
            detail=str(error)
        )

    except Exception as error:
        print("RESEND SIGNUP OTP ERROR:", str(error))

        raise HTTPException(
            status_code=500,
            detail="Unable to resend verification email."
        )

    return {
        "success": True,
        "message": "A new verification OTP has been sent."
    }


# ==========================================
# FORGOT PASSWORD - SEND OTP
# ==========================================

@router.post("/forgot-password")
async def forgot_password(data: ForgotPasswordRequest):

    email = str(data.email).lower().strip()

    existing_user = await database.users.find_one({
        "email": email
    })

    # Use the same response for unknown email addresses.
    generic_response = {
        "success": True,
        "message": (
            "If an account exists with this email, "
            "a password reset OTP has been sent."
        )
    }

    if not existing_user:
        return generic_response

    try:
        create_and_send_otp(
            email,
            purpose="password_reset"
        )

    except ValueError as error:
        raise HTTPException(
            status_code=429,
            detail=str(error)
        )

    except Exception as error:
        print("PASSWORD RESET EMAIL ERROR:", str(error))

        raise HTTPException(
            status_code=500,
            detail="Unable to send password reset OTP. Please try again."
        )

    return generic_response


# ==========================================
# RESET PASSWORD - VERIFY OTP AND UPDATE
# ==========================================

@router.post("/reset-password")
async def reset_password(data: ResetPasswordRequest):

    email = str(data.email).lower().strip()

    if data.new_password != data.confirm_password:
        raise HTTPException(
            status_code=400,
            detail="Passwords do not match."
        )

    if len(data.new_password.encode("utf-8")) > 72:
        raise HTTPException(
            status_code=400,
            detail="Password is too long."
        )

    existing_user = await database.users.find_one({
        "email": email
    })

    if not existing_user:
        raise HTTPException(
            status_code=400,
            detail="Invalid password reset request."
        )

    # Verify and consume the 60-second password reset OTP.
    # Empty extra_data ({}) is valid for password reset.
    otp_result = verify_and_consume_otp(
        email,
        data.otp,
        purpose="password_reset"
    )

    if otp_result is None:
        raise HTTPException(
            status_code=400,
            detail="Invalid or expired OTP. Please request a new OTP."
        )

    new_hashed_password = bcrypt.hashpw(
        data.new_password.encode("utf-8"),
        bcrypt.gensalt()
    ).decode("utf-8")

    # Update password and invalidate existing sessions.
    await database.users.update_one(
        {"_id": existing_user["_id"]},
        {
            "$set": {
                "password": new_hashed_password,
                "password_updated_at": datetime.now(timezone.utc)
            },
            "$inc": {
                "token_version": 1
            }
        }
    )

    return {
        "success": True,
        "message": "Password changed successfully. Please log in again.",
        "next_page": "/login"
    }
