
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from bson import ObjectId

from app.db_config import db
from app.security import require_roles

router = APIRouter(
    prefix="/api/restaurants",
    tags=["Restaurants"]
)


class RestaurantStatusUpdate(BaseModel):
    status: str


# =====================================
# GET ALL RESTAURANTS
# Public API - used by customer module
# =====================================

@router.get("/")
async def get_restaurants():
    try:
        restaurants = list(db.restaurants.find())

        public_restaurants = []

        for restaurant in restaurants:
            public_restaurants.append({
                "_id": str(restaurant["_id"]),
                "name": restaurant.get("name") or restaurant.get("restaurantName"),
                "description": restaurant.get("description"),
                "address": restaurant.get("address"),
                "image": restaurant.get("image"),
                "status": restaurant.get("status"),
                "rating": restaurant.get("rating")
            })

        return {
            "message": "Restaurants fetched successfully",
            "total": len(public_restaurants),
            "restaurants": public_restaurants
        }

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Unable to fetch restaurants"
        )


# =====================================
# UPDATE RESTAURANT STATUS
# Admin only
# =====================================

@router.patch("/{restaurant_id}/status")
async def update_restaurant_status(
    restaurant_id: str,
    data: RestaurantStatusUpdate,
    admin: dict = Depends(require_roles("admin"))
):
    if not ObjectId.is_valid(restaurant_id):
        raise HTTPException(
            status_code=400,
            detail="Invalid restaurant ID"
        )

    new_status = data.status.strip().capitalize()

    if new_status not in ["Active", "Inactive"]:
        raise HTTPException(
            status_code=400,
            detail="Status must be Active or Inactive"
        )

    try:
        result = db.restaurants.update_one(
            {"_id": ObjectId(restaurant_id)},
            {"$set": {"status": new_status}}
        )

        if result.matched_count == 0:
            raise HTTPException(
                status_code=404,
                detail="Restaurant not found"
            )

        return {
            "success": True,
            "message": "Restaurant status updated successfully",
            "restaurant_id": restaurant_id,
            "status": new_status
        }

    except HTTPException:
        raise

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Unable to update restaurant status"
        )
