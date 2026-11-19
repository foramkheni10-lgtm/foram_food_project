from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from app.database import database
from app.security import get_current_customer

router = APIRouter(
    prefix="/api/cart",
    tags=["Customer Cart"]
)


class CartItemRequest(BaseModel):
    food_id: str
    quantity: int = Field(default=1, ge=1, le=99)


async def get_food(food_id: str):
    food = None

    if ObjectId.is_valid(food_id):
        food = await database.foods.find_one({
            "_id": ObjectId(food_id)
        })

    if not food:
        food = await database.foods.find_one({
            "_id": food_id
        })

    if not food:
        raise HTTPException(
            status_code=404,
            detail="Food item not found."
        )

    if food.get("available") is False or food.get("availability") is False:
        raise HTTPException(
            status_code=400,
            detail="This food is currently unavailable."
        )

    return food


async def get_cart_response(customer_id: str):
    cart = await database.carts.find_one({
        "customer_id": customer_id
    })

    items = []
    total = 0

    if cart:
        for item in cart.get("items", []):
            food = await get_food(item["food_id"])
            price = float(food.get("price", 0))
            quantity = item["quantity"]

            items.append({
                "food_id": str(food["_id"]),
                "name": food.get("name") or food.get("food_name", "Food"),
                "category": food.get("category", ""),
                "price": price,
                "quantity": quantity,
                "subtotal": price * quantity
            })

            total += price * quantity

    return {
        "success": True,
        "items": items,
        "total_items": sum(item["quantity"] for item in items),
        "total_price": total
    }


@router.get("/")
async def get_cart(
    customer: dict = Depends(get_current_customer)
):
    return await get_cart_response(str(customer["_id"]))


@router.post("/items")
async def add_to_cart(
    request: CartItemRequest,
    customer: dict = Depends(get_current_customer)
):
    food = await get_food(request.food_id)

    customer_id = str(customer["_id"])

    cart = await database.carts.find_one({
        "customer_id": customer_id
    })

    items = cart.get("items", []) if cart else []

    food_id = str(food["_id"])

    existing = next(
        (item for item in items if item["food_id"] == food_id),
        None
    )

    if existing:
        existing["quantity"] += request.quantity
    else:
        items.append({
            "food_id": food_id,
            "quantity": request.quantity
        })

    await database.carts.update_one(
        {"customer_id": customer_id},
        {
            "$set": {
                "customer_id": customer_id,
                "items": items
            }
        },
        upsert=True
    )

    return await get_cart_response(customer_id)


@router.patch("/items/{food_id}")
async def update_cart_quantity(
    food_id: str,
    quantity: int,
    customer: dict = Depends(get_current_customer)
):
    if quantity < 1 or quantity > 99:
        raise HTTPException(
            status_code=400,
            detail="Quantity must be between 1 and 99."
        )

    customer_id = str(customer["_id"])

    result = await database.carts.update_one(
        {
            "customer_id": customer_id,
            "items.food_id": food_id
        },
        {
            "$set": {
                "items.$.quantity": quantity
            }
        }
    )

    if result.matched_count == 0:
        raise HTTPException(
            status_code=404,
            detail="Cart item not found."
        )

    return await get_cart_response(customer_id)


@router.delete("/items/{food_id}")
async def remove_cart_item(
    food_id: str,
    customer: dict = Depends(get_current_customer)
):
    customer_id = str(customer["_id"])

    await database.carts.update_one(
        {"customer_id": customer_id},
        {
            "$pull": {
                "items": {"food_id": food_id}
            }
        }
    )

    return await get_cart_response(customer_id)


@router.delete("/")
async def clear_cart(
    customer: dict = Depends(get_current_customer)
):
    await database.carts.update_one(
        {"customer_id": str(customer["_id"])},
        {"$set": {"items": []}}
    )

    return {
        "success": True,
        "message": "Cart cleared successfully."
    }