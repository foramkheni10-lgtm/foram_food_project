
from datetime import datetime, timezone
from typing import Optional

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from app.database import database
from app.security import get_current_customer


router = APIRouter(
    prefix="/api/feedback",
    tags=["Customer Feedback"]
)


class FeedbackRequest(BaseModel):
    order_id: str
    rating: int = Field(ge=1, le=5)
    comment: Optional[str] = Field(default="", max_length=1000)


@router.post("/submit")
async def submit_feedback(
    request: FeedbackRequest,
    customer: dict = Depends(get_current_customer)
):
    if not ObjectId.is_valid(request.order_id):
        raise HTTPException(
            status_code=400,
            detail="Invalid order ID."
        )

    customer_id = str(customer["_id"])

    order = await database.orders.find_one({
        "_id": ObjectId(request.order_id),
        "customer_id": customer_id
    })

    if not order:
        raise HTTPException(
            status_code=404,
            detail="Order not found."
        )

    # Allow feedback only after order completion
    order_status = str(
        order.get("order_status", "")
    ).strip().lower()

    completed_statuses = {
        "delivered",
        "completed",
        "complete"
    }

    if order_status not in completed_statuses:
        raise HTTPException(
            status_code=400,
            detail="You can submit feedback only after your order is completed."
        )

    # Prevent duplicate feedback
    existing_feedback = await database.feedback.find_one({
        "order_id": request.order_id,
        "customer_id": customer_id
    })

    if existing_feedback:
        raise HTTPException(
            status_code=400,
            detail="You have already submitted feedback for this order."
        )

    feedback = {
        "order_id": request.order_id,
        "order_number": order.get("order_number", ""),
        "customer_id": customer_id,
        "customer_name": customer.get("name", ""),
        "customer_email": customer.get("email", ""),
        "rating": request.rating,
        "comment": (request.comment or "").strip(),
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
    customer: dict = Depends(get_current_customer)
):
    customer_id = str(customer["_id"])

    cursor = database.feedback.find({
        "customer_id": customer_id
    }).sort("created_at", -1)

    feedback_list = []

    async for feedback in cursor:
        feedback["feedback_id"] = str(feedback.pop("_id"))
        feedback_list.append(feedback)

    return {
        "success": True,
        "total_feedback": len(feedback_list),
        "feedback": feedback_list
    }

@router.get("/public")
async def get_public_feedback():
    cursor = database.feedback.find(
        {},
        {
            "_id": 0,
            "customer_name": 1,
            "rating": 1,
            "comment": 1,
            "created_at": 1,
        }
    ).sort("created_at", -1)

    feedback_list = []

    async for feedback in cursor:
        feedback_list.append(feedback)

    return {
        "success": True,
        "total": len(feedback_list),
        "feedback": feedback_list
    }
