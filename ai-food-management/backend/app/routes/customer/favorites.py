
from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException

from app.database import database
from app.security import get_current_customer

router = APIRouter(
    prefix="/api/favorites",
    tags=["Customer Favorites"]
)


def serialize_food(food: dict) -> dict:
    return {
        "_id": str(food["_id"]),
        "name": food.get("name") or food.get("food_name") or "Food Item",
        "food_name": food.get("food_name") or food.get("name") or "Food Item",
        "description": food.get("description", ""),
        "category": food.get("category", ""),
        "price": float(food.get("price", 0) or 0),
        "image": food.get("image", ""),
        "restaurant_id": str(food.get("restaurant_id", "")),
        "restaurant_name": food.get("restaurant_name", ""),
    }


async def find_food(food_id: str):
    if not ObjectId.is_valid(food_id):
        raise HTTPException(status_code=400, detail="Invalid food ID.")

    food = await database.foods.find_one({"_id": ObjectId(food_id)})

    if not food:
        raise HTTPException(status_code=404, detail="Food item not found.")

    return food


@router.get("/")
async def get_favorites(
    customer: dict = Depends(get_current_customer)
):
    customer_id = str(customer["_id"])

    cursor = database.favorites.find({
        "customer_id": customer_id
    }).sort("created_at", -1)

    favorites = []

    async for favorite in cursor:
        food_id = favorite.get("food_id")

        if not ObjectId.is_valid(food_id):
            continue

        food = await database.foods.find_one({
            "_id": ObjectId(food_id)
        })

        # Ignore favourites whose food record no longer exists.
        if food:
            favorites.append(serialize_food(food))

    return {
        "success": True,
        "items": favorites,
        "total": len(favorites)
    }


@router.post("/{food_id}")
async def add_favorite(
    food_id: str,
    customer: dict = Depends(get_current_customer)
):
    food = await find_food(food_id)
    customer_id = str(customer["_id"])

    await database.favorites.update_one(
        {
            "customer_id": customer_id,
            "food_id": str(food["_id"])
        },
        {
            "$setOnInsert": {
                "customer_id": customer_id,
                "food_id": str(food["_id"]),
                "created_at": datetime.now(timezone.utc)
            }
        },
        upsert=True
    )

    return {
        "success": True,
        "message": "Added to favourites.",
        "item": serialize_food(food)
    }


@router.delete("/{food_id}")
async def remove_favorite(
    food_id: str,
    customer: dict = Depends(get_current_customer)
):
    customer_id = str(customer["_id"])

    result = await database.favorites.delete_one({
        "customer_id": customer_id,
        "food_id": food_id
    })

    return {
        "success": True,
        "removed": result.deleted_count > 0,
        "message": "Removed from favourites."
    }
