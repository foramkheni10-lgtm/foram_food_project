
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

    try:
        payload = jwt.decode(
            credentials.credentials,
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
# HELPER: FIND CUSTOMER PROFILE IMAGE
# ==========================================================

async def get_customer_profile(customer_id):
    if not customer_id:
        return ""

    user = None

    if ObjectId.is_valid(str(customer_id)):
        user = await database.users.find_one({
            "_id": ObjectId(str(customer_id))
        })

    if not user:
        user = await database.users.find_one({
            "_id": str(customer_id)
        })

    if not user:
        return ""

    return (
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


# ==========================================================
# GET FEEDBACK FOR LOGGED-IN RESTAURANT
# ==========================================================

@router.get("/my-feedback")
async def get_my_restaurant_feedback(
    restaurant=Depends(get_current_restaurant)
):

    restaurant_id = str(restaurant["_id"])

    restaurant_name = (
        restaurant.get("name")
        or restaurant.get("restaurant_name")
        or restaurant.get("restaurantName")
        or ""
    )

    # Support both string and ObjectId restaurant IDs.
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

        # --------------------------------------------------
        # FETCH RELATED ORDER
        # --------------------------------------------------

        order = None
        order_id = str(item.get("order_id", ""))

        if ObjectId.is_valid(order_id):
            order = await database.orders.find_one({
                "_id": ObjectId(order_id)
            })

        if not order:
            order = await database.orders.find_one({
                "_id": order_id
            })

        # Verify that the order belongs to this restaurant.
        if order:
            order_restaurant_id = str(
                order.get("restaurant_id", "")
            )

            if order_restaurant_id != restaurant_id:
                continue

        # --------------------------------------------------
        # FOOD ITEM NAMES
        # --------------------------------------------------

        food_names = []

        if order:
            for order_item in order.get("items", []):
                name = (
                    order_item.get("name")
                    or order_item.get("food_name")
                    or ""
                )

                if name and name not in food_names:
                    food_names.append(name)

        food_name = ", ".join(food_names) if food_names else "Food item"

        # --------------------------------------------------
        # ORDER DATE
        # --------------------------------------------------

        order_date = (
            order.get("created_at")
            if order
            else None
        )

        # --------------------------------------------------
        # CUSTOMER DETAILS
        # --------------------------------------------------

        customer_id = (
            item.get("customer_id")
            or (order.get("customer_id") if order else "")
        )

        profile_image = await get_customer_profile(customer_id)

        customer_name = (
            item.get("customer_name")
            or (order.get("customer_name") if order else "")
            or "Customer"
        )

        customer_email = (
            item.get("customer_email")
            or (order.get("customer_email") if order else "")
            or ""
        )

        # --------------------------------------------------
        # FINAL FEEDBACK RESPONSE
        # --------------------------------------------------

        feedbacks.append({
            "_id": str(item["_id"]),
            "order_id": order_id,
            "order_number": (
                item.get("order_number")
                or (order.get("order_number") if order else "")
                or ""
            ),

            "order_date": order_date,
            "order_created_at": order_date,

            "customer_name": customer_name,
            "customer_email": customer_email,
            "customer_profile_image": profile_image,

            "food_name": food_name,
            "food_item_name": food_name,

            "rating": int(item.get("rating", 0)),
            "comment": item.get("comment", ""),

            "created_at": item.get("created_at"),

            "restaurant_name": (
                item.get("restaurant_name")
                or restaurant_name
            )
        })

    # ======================================================
    # CALCULATE FEEDBACK STATISTICS
    # ======================================================

    total_reviews = len(feedbacks)

    average_rating = (
        round(
            sum(item["rating"] for item in feedbacks) / total_reviews,
            1
        )
        if total_reviews
        else 0
    )

    positive_reviews = sum(
        1 for item in feedbacks
        if item["rating"] >= 4
    )

    five_star_reviews = sum(
        1 for item in feedbacks
        if item["rating"] == 5
    )

    return {
        "success": True,
        "restaurant_id": restaurant_id,
        "restaurant_name": restaurant_name,

        "total_reviews": total_reviews,
        "average_rating": average_rating,
        "positive_reviews": positive_reviews,
        "five_star_reviews": five_star_reviews,

        "feedbacks": feedbacks
    }
