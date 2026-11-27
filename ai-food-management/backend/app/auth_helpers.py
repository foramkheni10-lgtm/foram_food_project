
import os
import smtplib
import secrets
import hashlib
import ssl
from pathlib import Path
from datetime import datetime, timedelta, timezone
from email.message import EmailMessage
from dotenv import load_dotenv

from app.db_config import db


# ==========================================
# ENVIRONMENT CONFIGURATION
# ==========================================

BASE_DIR = Path(__file__).resolve().parent.parent
ENV_FILE = BASE_DIR / ".env"

load_dotenv(dotenv_path=ENV_FILE)


# ==========================================
# DATABASE COLLECTIONS
# ==========================================

otp_collection = db["auth_otps"]
login_attempts_collection = db["login_attempts"]


# ==========================================
# SECURITY SETTINGS
# ==========================================

LOCK_AFTER_ATTEMPTS = 3
LOCK_DURATION_SECONDS = 120

OTP_EXPIRY_SECONDS = 60
OTP_RESEND_SECONDS = 60
OTP_MAX_ATTEMPTS = 5


# ==========================================
# TIME AND HASH HELPERS
# ==========================================

def now_utc():
    return datetime.now(timezone.utc)


def normalize_email(email):
    return str(email).strip().lower()


def normalize_datetime(value):
    if value and value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value


def hash_otp(otp):
    return hashlib.sha256(
        str(otp).strip().encode("utf-8")
    ).hexdigest()


# ==========================================
# SEND EMAIL
# ==========================================


def send_email_otp(email, otp, purpose="verification"):

    gmail_address = os.getenv("GMAIL_ADDRESS")
    gmail_password = os.getenv("GMAIL_APP_PASSWORD")

    if not gmail_address or not gmail_password:
        raise RuntimeError(
            "Gmail SMTP settings are missing in backend .env"
        )

    if purpose == "password_reset":
        heading = "Password Reset"
        description = (
            "Use this OTP to reset your Smart FoodCourt password."
        )

    elif purpose == "signup":
        heading = "Account Email Verification"
        description = (
            "Use this OTP to verify your Smart FoodCourt account."
        )

    elif purpose == "restaurant_signup":
        heading = "Restaurant Email Verification"
        description = (
            "Use this OTP to verify your Smart FoodCourt restaurant account."
        )

    else:
        heading = "Email Verification"
        description = (
            "Use this OTP to verify your Smart FoodCourt email address."
        )

    message = EmailMessage()
    message["Subject"] = "Smart FoodCourt - " + heading
    message["From"] = gmail_address
    message["To"] = normalize_email(email)

    message.set_content(
        "Hello,\n\n"
        + heading
        + "\n\n"
        + description
        + "\n\n"
        + "Your OTP is: "
        + otp
        + "\n\n"
        + "This OTP expires in 60 seconds.\n"
        + "Do not share this OTP with anyone.\n\n"
        + "Smart FoodCourt\n"
        + "Eat Smart - Live Better."
    )

    context = ssl.create_default_context()

    with smtplib.SMTP(
        "smtp.gmail.com", 587, timeout=30
    ) as server:
        server.ehlo()
        server.starttls(context=context)
        server.ehlo()

        server.login(gmail_address, gmail_password)
        server.send_message(message)

# ==========================================
# CREATE AND SEND OTP
# ==========================================

def create_and_send_otp(
    email,
    purpose="verification",
    extra_data=None
):

    email = normalize_email(email)
    now = now_utc()

    existing = otp_collection.find_one({
        "email": email,
        "purpose": purpose
    })

    if existing:
        created_at = normalize_datetime(
            existing.get("created_at")
        )

        if created_at:
            elapsed = (now - created_at).total_seconds()

            if elapsed < OTP_RESEND_SECONDS:
                remaining = max(
                    1,
                    int(OTP_RESEND_SECONDS - elapsed)
                )

                raise ValueError(
                    "Please wait "
                    + str(remaining)
                    + " seconds before requesting another OTP."
                )

    otp = str(secrets.randbelow(900000) + 100000)

    document = {
        "email": email,
        "purpose": purpose,
        "otp_hash": hash_otp(otp),
        "created_at": now,
        "expires_at": now + timedelta(
            seconds=OTP_EXPIRY_SECONDS
        ),
        "attempts": 0,
        "extra_data": extra_data or {}
    }

    # Save OTP before sending email.
    otp_collection.replace_one(
        {
            "email": email,
            "purpose": purpose
        },
        document,
        upsert=True
    )

    try:
        send_email_otp(email, otp, purpose)

    except Exception:
        otp_collection.delete_one({
            "email": email,
            "purpose": purpose
        })
        raise

    return True


# ==========================================
# VERIFY AND CONSUME OTP
# ==========================================

def verify_and_consume_otp(
    email,
    otp,
    purpose="verification"
):

    email = normalize_email(email)
    now = now_utc()

    record = otp_collection.find_one({
        "email": email,
        "purpose": purpose
    })

    if not record:
        return None

    expires_at = normalize_datetime(
        record.get("expires_at")
    )

    if not expires_at or now >= expires_at:
        otp_collection.delete_one({
            "_id": record["_id"]
        })
        return None

    attempts = int(record.get("attempts", 0))

    if attempts >= OTP_MAX_ATTEMPTS:
        otp_collection.delete_one({
            "_id": record["_id"]
        })
        return None

    supplied_hash = hash_otp(otp)
    stored_hash = record.get("otp_hash", "")

    if not secrets.compare_digest(
        stored_hash,
        supplied_hash
    ):

        otp_collection.update_one(
            {
                "_id": record["_id"],
                "attempts": {"$lt": OTP_MAX_ATTEMPTS}
            },
            {
                "$inc": {
                    "attempts": 1
                }
            }
        )

        latest = otp_collection.find_one({
            "_id": record["_id"]
        })

        if latest and latest.get("attempts", 0) >= OTP_MAX_ATTEMPTS:
            otp_collection.delete_one({
                "_id": record["_id"]
            })

        return None

    # Consume OTP so it cannot be reused.
    otp_collection.delete_one({
        "_id": record["_id"]
    })

    return record.get("extra_data", {})


# ==========================================
# CHECK LOGIN LOCK
# ==========================================

def check_login_lock(email, account_type="customer"):

    email = normalize_email(email)
    now = now_utc()

    record = login_attempts_collection.find_one({
        "email": email,
        "account_type": account_type
    })

    if not record:
        return 0

    locked_until = normalize_datetime(
        record.get("locked_until")
    )

    if not locked_until:
        return 0

    remaining = int(
        (locked_until - now).total_seconds()
    )

    if remaining > 0:
        return remaining

    # Lock expired. Reset the failed attempts.
    login_attempts_collection.delete_one({
        "_id": record["_id"]
    })

    return 0


# ==========================================
# RECORD FAILED LOGIN
# ==========================================

def record_failed_login(email, account_type="customer"):

    email = normalize_email(email)
    now = now_utc()

    record = login_attempts_collection.find_one({
        "email": email,
        "account_type": account_type
    })

    if record and record.get("locked_until"):

        remaining = check_login_lock(
            email,
            account_type
        )

        if remaining > 0:
            return remaining

    login_attempts_collection.update_one(
        {
            "email": email,
            "account_type": account_type
        },
        {
            "$inc": {
                "failed_attempts": 1
            },
            "$setOnInsert": {
                "email": email,
                "account_type": account_type
            }
        },
        upsert=True
    )

    updated = login_attempts_collection.find_one({
        "email": email,
        "account_type": account_type
    })

    if (
        updated
        and updated.get("failed_attempts", 0) >= LOCK_AFTER_ATTEMPTS
    ):

        locked_until = now + timedelta(
            seconds=LOCK_DURATION_SECONDS
        )

        login_attempts_collection.update_one(
            {
                "_id": updated["_id"]
            },
            {
                "$set": {
                    "locked_until": locked_until
                }
            }
        )

        return LOCK_DURATION_SECONDS

    return 0


# ==========================================
# CLEAR LOGIN ATTEMPTS AFTER SUCCESS
# ==========================================

def clear_login_attempts(email, account_type="customer"):

    login_attempts_collection.delete_one({
        "email": normalize_email(email),
        "account_type": account_type
    })
