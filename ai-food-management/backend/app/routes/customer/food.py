
from fastapi import APIRouter, HTTPException
from app.db_config import db

router = APIRouter(
    prefix="/api/foods",
    tags=["Foods"]
)


@router.get("/")
async def get_foods():
    try:
        foods = list(db.foods.find())

        public_foods = []

        for food in foods:
            public_foods.append({
                "_id": str(food["_id"]),
                "name": food.get("name") or food.get("food_name"),
                "description": food.get("description") or "",
                "price": food.get("price", 0),
                "image": food.get("image"),
                "category": food.get("category") or "",
                "restaurantId": str(
                    food.get("restaurant_id")
                    or food.get("restaurantId")
                    or ""
                ),
                "available": food.get(
                    "availability",
                    food.get("available", True)
                )
            })

        return {
            "success": True,
            "message": "Foods fetched successfully",
            "total": len(public_foods),
            "foods": public_foods
        }

    except Exception as e:
        print("GET FOODS ERROR:", str(e))
        raise HTTPException(
            status_code=500,
            detail="Failed to fetch foods from database"
        )
