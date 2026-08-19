from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from pymongo import MongoClient
from dotenv import load_dotenv
import os
import hashlib

load_dotenv()

router = APIRouter(
    prefix="/customer",
    tags=["Customer Login"]
)

# MongoDB connection
client = MongoClient(os.getenv("MONGODB_URL"))

db = client["mainfood"]
customers_collection = db["customers"]


# -------------------------------------------------
# Login request model
# -------------------------------------------------

class CustomerLogin(BaseModel):
    email: EmailStr
    password: str


# -------------------------------------------------
# Customer Login
# -------------------------------------------------

@router.post("/login")
async def login_customer(customer: CustomerLogin):

    # Hash entered password
    hashed_password = hashlib.sha256(
        customer.password.encode()
    ).hexdigest()

    # Find customer
    existing_customer = customers_collection.find_one(
        {
            "email": customer.email,
            "password": hashed_password
        }
    )

    # Customer not found
    if not existing_customer:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    return {
        "success": True,
        "message": "Login successful",
        "customer_name": existing_customer["customer_name"],
        "email": existing_customer["email"]
    }