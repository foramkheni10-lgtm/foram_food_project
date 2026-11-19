
from datetime import datetime, timezone
from uuid import uuid4
from typing import Optional

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.database import database
from app.security import get_current_customer


router = APIRouter(
    prefix="/api/orders",
    tags=["Customer Orders"]
)


# =====================================================
# MODELS
# =====================================================

class DeliveryAddress(BaseModel):
    house_number: str
    street: str
    area: str
    landmark: Optional[str] = ""
    city: str
    state: str
    pincode: str


class PlaceOrderRequest(BaseModel):
    payment_method: str = "Cash on Delivery"
    delivery_type: str = "delivery"
    table_number: Optional[str] = None
    delivery_address: Optional[DeliveryAddress] = None


# =====================================================
# HELPER FUNCTIONS
# =====================================================

def get_food_price(food: dict) -> float:
    raw_price = food.get("price", 0)

    if isinstance(raw_price, str):
        raw_price = raw_price.replace("₹", "").replace(",", "").strip()

    try:
        price = float(raw_price)
    except (ValueError, TypeError):
        raise HTTPException(
            status_code=400,
            detail="A food item has an invalid price."
        )

    if price < 0:
        raise HTTPException(
            status_code=400,
            detail="A food item has an invalid price."
        )

    return price


async def find_food(food_id: str):
    food = None

    if ObjectId.is_valid(food_id):
        food = await database.foods.find_one(
            {"_id": ObjectId(food_id)}
        )

    if not food:
        food = await database.foods.find_one(
            {"_id": food_id}
        )

    return food


def serialize_order(order: dict) -> dict:
    order["order_id"] = str(order.pop("_id"))
    return order


# =====================================================
# GET AVAILABLE TABLES
# =====================================================

@router.get("/available-tables")
async def get_available_tables(
    customer: dict = Depends(get_current_customer)
):
    cursor = database.tables.find(
        {
            "manual_status": {
                "$regex": "^available$",
                "$options": "i"
            }
        },
        {
            "table_number": 1,
            "capacity": 1
        }
    ).sort("table_number_key", 1)

    tables = []

    async for table in cursor:
        tables.append({
            "table_id": str(table["_id"]),
            "table_number": table.get("table_number", ""),
            "capacity": table.get("capacity", 0)
        })

    return {
        "success": True,
        "total_tables": len(tables),
        "tables": tables
    }


# =====================================================
# PLACE ORDER
# =====================================================

@router.post("/place")
async def place_order(
    request: PlaceOrderRequest,
    customer: dict = Depends(get_current_customer)
):

    # PAYMENT VALIDATION

    allowed_payment_methods = [
        "Cash on Delivery",
        "UPI",
        "Debit Card"
    ]

    if request.payment_method not in allowed_payment_methods:
        raise HTTPException(
            status_code=400,
            detail="Please select a valid payment method."
        )

    # ORDER TYPE VALIDATION

    allowed_delivery_types = [
        "dine_in",
        "take_away",
        "delivery"
    ]

    if request.delivery_type not in allowed_delivery_types:
        raise HTTPException(
            status_code=400,
            detail="Please select a valid order type."
        )

    # DINE-IN TABLE VALIDATION

    table_doc = None
    selected_table = None

    if request.delivery_type == "dine_in":

        if not request.table_number or not request.table_number.strip():
            raise HTTPException(
                status_code=400,
                detail="Please select a table."
            )

        selected_table = request.table_number.strip()

        table_doc = await database.tables.find_one({
            "$or": [
                {"table_number_key": selected_table},
                {"table_number": selected_table}
            ]
        })

        if not table_doc:
            raise HTTPException(
                status_code=404,
                detail="Selected table does not exist."
            )

        if str(table_doc.get("manual_status", "")).lower() != "available":
            raise HTTPException(
                status_code=409,
                detail="This table is no longer available. Please select another table."
            )

    # DELIVERY ADDRESS VALIDATION

    address = {}

    if request.delivery_type == "delivery":

        if not request.delivery_address:
            raise HTTPException(
                status_code=400,
                detail="Please enter your delivery address."
            )

        address = request.delivery_address.dict()

        required_fields = [
            "house_number",
            "street",
            "area",
            "city",
            "state",
            "pincode"
        ]

        for field in required_fields:
            if not str(address.get(field, "")).strip():
                raise HTTPException(
                    status_code=400,
                    detail=f"Please enter your {field.replace('_', ' ')}."
                )

        pincode = address["pincode"].strip()

        if not pincode.isdigit() or len(pincode) != 6:
            raise HTTPException(
                status_code=400,
                detail="Please enter a valid 6-digit pincode."
            )

        address = {
            key: value.strip() if isinstance(value, str) else value
            for key, value in address.items()
        }

    # CUSTOMER AND CART

    customer_id = str(customer["_id"])

    cart = await database.carts.find_one(
        {"customer_id": customer_id}
    )

    if not cart or not cart.get("items"):
        raise HTTPException(
            status_code=400,
            detail="Your cart is empty."
        )

    # VALIDATE CART ITEMS

    order_items = []
    total_price = 0.0

    for cart_item in cart["items"]:

        food = await find_food(cart_item["food_id"])

        if not food:
            raise HTTPException(
                status_code=400,
                detail="A food item in your cart no longer exists."
            )

        if (
            food.get("available") is False
            or food.get("availability") is False
        ):
            raise HTTPException(
                status_code=400,
                detail=f"{food.get('name', 'A food item')} is currently unavailable."
            )

        quantity = int(cart_item["quantity"])

        if quantity < 1 or quantity > 99:
            raise HTTPException(
                status_code=400,
                detail="Invalid item quantity in cart."
            )

        price = get_food_price(food)
        subtotal = price * quantity

        order_items.append({
            "food_id": str(food["_id"]),
            "name": food.get("name") or food.get("food_name", "Food"),
            "category": food.get("category", ""),
            "price": price,
            "quantity": quantity,
            "subtotal": subtotal
        })

        total_price += subtotal

    # CREATE ORDER DATA

    order_number = f"SFC-{uuid4().hex[:10].upper()}"

    order = {
        "order_number": order_number,
        "customer_id": customer_id,
        "customer_name": customer.get("name", ""),
        "customer_email": customer.get("email", ""),
        "phone": customer.get("phone", ""),
        "alternate_phone": customer.get("alternate_phone", ""),

        "delivery_type": request.delivery_type,
        "delivery_address": address,

        "table_id": (
            str(table_doc["_id"])
            if table_doc
            else None
        ),

        "table_number": (
            selected_table
            if request.delivery_type == "dine_in"
            else None
        ),

        "items": order_items,
        "total_items": sum(
            item["quantity"] for item in order_items
        ),
        "total_price": total_price,

        "payment_method": request.payment_method,
        "payment_status": "Pending",
        "order_status": "Placed",
        "created_at": datetime.now(timezone.utc)
    }

    # RESERVE TABLE ATOMICALLY

    if table_doc:

        reservation = await database.tables.update_one(
            {
                "_id": table_doc["_id"],
                "manual_status": {
                    "$regex": "^available$",
                    "$options": "i"
                }
            },
            {
                "$set": {
                    "manual_status": "Occupied",
                    "reserved_order_number": order_number,
                    "reserved_customer_id": customer_id
                }
            }
        )

        if reservation.modified_count != 1:
            raise HTTPException(
                status_code=409,
                detail="Sorry, this table was just booked. Please select another table."
            )

    # SAVE ORDER

    try:

        result = await database.orders.insert_one(order)

    except Exception:

        # RELEASE TABLE IF ORDER INSERTION FAILS

        if table_doc:

            await database.tables.update_one(
                {
                    "_id": table_doc["_id"],
                    "reserved_order_number": order_number
                },
                {
                    "$set": {
                        "manual_status": "Available"
                    },
                    "$unset": {
                        "reserved_order_number": "",
                        "reserved_customer_id": ""
                    }
                }
            )

        raise

    # CLEAR CART

    await database.carts.update_one(
        {"customer_id": customer_id},
        {"$set": {"items": []}}
    )

    return {
        "success": True,
        "message": "Your order has been placed successfully!",
        "order_id": str(result.inserted_id),
        "order_number": order_number,
        "total_price": total_price,
        "order_status": "Placed",
        "payment_method": request.payment_method,
        "delivery_type": request.delivery_type,
        "table_number": selected_table,
        "payment_status": "Pending"
    }


# =====================================================
# GET ALL ORDERS OF LOGGED-IN CUSTOMER
# =====================================================

@router.get("/my-orders")
async def get_my_orders(
    customer: dict = Depends(get_current_customer)
):

    customer_id = str(customer["_id"])

    cursor = database.orders.find(
        {"customer_id": customer_id}
    ).sort("created_at", -1)

    orders = []

    async for order in cursor:
        orders.append(serialize_order(order))

    return {
        "success": True,
        "total_orders": len(orders),
        "orders": orders
    }


# =====================================================
# COMPLETE DELIVERY - DEMO SIMULATION ONLY
# =====================================================

@router.post("/{order_id}/demo-complete")
async def complete_demo_delivery(
    order_id: str,
    customer: dict = Depends(get_current_customer)
):

    if not ObjectId.is_valid(order_id):
        raise HTTPException(
            status_code=400,
            detail="Invalid order ID."
        )

    customer_id = str(customer["_id"])

    order = await database.orders.find_one({
        "_id": ObjectId(order_id),
        "customer_id": customer_id
    })

    if not order:
        raise HTTPException(
            status_code=404,
            detail="Order not found."
        )

    if order.get("delivery_type") != "delivery":
        raise HTTPException(
            status_code=400,
            detail="This order is not a delivery order."
        )

    if order.get("order_status") == "Delivered":
        return {
            "success": True,
            "message": "Order is already delivered.",
            "order_status": "Delivered"
        }

    completed_at = datetime.now(timezone.utc)

    await database.orders.update_one(
        {
            "_id": ObjectId(order_id),
            "customer_id": customer_id
        },
        {
            "$set": {
                "order_status": "Delivered",
                "delivery_status": "Delivered",
                "completed_at": completed_at
            }
        }
    )

    return {
        "success": True,
        "message": "Demo delivery completed successfully.",
        "order_status": "Delivered",
        "completed_at": completed_at.isoformat()
    }


# =====================================================
# GET SINGLE ORDER DETAILS
# =====================================================

@router.get("/{order_id}")
async def get_order_details(
    order_id: str,
    customer: dict = Depends(get_current_customer)
):

    if not ObjectId.is_valid(order_id):
        raise HTTPException(
            status_code=400,
            detail="Invalid order ID."
        )

    customer_id = str(customer["_id"])

    order = await database.orders.find_one({
        "_id": ObjectId(order_id),
        "customer_id": customer_id
    })

    if not order:
        raise HTTPException(
            status_code=404,
            detail="Order not found."
        )

    return {
        "success": True,
        "order": serialize_order(order)
    }
