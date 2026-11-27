
from fastapi import APIRouter, HTTPException
from app.db_config import db
from app.models.restaurant.food import FoodCreate
from bson import ObjectId


router = APIRouter(
    prefix="/api/restaurants",
    tags=["Food"]
)

foods_collection = db["foods"]


# Add Food
@router.post("/{restaurant_id}/foods")
async def add_food(restaurant_id: str, data: FoodCreate):

    try:
        restaurant_object_id = ObjectId(restaurant_id)
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid restaurant ID"
        )

    restaurant = db["restaurants"].find_one({
        "_id": restaurant_object_id
    })

    if not restaurant:
        raise HTTPException(
            status_code=404,
            detail="Restaurant not found"
        )

    food = data.dict()

    # Validate food images
    if len(food.get("images", [])) > 4:
        raise HTTPException(
            status_code=400,
            detail="Maximum 4 images allowed"
        )

    # Keep first image as main image
    if food.get("images"):
        food["image"] = food["images"][0]

    food["restaurant_id"] = restaurant_id

    result = foods_collection.insert_one(food)

    return {
        "message": "Food added successfully",
        "food_id": str(result.inserted_id),
        "food_name": data.food_name
    }


# Get All Foods
@router.get("/{restaurant_id}/foods")
async def get_foods(restaurant_id: str):

    try:
        restaurant_object_id = ObjectId(restaurant_id)
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid restaurant ID"
        )

    restaurant = db["restaurants"].find_one({
        "_id": restaurant_object_id
    })

    if not restaurant:
        raise HTTPException(
            status_code=404,
            detail="Restaurant not found"
        )

    foods = list(foods_collection.find({
        "restaurant_id": restaurant_id
    }))

    for food in foods:
        food["_id"] = str(food["_id"])

        # Defaults for older food records
        food.setdefault("food_type", "")
        food.setdefault("customization", {})
        food.setdefault("preparation_time", 15)
        food.setdefault("ingredients", [])
        food.setdefault("images", [])
        food.setdefault("available", True)

        food.setdefault("is_todays_special", False)
        food.setdefault("is_bestseller", False)
        food.setdefault("is_chef_special", False)
        food.setdefault("is_restaurant_special", False)

        food.setdefault(
            "discount",
            {
                "enabled": False,
                "percentage": 0,
                "start_date": "",
                "end_date": ""
            }
        )

    return foods


# Update Food
@router.put("/foods/{food_id}")
async def update_food(food_id: str, data: FoodCreate):

    try:
        food_object_id = ObjectId(food_id)
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid food ID"
        )

    existing_food = foods_collection.find_one({
        "_id": food_object_id
    })

    if not existing_food:
        raise HTTPException(
            status_code=404,
            detail="Food not found"
        )

    updated_food = data.dict()

    # Validate food images
    if len(updated_food.get("images", [])) > 4:
        raise HTTPException(
            status_code=400,
            detail="Maximum 4 images allowed"
        )

    # Keep first image as main image
    if updated_food.get("images"):
        updated_food["image"] = updated_food["images"][0]

    # Preserve restaurant ID
    updated_food["restaurant_id"] = existing_food["restaurant_id"]

    foods_collection.update_one(
        {"_id": food_object_id},
        {"$set": updated_food}
    )

    return {
        "message": "Food updated successfully",
        "food_id": food_id
    }


# Delete Food
@router.delete("/foods/{food_id}")
async def delete_food(food_id: str):

    try:
        food_object_id = ObjectId(food_id)
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid food ID"
        )

    existing_food = foods_collection.find_one({
        "_id": food_object_id
    })

    if not existing_food:
        raise HTTPException(
            status_code=404,
            detail="Food not found"
        )

    result = foods_collection.delete_one({
        "_id": food_object_id
    })

    if result.deleted_count == 0:
        raise HTTPException(
            status_code=500,
            detail="Unable to delete food"
        )

    return {
        "message": "Food deleted successfully",
        "food_id": food_id
    }
