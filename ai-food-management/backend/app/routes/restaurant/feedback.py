
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from bson import ObjectId

from app.database import database
from app.routes.restaurant.restaurant import SECRET_KEY, ALGORITHM


router = APIRouter(
    prefix="/api/restaurant-feedback",
    tags=["Restaurant Feedback"]
)

security = HTTPBearer(auto_error=False)


# ==========================================================
# VERIFY RESTAURANT LOGIN TOKEN
# ==========================================================

async def get_current_restaurant(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    if not credentials:
        raise HTTPException(
            status_code=401,
            detail="Restaurant login required"
        )

    token = credentials.credentials

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        restaurant_id = payload.get("restaurant_id")

        if not restaurant_id or not ObjectId.is_valid(restaurant_id):
            raise HTTPException(
                status_code=401,
                detail="Invalid restaurant token"
            )

    except JWTError:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired restaurant token"
        )

    restaurant = await database.restaurants.find_one({
        "_id": ObjectId(restaurant_id)
    })

    if not restaurant:
        raise HTTPException(
            status_code=401,
            detail="Restaurant account not found"
        )

    return restaurant


# ==========================================================
# GET FEEDBACK FOR LOGGED-IN RESTAURANT
# ==========================================================

@router.get("/my-feedback")
async def get_my_restaurant_feedback(
    restaurant=Depends(get_current_restaurant)
):
    restaurant_id = str(restaurant["_id"])

    feedback_cursor = database.feedback.find({
        "restaurant_id": {
            "$in": [
                restaurant_id,
                ObjectId(restaurant_id)
            ]
        }
    }).sort("created_at", -1)

    feedback_records = await feedback_cursor.to_list(length=500)

    feedbacks = []

    for item in feedback_records:
        feedbacks.append({
            "_id": str(item["_id"]),
            "order_id": str(item.get("order_id", "")),
            "order_number": item.get("order_number", ""),
            "customer_name": item.get("customer_name", "Customer"),
            "customer_email": item.get("customer_email", ""),
            "rating": int(item.get("rating", 0)),
            "comment": item.get("comment", ""),
            "created_at": item.get("created_at"),
            "restaurant_name": item.get(
                "restaurant_name",
                restaurant.get("restaurantName", "")
            )
        })

    total_reviews = len(feedbacks)

    average_rating = (
        round(
            sum(item["rating"] for item in feedbacks) / total_reviews,
            1
        )
        if total_reviews > 0
        else 0
    )

    return {
        "success": True,
        "restaurant_id": restaurant_id,
        "restaurant_name": restaurant.get("restaurantName", ""),
        "total_reviews": total_reviews,
        "average_rating": average_rating,
        "feedbacks": feedbacks
    }
