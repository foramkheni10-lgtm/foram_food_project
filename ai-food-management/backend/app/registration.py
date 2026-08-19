# from fastapi import APIRouter, HTTPException
# from pydantic import BaseModel, EmailStr
# from pymongo import MongoClient
# from dotenv import load_dotenv
# import os
# import hashlib

# load_dotenv()

# router = APIRouter(prefix="/customer", tags=["Customer Registration"])

# # MongoDB connection
# client = MongoClient(os.getenv("MONGODB_URL"))

# db = client["mainfood"]
# customers_collection = db["customers"]


# # -------------------------------------------------
# # Registration request model
# # -------------------------------------------------

# class CustomerRegistration(BaseModel):
#     customer_name: str
#     mobileno: str
#     email: EmailStr
#     password: str


# # -------------------------------------------------
# # Customer Registration
# # -------------------------------------------------

# @router.post("/register")
# async def register_customer(customer: CustomerRegistration):

#     # Check whether email already exists
#     existing_customer = customers_collection.find_one(
#         {"email": customer.email}
#     )

#     if existing_customer:
#         raise HTTPException(
#             status_code=400,
#             detail="Customer with this email already exists"
#         )

#     # Hash password
#     hashed_password = hashlib.sha256(
#         customer.password.encode()
#     ).hexdigest()

#     # Customer data
#     customer_data = {
#         "customer_name": customer.customer_name,
#         "mobileno": customer.mobileno,
#         "email": customer.email,
#         "password": hashed_password
#     }

#     # Save customer
#     result = customers_collection.insert_one(customer_data)

#     return {
#         "success": True,
#         "message": "Customer registered successfully",
#         "customer_id": str(result.inserted_id),
#         "next_page": "/login"
#     }

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from pymongo import MongoClient
from dotenv import load_dotenv
import os
import hashlib

load_dotenv()

router = APIRouter(
    prefix="/customer",
    tags=["Customer Registration"]
)

# -------------------------------------------------
# MongoDB connection
# -------------------------------------------------

client = MongoClient(os.getenv("MONGODB_URL"))

db = client["mainfood"]

customers_collection = db["customers"]


# -------------------------------------------------
# Registration request model
# -------------------------------------------------

class CustomerRegistration(BaseModel):
    customer_name: str
    mobileno: str
    email: EmailStr
    password: str


# -------------------------------------------------
# Customer Registration
# -------------------------------------------------

@router.post("/register")
async def register_customer(customer: CustomerRegistration):

    # Check whether email already exists
    existing_customer = customers_collection.find_one(
        {"email": customer.email}
    )

    if existing_customer:
        raise HTTPException(
            status_code=400,
            detail="Customer with this email already exists"
        )

    # Hash password
    hashed_password = hashlib.sha256(
        customer.password.encode()
    ).hexdigest()

    # Customer data
    customer_data = {
        "customer_name": customer.customer_name,
        "mobileno": customer.mobileno,
        "email": customer.email,
        "password": hashed_password
    }

    # Save customer
    result = customers_collection.insert_one(customer_data)

    return {
        "success": True,
        "message": "Customer registered successfully",
        "customer_id": str(result.inserted_id),
        "next_page": "/login"
    }