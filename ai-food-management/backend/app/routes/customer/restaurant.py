
from fastapi import APIRouter
from app.db_config import db

router = APIRouter(
    prefix="/api/restaurants",
    tags=["Restaurants"]
)


@router.get("/")
async def get_restaurants():

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
