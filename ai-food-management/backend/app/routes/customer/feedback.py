
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from bson import ObjectId

from app.database import database
from app.security import get_current_customer


router = APIRouter(
    prefix="/api/feedback",
    tags=["Customer Feedback"]
)


class FeedbackRequest(BaseModel):
    order_id: str
    rating: int = Field(ge=1, le=5)
    comment: str = Field(default="", max_length=1000)


@router.post("/submit")
async def submit_feedback(
    data: FeedbackRequest,
    customer=Depends(get_current_customer)
):
    if not ObjectId.is_valid(data.order_id):
        raise HTTPException(status_code=400, detail="Invalid order ID")

    order = await database.orders.find_one({
        "_id": ObjectId(data.order_id)
    })

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    customer_id = str(customer["_id"])

    # Verify that this order belongs to the logged-in customer.
    order_customer_id = str(order.get("customer_id", ""))

    if order_customer_id != customer_id:
        raise HTTPException(
            status_code=403,
            detail="You cannot review another customer's order"
        )

    status = str(order.get("order_status", "")).strip().lower()

    if status not in ["delivered", "completed", "complete"]:
        raise HTTPException(
            status_code=400,
            detail="Feedback is available only after order completion"
        )

    existing = await database.feedback.find_one({
        "order_id": data.order_id
    })

    if existing:
        raise HTTPException(
            status_code=400,
            detail="You have already submitted feedback for this order"
        )

    restaurant_id = order.get("restaurant_id", "")
    if isinstance(restaurant_id, ObjectId):
        restaurant_id = str(restaurant_id)

    restaurant_name = (
        order.get("restaurant_name")
        or order.get("restaurantName")
        or ""
    )

    feedback = {
        "order_id": data.order_id,
        "order_number": order.get("order_number", ""),
        "customer_id": customer_id,
        "customer_name": customer.get("name", "Customer"),
        "customer_email": customer.get("email", ""),
        "restaurant_id": restaurant_id,
        "restaurant_name": restaurant_name,
        "rating": data.rating,
        "comment": data.comment.strip(),
        "created_at": datetime.now(timezone.utc)
    }

    result = await database.feedback.insert_one(feedback)

    return {
        "success": True,
        "message": "Thank you! Your feedback has been submitted successfully.",
        "feedback_id": str(result.inserted_id)
    }


@router.get("/my-feedback")
async def get_my_feedback(
    customer=Depends(get_current_customer)
):
    customer_id = str(customer["_id"])

    cursor = database.feedback.find({
        "customer_id": customer_id
    }).sort("created_at", -1)

    records = await cursor.to_list(length=500)

    feedbacks = []

    for item in records:
        feedbacks.append({
            "feedback_id": str(item["_id"]),
            "order_id": str(item.get("order_id", "")),
            "order_number": item.get("order_number", ""),
            "rating": int(item.get("rating", 0)),
            "comment": item.get("comment", ""),
            "created_at": item.get("created_at")
        })

    return {
        "success": True,
        "feedback": feedbacks
    }
