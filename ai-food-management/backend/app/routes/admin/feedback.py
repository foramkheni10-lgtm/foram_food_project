
from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId

from app.database import database
from app.security import require_roles

router = APIRouter(
    prefix="/api/admin/feedback",
    tags=["Admin Feedback"]
)


@router.get("/")
async def get_all_customer_feedback(
    admin: dict = Depends(require_roles("admin"))
):
    try:
        cursor = database.feedback.find({}).sort("created_at", -1)
        records = await cursor.to_list(length=2000)

        feedbacks = []

        for item in records:
            rating = int(item.get("rating", 0) or 0)

            created_at = (
                item.get("created_at")
                or item.get("createdAt")
            )

            feedbacks.append({
                "id": str(item["_id"]),
                "customer": (
                    item.get("customer_name")
                    or item.get("customerName")
                    or "Customer"
                ),
                "email": (
                    item.get("customer_email")
                    or item.get("customerEmail")
                    or ""
                ),
                "restaurant": (
                    item.get("restaurant_name")
                    or item.get("restaurantName")
                    or "Restaurant"
                ),
                "order_number": (
                    item.get("order_number")
                    or item.get("orderNumber")
                    or ""
                ),
                "rating": rating,
                "comment": (
                    item.get("comment")
                    or item.get("message")
                    or ""
                ),
                "date": created_at,
                "status": (
                    "Positive" if rating >= 4
                    else "Needs Attention"
                )
            })

        total = len(feedbacks)

        average_rating = (
            round(
                sum(item["rating"] for item in feedbacks) / total,
                1
            )
            if total else 0
        )

        return {
            "success": True,
            "totalFeedback": total,
            "averageRating": average_rating,
            "positiveCount": sum(
                1 for item in feedbacks
                if item["rating"] >= 4
            ),
            "attentionCount": sum(
                1 for item in feedbacks
                if item["rating"] > 0 and item["rating"] <= 3
            ),
            "feedback": feedbacks
        }

    except Exception as e:
        print("Admin feedback error:", str(e))
        raise HTTPException(
            status_code=500,
            detail="Failed to fetch customer feedback"
        )
