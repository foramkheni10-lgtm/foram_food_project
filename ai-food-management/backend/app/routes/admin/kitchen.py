
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from bson import ObjectId
from app.db_config import db

router = APIRouter(
    prefix="/api/kitchen",
    tags=["Kitchen"]
)

kitchen_collection = db["kitchen_orders"]
foods_collection = db["foods"]


def enrich_kitchen_order(order):
    """Add actual food price and preparation time to a kitchen order."""

    order["_id"] = str(order["_id"])

    food_name = order.get("food_name", "")
    quantity = float(order.get("quantity", 1) or 1)

    food = foods_collection.find_one({
        "food_name": {
            "$regex": f"^{food_name}$",
            "$options": "i"
        }
    }) if food_name else None

    if food:
        price = float(food.get("price", 0) or 0)

        order["food_price"] = price
        order["total_amount"] = round(price * quantity, 2)
        order["food_preparation_time"] = food.get(
            "preparation_time", 0
        )
        order["food_available"] = food.get("available", True)
    else:
        order["food_price"] = None
        order["total_amount"] = None
        order["food_preparation_time"] = order.get(
            "estimated_time", 0
        )
        order["food_available"] = None

    return order


# GET ALL KITCHEN ORDERS
@router.get("/orders")
def get_kitchen_orders():
    try:
        orders = list(
            kitchen_collection.find({}).sort("order_date", -1)
        )

        return [
            enrich_kitchen_order(order)
            for order in orders
        ]

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch kitchen orders: {str(e)}"
        )


# GET KITCHEN ORDER BY ID
@router.get("/orders/{order_id}")
def get_kitchen_order(order_id: str):
    try:
        if not ObjectId.is_valid(order_id):
            raise HTTPException(
                status_code=400,
                detail="Invalid kitchen order ID"
            )

        order = kitchen_collection.find_one({
            "_id": ObjectId(order_id)
        })

        if not order:
            raise HTTPException(
                status_code=404,
                detail="Kitchen order not found"
            )

        return enrich_kitchen_order(order)

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch kitchen order: {str(e)}"
        )


class KitchenStatusUpdate(BaseModel):
    status: str


# UPDATE KITCHEN ORDER STATUS
@router.patch("/orders/{order_id}/status")
def update_kitchen_order_status(
    order_id: str,
    data: KitchenStatusUpdate
):
    try:
        allowed_statuses = [
            "accepted",
            "preparing",
            "ready",
            "completed",
            "cancelled"
        ]

        if data.status not in allowed_statuses:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid status. Allowed statuses: {allowed_statuses}"
            )

        if not ObjectId.is_valid(order_id):
            raise HTTPException(
                status_code=400,
                detail="Invalid kitchen order ID"
            )

        result = kitchen_collection.update_one(
            {"_id": ObjectId(order_id)},
            {"$set": {"status": data.status}}
        )

        if result.matched_count == 0:
            raise HTTPException(
                status_code=404,
                detail="Kitchen order not found"
            )

        return {
            "message": "Kitchen order status updated successfully",
            "status": data.status
        }

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update kitchen order status: {str(e)}"
        )
