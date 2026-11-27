
import hashlib
import uuid
from decimal import Decimal, InvalidOperation
from datetime import datetime, timezone
from typing import Optional
import httpx
from datetime import timedelta
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Form
from pydantic import BaseModel

from app.database import database
from app.security import get_current_customer
from app.payu_config import PAYU_KEY, PAYU_SALT, PAYU_BASE_URL
from app.routes.customer.cart import (
    validate_customizations,
    calculate_customization_price
)


router = APIRouter(
    prefix="/api/payu",
    tags=["PayU Payments"]
)


class DeliveryAddress(BaseModel):
    house_number: str
    street: str
    area: str
    landmark: Optional[str] = ""
    city: str
    state: str
    pincode: str


class PaymentRequest(BaseModel):
    delivery_type: str
    table_number: Optional[str] = None
    delivery_address: Optional[DeliveryAddress] = None


async def verify_payu_transaction(txnid):
    command = "verify_payment"

    hash_string = (
        f"{PAYU_KEY}|{command}|{txnid}|{PAYU_SALT}"
    )

    verify_hash = hashlib.sha512(
        hash_string.encode("utf-8")
    ).hexdigest()

    verify_url = (
        f"{PAYU_BASE_URL}/merchant/postservice.php?form=2"
    )

    payload = {
        "key": PAYU_KEY,
        "command": command,
        "var1": txnid,
        "hash": verify_hash
    }

    try:
        async with httpx.AsyncClient(timeout=20.0) as client:
            response = await client.post(
                verify_url,
                data=payload
            )
            response.raise_for_status()
            result = response.json()

        details = result.get("transaction_details", {})
        transaction = details.get(txnid)

        if not transaction:
            return None

        return transaction

    except (httpx.HTTPError, ValueError):
        raise HTTPException(
            status_code=502,
            detail="Unable to verify payment with PayU."
        )


def verify_payu_response_hash(data):
    status = data.get("status", "")
    key = data.get("key", "")
    txnid = data.get("txnid", "")
    amount = data.get("amount", "")
    productinfo = data.get("productinfo", "")
    firstname = data.get("firstname", "")
    email = data.get("email", "")

    udf1 = data.get("udf1", "")
    udf2 = data.get("udf2", "")
    udf3 = data.get("udf3", "")
    udf4 = data.get("udf4", "")
    udf5 = data.get("udf5", "")

    additional_charges = data.get("additionalCharges", "")

    hash_string = (
        f"{PAYU_SALT}|{status}||||||"
        f"{udf5}|{udf4}|{udf3}|{udf2}|{udf1}|"
        f"{email}|{firstname}|{productinfo}|"
        f"{amount}|{txnid}|{key}"
    )

    if additional_charges:
        hash_string = (
            f"{additional_charges}|{hash_string}"
        )

    calculated_hash = hashlib.sha512(
        hash_string.encode("utf-8")
    ).hexdigest()

    received_hash = data.get("hash", "")

    return (
        bool(received_hash)
        and calculated_hash.lower() == received_hash.lower()
    )

async def get_verified_payment(data):
    # 1. Verify PayU callback hash
    if not verify_payu_response_hash(data):
        raise HTTPException(
            status_code=400,
            detail="Invalid PayU payment response."
        )

    txnid = data.get("txnid", "")

    if not txnid:
        raise HTTPException(
            status_code=400,
            detail="Transaction ID is missing."
        )

    # 2. Find our pending payment
    payment = await database.payments.find_one({
        "txnid": txnid
    })

    if not payment:
        raise HTTPException(
            status_code=404,
            detail="Payment record not found."
        )

    # 3. Verify directly with PayU
    transaction = await verify_payu_transaction(txnid)

    if not transaction:
        raise HTTPException(
            status_code=400,
            detail="PayU transaction could not be verified."
        )

    # 4. Confirm transaction status and amount
    if str(transaction.get("status", "")).lower() != "success":
        raise HTTPException(
            status_code=400,
            detail="Payment was not successful."
        )

    if str(transaction.get("txnid", txnid)) != txnid:
        raise HTTPException(
            status_code=400,
            detail="Transaction ID mismatch."
        )

    try:
        callback_amount = Decimal(str(data.get("amount", "")))
        verified_amount = Decimal(str(transaction.get("amount", "")))
        stored_amount = Decimal(str(payment.get("amount", "")))
    except (InvalidOperation, ValueError, TypeError):
        raise HTTPException(
            status_code=400,
            detail="Invalid payment amount."
        )

    if not (
        callback_amount == verified_amount == stored_amount
    ):
        raise HTTPException(
            status_code=400,
            detail="Payment amount mismatch."
        )

    return payment

def get_food_price(food):
    raw_price = food.get("price", 0)

    try:
        if isinstance(raw_price, str):
            raw_price = (
                raw_price.replace("₹", "")
                .replace(",", "")
                .strip()
            )

        price = Decimal(str(raw_price))

        if not price.is_finite() or price < 0:
            raise ValueError("Invalid price")

        return price

    except (InvalidOperation, ValueError, TypeError):
        raise HTTPException(
            status_code=400,
            detail="Invalid food price in database."
        )


@router.get("/test")
async def payu_test():
    return {
        "success": True,
        "message": "PayU payment router is connected successfully"
    }


@router.post("/initiate")
async def initiate_payment(
    request: PaymentRequest,
    customer=Depends(get_current_customer)
):
    # Check PayU credentials
    if not PAYU_KEY or not PAYU_SALT:
        raise HTTPException(
            status_code=503,
            detail="PayU credentials are not configured yet."
        )

    # Validate order type
    if request.delivery_type not in [
        "dine_in", "take_away", "delivery"
    ]:
        raise HTTPException(
            status_code=400,
            detail="Invalid delivery type."
        )

    if (
        request.delivery_type == "dine_in"
        and not request.table_number
    ):
        raise HTTPException(
            status_code=400,
            detail="Table number is required."
        )

    # Validate delivery address
    if request.delivery_type == "delivery":
        if not request.delivery_address:
            raise HTTPException(
                status_code=400,
                detail="Delivery address is required."
            )

        address = request.delivery_address

        required_fields = [
            address.house_number,
            address.street,
            address.area,
            address.city,
            address.state,
            address.pincode
        ]

        if any(not value.strip() for value in required_fields):
            raise HTTPException(
                status_code=400,
                detail="Complete all required address fields."
            )

        if (
            not address.pincode.isdigit()
            or len(address.pincode) != 6
        ):
            raise HTTPException(
                status_code=400,
                detail="Pincode must contain exactly 6 digits."
            )

    customer_id = str(customer["_id"])

    # Fetch customer cart
    cart = await database.carts.find_one({
        "customer_id": customer_id
    })

    if not cart or not cart.get("items"):
        raise HTTPException(
            status_code=400,
            detail="Your cart is empty."
        )

    total = Decimal("0.00")
    order_items = []

    # Calculate prices using MongoDB data
    for item in cart["items"]:
        food_id = item.get("food_id")
        food = None

        if ObjectId.is_valid(str(food_id)):
            food = await database.foods.find_one({
                "_id": ObjectId(food_id)
            })

        if not food:
            food = await database.foods.find_one({
                "_id": food_id
            })

        if not food:
            raise HTTPException(
                status_code=404,
                detail="Food item not found."
            )

        if (
            food.get("available") is False
            or food.get("availability") is False
        ):
            raise HTTPException(
                status_code=400,
                detail="A cart item is unavailable."
            )

        quantity = int(item.get("quantity", 1))

        if quantity < 1 or quantity > 99:
            raise HTTPException(
                status_code=400,
                detail="Invalid item quantity."
            )

        customizations = validate_customizations(
            food,
            item.get("customizations", [])
        )

        base_price = get_food_price(food)

        customization_total = Decimal(
            str(calculate_customization_price(customizations))
        )

        unit_price = base_price + customization_total
        subtotal = unit_price * quantity

        total += subtotal

        order_items.append({
            "food_id": str(food["_id"]),
            "name": (
                food.get("name")
                or food.get("food_name", "Food")
            ),
            "quantity": quantity,
            "base_price": float(base_price),
            "customizations": customizations,
            "customization_total": float(customization_total),
            "price": float(unit_price),
            "subtotal": float(subtotal),
            "special_instructions": item.get(
                "special_instructions", ""
            )
        })

    if total <= 0:
        raise HTTPException(
            status_code=400,
            detail="Invalid payment amount."
        )

    # Prepare PayU transaction
    amount = f"{total:.2f}"
    txnid = uuid.uuid4().hex
    
    

    table_doc = None

    if request.delivery_type == "dine_in":
        table_doc = await database.tables.find_one({
            "$or": [
                {"table_number_key": request.table_number},
                {"table_number": request.table_number}
            ]
        })

        if (
            not table_doc
            or str(table_doc.get("manual_status", "")).lower() != "available"
        ):
            raise HTTPException(
                status_code=409,
                detail="This table is no longer available."
            )

        reservation_result = await database.tables.update_one(
            {
                "_id": table_doc["_id"],
                "manual_status": {
                    "$regex": "^available$",
                    "$options": "i"
                }
            },
            {
                "$set": {
                    "manual_status": "Reserved",
                    "reserved_txnid": txnid,
                    "reserved_customer_id": customer_id,
                    "reservation_expires_at": (
                        datetime.now(timezone.utc)
                        + timedelta(minutes=15)
                    )
                }
            }
        )

        if reservation_result.modified_count != 1:
            raise HTTPException(
                status_code=409,
                detail="This table has already been reserved."
            )


    productinfo = "Smart FoodCourt Order"
    firstname = customer.get("name", "Customer")
    email = customer.get("email", "")
    phone = customer.get("phone", "")

    if not email:
        raise HTTPException(
            status_code=400,
            detail="Customer email is required."
        )

    udf1 = customer_id
    udf2 = request.delivery_type
    udf3 = ""
    udf4 = ""
    udf5 = ""

    # Generate PayU request hash
    hash_string = (
        f"{PAYU_KEY}|{txnid}|{amount}|{productinfo}|"
        f"{firstname}|{email}|{udf1}|{udf2}|{udf3}|"
        f"{udf4}|{udf5}||||||{PAYU_SALT}"
    )

    payment_hash = hashlib.sha512(
        hash_string.encode("utf-8")
    ).hexdigest()

    # Save pending payment; do not clear the cart
        # Save pending payment; do not clear the cart
    try:
        await database.payments.insert_one({
            "txnid": txnid,
            "customer_id": customer_id,
            "amount": amount,
            "delivery_type": request.delivery_type,
            "table_number": request.table_number,
            "delivery_address": (
                request.delivery_address.dict()
                if request.delivery_address else None
            ),
            "items": order_items,
            "payment_status": "Pending",
            "order_status": "Pending Payment",
            "created_at": datetime.now(timezone.utc)
        })

    except Exception:
        if table_doc:
            await database.tables.update_one(
                {
                    "_id": table_doc["_id"],
                    "reserved_txnid": txnid
                },
                {
                    "$set": {
                        "manual_status": "Available"
                    },
                    "$unset": {
                        "reserved_txnid": "",
                        "reserved_customer_id": "",
                        "reservation_expires_at": ""
                    }
                }
            )

        raise



    return {
        "success": True,
        "payment_url": f"{PAYU_BASE_URL}/_payment",
        "params": {
            "key": PAYU_KEY,
            "txnid": txnid,
            "amount": amount,
            "productinfo": productinfo,
            "firstname": firstname,
            "email": email,
            "phone": phone,
            "udf1": udf1,
            "udf2": udf2,
            "udf3": udf3,
            "udf4": udf4,
            "udf5": udf5,
            "surl": (
                "https://foram-food-project.onrender.com"
                "/api/payu/success"
            ),
            "furl": (
                "https://foram-food-project.onrender.com"
                "/api/payu/failure"
            ),
            "hash": payment_hash
        }
    }

@router.post("/success")
async def payu_success(
    status: str = Form(""),
    key: str = Form(""),
    txnid: str = Form(""),
    amount: str = Form(""),
    productinfo: str = Form(""),
    firstname: str = Form(""),
    email: str = Form(""),
    phone: str = Form(""),
    hash: str = Form(""),
    udf1: str = Form(""),
    udf2: str = Form(""),
    udf3: str = Form(""),
    udf4: str = Form(""),
    udf5: str = Form(""),
    additionalCharges: str = Form("")
):
    callback_data = {
        "status": status,
        "key": key,
        "txnid": txnid,
        "amount": amount,
        "productinfo": productinfo,
        "firstname": firstname,
        "email": email,
        "phone": phone,
        "hash": hash,
        "udf1": udf1,
        "udf2": udf2,
        "udf3": udf3,
        "udf4": udf4,
        "udf5": udf5,
        "additionalCharges": additionalCharges
    }

    payment = await get_verified_payment(callback_data)

    # Prevent duplicate order creation
    claim = await database.payments.update_one(
        {
            "txnid": txnid,
            "payment_status": "Pending"
        },
        {
            "$set": {
                "payment_status": "Processing"
            }
        }
    )

    if claim.modified_count != 1:
        existing_order = await database.orders.find_one({
            "payu_txnid": txnid
        })

        if existing_order:
            return {
                "success": True,
                "message": "Payment and order already confirmed.",
                "order_number": existing_order.get("order_number")
            }

        raise HTTPException(
            status_code=409,
            detail="Payment is already being processed."
        )

    order_number = "SFC-" + uuid.uuid4().hex[:10].upper()
    table_doc = None
    order_created = False

    try:
        customer_id = payment["customer_id"]
        delivery_type = payment["delivery_type"]

        if delivery_type == "dine_in":
            table_doc = await database.tables.find_one({
                "reserved_txnid": txnid,
                "manual_status": "Reserved"
            })

            if not table_doc:
                raise HTTPException(
                    status_code=409,
                    detail="Your table reservation has expired."
                )

        order = {
            "order_number": order_number,
            "customer_id": customer_id,
            "customer_name": firstname,
            "customer_email": email,
            "phone": phone,
            "alternate_phone": "",
            "delivery_type": delivery_type,
            "delivery_address": payment.get("delivery_address"),
            "table_id": (
                str(table_doc["_id"]) if table_doc else None
            ),
            "table_number": (
                payment.get("table_number") if table_doc else None
            ),
            "items": payment["items"],
            "total_items": sum(
                int(item.get("quantity", 0))
                for item in payment["items"]
            ),
            "total_price": float(Decimal(payment["amount"])),
            "payment_method": "PayU Online",
            "payment_status": "Paid",
            "order_status": "Placed",
            "payu_txnid": txnid,
            "created_at": datetime.now(timezone.utc)
        }

        await database.orders.insert_one(order)
        order_created = True

        if table_doc:
            table_update = await database.tables.update_one(
                {
                    "_id": table_doc["_id"],
                    "reserved_txnid": txnid,
                    "manual_status": "Reserved"
                },
                {
                    "$set": {
                        "manual_status": "Occupied",
                        "reserved_order_number": order_number,
                        "reserved_customer_id": customer_id
                    },
                    "$unset": {
                        "reserved_txnid": "",
                        "reservation_expires_at": ""
                    }
                }
            )

            if table_update.modified_count != 1:
                await database.orders.delete_one({
                    "payu_txnid": txnid
                })
                order_created = False

                raise HTTPException(
                    status_code=409,
                    detail="Unable to confirm your table reservation."
                )

        await database.payments.update_one(
            {"txnid": txnid},
            {
                "$set": {
                    "payment_status": "Paid",
                    "order_status": "Placed",
                    "order_number": order_number,
                    "paid_at": datetime.now(timezone.utc)
                }
            }
        )

        await database.carts.delete_one({
            "customer_id": customer_id
        })

        return {
            "success": True,
            "message": "Payment successful. Your order is confirmed.",
            "order_number": order_number
        }

    except Exception:
        if not order_created:
            await database.payments.update_one(
                {
                    "txnid": txnid,
                    "payment_status": "Processing"
                },
                {
                    "$set": {
                        "payment_status": "Pending"
                    }
                }
            )

        raise

@router.post("/failure")
async def payu_failure(
    status: str = Form(""),
    key: str = Form(""),
    txnid: str = Form(""),
    amount: str = Form(""),
    productinfo: str = Form(""),
    firstname: str = Form(""),
    email: str = Form(""),
    phone: str = Form(""),
    hash: str = Form(""),
    udf1: str = Form(""),
    udf2: str = Form(""),
    udf3: str = Form(""),
    udf4: str = Form(""),
    udf5: str = Form(""),
    additionalCharges: str = Form("")
):
    callback_data = {
        "status": status,
        "key": key,
        "txnid": txnid,
        "amount": amount,
        "productinfo": productinfo,
        "firstname": firstname,
        "email": email,
        "phone": phone,
        "hash": hash,
        "udf1": udf1,
        "udf2": udf2,
        "udf3": udf3,
        "udf4": udf4,
        "udf5": udf5,
        "additionalCharges": additionalCharges
    }

    if not verify_payu_response_hash(callback_data):
        raise HTTPException(
            status_code=400,
            detail="Invalid PayU payment response."
        )

    payment = await database.payments.find_one({
        "txnid": txnid
    })

    if not payment:
        raise HTTPException(
            status_code=404,
            detail="Payment record not found."
        )

    if payment.get("payment_status") == "Paid":
        return {
            "success": True,
            "message": "This payment was already confirmed."
        }

    # Check PayU directly before treating this as a failure
    transaction = await verify_payu_transaction(txnid)

    if transaction and str(
        transaction.get("status", "")
    ).lower() == "success":
        raise HTTPException(
            status_code=409,
            detail="PayU reports this payment as successful. Please contact support."
        )

    await database.payments.update_one(
        {
            "txnid": txnid,
            "payment_status": {
                "$in": ["Pending", "Processing"]
            }
        },
        {
            "$set": {
                "payment_status": "Failed",
                "order_status": "Payment Failed",
                "failed_at": datetime.now(timezone.utc)
            }
        }
    )

    # Release the temporary dine-in reservation
    await database.tables.update_one(
        {
            "reserved_txnid": txnid,
            "manual_status": "Reserved"
        },
        {
            "$set": {
                "manual_status": "Available"
            },
            "$unset": {
                "reserved_txnid": "",
                "reserved_customer_id": "",
                "reservation_expires_at": ""
            }
        }
    )

    return {
        "success": False,
        "message": "Payment failed. Your cart has been kept. Please try again."
    }        