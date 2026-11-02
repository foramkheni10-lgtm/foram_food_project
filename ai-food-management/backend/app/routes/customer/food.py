
from fastapi import APIRouter
from app.db_config import db

router = APIRouter(
    prefix="/api/foods",
    tags=["Foods"]
)


@router.get("/")
async def get_foods():

    foods = list(db.foods.find())

    public_foods = []

    for food in foods:
        public_foods.append({
            "_id": str(food["_id"]),
            "name": food.get("name") or food.get("food_name"),
            "description": food.get("description"),
            "price": food.get("price"),
            "image": food.get("image"),
            "category": food.get("category"),
            "restaurant_id": str(
                food.get("restaurant_id", "")
            ),
            "availability": food.get("availability")
        })

    return {
        "message": "Foods fetched successfully",
        "total": len(public_foods),
        "foods": public_foods
    }
