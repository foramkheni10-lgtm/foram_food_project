
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
            "customer_id": 1,
            "customer_name": 1,
            "rating": 1,
            "comment": 1,
            "created_at": 1,
        }
    ).sort("created_at", -1)

    feedback_list = []

    async for feedback in cursor:
        feedback_list.append(feedback)

    # Collect customer IDs
    customer_ids = {
        feedback.get("customer_id")
        for feedback in feedback_list
        if feedback.get("customer_id")
    }

    # Convert valid IDs to MongoDB ObjectIds
    object_ids = []

    for customer_id in customer_ids:
        if ObjectId.is_valid(customer_id):
            object_ids.append(ObjectId(customer_id))

    # Fetch customer profiles
    users = {}

    if object_ids:
        user_cursor = database.users.find(
            {
                "_id": {"$in": object_ids}
            },
            {
                "_id": 1,
                "profile_image": 1,
                "profile_image_url": 1,
                "profile_picture": 1,
                "profile_picture_url": 1,
                "avatar": 1,
                "avatar_url": 1,
                "image": 1,
                "photo": 1
            }
        )

        async for user in user_cursor:
            users[str(user["_id"])] = user

    # Attach profile images to feedback
    for feedback in feedback_list:

        customer_id = feedback.get("customer_id", "")
        user = users.get(customer_id, {})

        profile_image = (
            user.get("profile_image_url")
            or user.get("profile_image")
            or user.get("profile_picture_url")
            or user.get("profile_picture")
            or user.get("avatar_url")
            or user.get("avatar")
            or user.get("image")
            or user.get("photo")
            or ""
        )

        feedback["profile_image"] = profile_image

        # Do not expose internal customer IDs publicly
        feedback.pop("customer_id", None)

    return {
        "success": True,
        "total": len(feedback_list),
        "feedback": feedback_list
    }
