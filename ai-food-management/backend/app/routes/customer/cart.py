
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from typing import List
from uuid import uuid4

from app.database import database
from app.security import get_current_customer


router = APIRouter(
    prefix="/api/cart",
    tags=["Customer Cart"]
)


# ---------------------------------------------------------
# CUSTOMIZATION CATALOG
# Prices are controlled by the backend, NOT the frontend.
# ---------------------------------------------------------

CUSTOMIZATION_OPTIONS = {
    "pizza": {
        "Size": ("single", {
            "Regular": 0, "Medium": 60, "Large": 120
        }),
        "Crust": ("single", {
            "Classic Crust": 0, "Thin Crust": 20, "Cheese Burst": 60
        }),
        "Cheese": ("single", {
            "Regular Cheese": 0, "Extra Cheese": 35
        }),
        "Toppings": ("multiple", {
            "Mushrooms": 25, "Olives": 20, "Jalapenos": 20,
            "Capsicum": 15, "Sweet Corn": 20
        }),
    },

    "burger": {
        "Patty": ("single", {
            "Veg Patty": 0, "Paneer Patty": 35, "Crispy Patty": 25
        }),
        "Bun": ("single", {
            "Regular Bun": 0, "Whole Wheat Bun": 15
        }),
        "Cheese": ("single", {
            "No Extra Cheese": 0, "Extra Cheese": 25
        }),
        "Extras": ("multiple", {
            "Extra Patty": 40, "Extra Onion": 10,
            "Extra Lettuce": 10, "Extra Sauce": 15
        }),
    },

    "sandwich": {
        "Bread": ("single", {
            "White Bread": 0, "Brown Bread": 15,
            "Multigrain Bread": 25
        }),
        "Fillings": ("multiple", {
            "Extra Paneer": 30, "Extra Cheese": 25, "Mushrooms": 20
        }),
        "Sauces": ("multiple", {
            "Mint Mayo": 10, "Peri Peri Sauce": 10, "Cheese Sauce": 20
        }),
    },

    "dosa": {
        "Size": ("single", {
            "Regular": 0, "Large": 35
        }),
        "Filling": ("single", {
            "Regular": 0, "Extra Masala": 25, "Paneer Filling": 40
        }),
        "Chutneys": ("multiple", {
            "Extra Coconut Chutney": 15,
            "Extra Tomato Chutney": 15,
            "Extra Sambar": 20
        }),
        "Spice Level": ("single", {
            "Mild": 0, "Medium": 0, "Spicy": 0
        }),
    },

    "south": {
        "Sambar": ("single", {
            "Regular Sambar": 0, "Extra Sambar": 20
        }),
        "Chutneys": ("multiple", {
            "Coconut Chutney": 15,
            "Tomato Chutney": 15,
            "Mint Chutney": 15
        }),
        "Add-ons": ("multiple", {
            "Extra Idli": 20, "Extra Vada": 25, "Extra Podi": 15
        }),
    },

    "north": {
        "Spice Level": ("single", {
            "Mild": 0, "Medium": 0, "Spicy": 0
        }),
        "Gravy": ("single", {
            "Regular Gravy": 0, "Extra Gravy": 30
        }),
        "Add-ons": ("multiple", {
            "Butter Roti": 20, "Butter Naan": 35,
            "Jeera Rice": 50, "Extra Paneer": 40
        }),
    },

    "chinese": {
        "Spice Level": ("single", {
            "Mild": 0, "Medium": 0, "Hot": 0
        }),
        "Sauces": ("multiple", {
            "Extra Schezwan Sauce": 20,
            "Extra Manchurian Sauce": 20,
            "Chilli Sauce": 15
        }),
        "Add-ons": ("multiple", {
            "Extra Vegetables": 25,
            "Extra Paneer": 40,
            "Extra Noodles": 35
        }),
    },

    "frankie": {
        "Filling": ("single", {
            "Regular Filling": 0,
            "Paneer Filling": 35,
            "Cheese Filling": 30
        }),
        "Sauces": ("multiple", {
            "Mint Sauce": 10, "Mayo": 10, "Schezwan Sauce": 15
        }),
        "Extras": ("multiple", {
            "Extra Cheese": 25,
            "Extra Vegetables": 20,
            "Extra Filling": 35
        }),
    },

    "biryani": {
        "Portion": ("single", {
            "Regular": 0, "Large": 60
        }),
        "Spice Level": ("single", {
            "Mild": 0, "Medium": 0, "Spicy": 0
        }),
        "Add-ons": ("multiple", {
            "Extra Raita": 20, "Boiled Egg": 20, "Extra Gravy": 25
        }),
    },

    "dessert": {
        "Size": ("single", {
            "Regular": 0, "Large": 40
        }),
        "Toppings": ("multiple", {
            "Chocolate Sauce": 20, "Choco Chips": 20,
            "Nuts": 25, "Whipped Cream": 25
        }),
    },

    "beverage": {
        "Size": ("single", {
            "Regular": 0, "Medium": 20, "Large": 35
        }),
        "Ice": ("single", {
            "Regular Ice": 0, "Less Ice": 0, "No Ice": 0
        }),
        "Sugar": ("single", {
            "Regular Sugar": 0, "Less Sugar": 0, "No Sugar": 0
        }),
        "Extras": ("multiple", {
            "Extra Cream": 20, "Chocolate Syrup": 15
        }),
    },

    "default": {
        "Spice Level": ("single", {
            "Mild": 0, "Medium": 0, "Spicy": 0
        }),
        "Add-ons": ("multiple", {
            "Extra Cheese": 25, "Extra Paneer": 40, "Extra Sauce": 15
        }),
    },
}


# ---------------------------------------------------------
# REQUEST MODELS
# additional_price is intentionally NOT accepted.
# Any additional_price sent by the frontend is ignored.
# ---------------------------------------------------------

class CartCustomization(BaseModel):
    group: str
    option: str


class CartItemRequest(BaseModel):
    food_id: str
    quantity: int = Field(default=1, ge=1, le=99)
    customizations: List[CartCustomization] = Field(default_factory=list)
    special_instructions: str = Field(default="", max_length=500)


class CartCustomizeRequest(BaseModel):
    customizations: List[CartCustomization] = Field(default_factory=list)
    special_instructions: str = Field(default="", max_length=500)


# ---------------------------------------------------------
# FOOD CATEGORY DETECTION
# Must match the frontend getCustomizationGroups logic.
# ---------------------------------------------------------

def get_customization_category(food):
    value = (
        f"{food.get('category', '')} "
        f"{food.get('name', food.get('food_name', ''))}"
    ).lower()

    if "pizza" in value:
        return "pizza"

    if "burger" in value:
        return "burger"

    if "sandwich" in value:
        return "sandwich"

    if "dosa" in value:
        return "dosa"

    if any(word in value for word in [
        "south indian", "idli", "vada", "uttapam"
    ]):
        return "south"

    if any(word in value for word in [
        "north indian", "paneer", "naan", "roti", "paratha"
    ]):
        return "north"

    if any(word in value for word in [
        "chinese", "noodles", "manchurian", "fried rice"
    ]):
        return "chinese"

    if any(word in value for word in [
        "frankie", "roll", "wrap"
    ]):
        return "frankie"

    if any(word in value for word in [
        "biryani", "rice", "pulao"
    ]):
        return "biryani"

    if any(word in value for word in [
        "dessert", "sweet", "cake", "brownie",
        "ice cream", "gulab jamun"
    ]):
        return "dessert"

    if any(word in value for word in [
        "drink", "beverage", "juice", "shake",
        "coffee", "tea", "cola"
    ]):
        return "beverage"

    return "default"


# ---------------------------------------------------------
# SERVER-SIDE CUSTOMIZATION VALIDATION AND PRICE CALCULATION
# ---------------------------------------------------------

def validate_customizations(food, customizations):
    category = get_customization_category(food)
    allowed_groups = CUSTOMIZATION_OPTIONS[category]

    validated = []
    selected_single_groups = set()
    selected_options = set()

    for customization in customizations:
        group = customization.get("group")
        option = customization.get("option")

        if not isinstance(group, str) or not isinstance(option, str):
            raise HTTPException(
                status_code=400,
                detail="Invalid customization data."
            )

        if group not in allowed_groups:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid customization group: {group}"
            )

        selection_type, allowed_options = allowed_groups[group]

        if option not in allowed_options:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid option '{option}' for {group}."
            )

        option_key = (group, option)

        if option_key in selected_options:
            raise HTTPException(
                status_code=400,
                detail=f"Duplicate customization: {option}."
            )

        selected_options.add(option_key)

        if selection_type == "single":
            if group in selected_single_groups:
                raise HTTPException(
                    status_code=400,
                    detail=f"Only one option is allowed for {group}."
                )

            selected_single_groups.add(group)

        # Always use the backend's approved price.
        validated.append({
            "group": group,
            "option": option,
            "additional_price": float(allowed_options[option])
        })

    return validated


def calculate_customization_price(customizations):
    return sum(
        float(option.get("additional_price", 0))
        for option in customizations
    )


def same_customization(item, customizations, instructions):
    return (
        item.get("customizations", []) == customizations
        and item.get("special_instructions", "") == instructions
    )


# ---------------------------------------------------------
# FOOD LOOKUP
# ---------------------------------------------------------

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


# ---------------------------------------------------------
# CART RESPONSE
# Prices are recalculated using approved backend prices.
# ---------------------------------------------------------

async def get_cart_response(customer_id: str):
    cart = await database.carts.find_one({
        "customer_id": customer_id
    })

    items = []
    total = 0

    if cart:
        for item in cart.get("items", []):
            food = await get_food(item["food_id"])

            base_price = float(food.get("price", 0))

            customizations = validate_customizations(
                food,
                item.get("customizations", [])
            )

            customization_total = calculate_customization_price(
                customizations
            )

            unit_price = base_price + customization_total
            quantity = int(item.get("quantity", 1))
            subtotal = unit_price * quantity

            items.append({
                "cart_item_id": item.get(
                    "cart_item_id",
                    item["food_id"]
                ),
                "food_id": str(food["_id"]),
                "name": food.get("name") or food.get("food_name", "Food"),
                "category": food.get("category", ""),
                "image": (
                    food.get("image")
                    or food.get("image_url")
                    or food.get("food_image")
                    or ""
                ),
                "base_price": base_price,
                "customization_total": customization_total,
                "price": unit_price,
                "quantity": quantity,
                "customizations": customizations,
                "special_instructions": item.get(
                    "special_instructions", ""
                ),
                "subtotal": subtotal
            })

            total += subtotal

    return {
        "success": True,
        "items": items,
        "total_items": sum(item["quantity"] for item in items),
        "total_price": total
    }


# ---------------------------------------------------------
# GET CART
# ---------------------------------------------------------

@router.get("/")
async def get_cart(
    customer: dict = Depends(get_current_customer)
):
    return await get_cart_response(str(customer["_id"]))


# ---------------------------------------------------------
# ADD TO CART
# ---------------------------------------------------------

@router.post("/items")
async def add_to_cart(
    request: CartItemRequest,
    customer: dict = Depends(get_current_customer)
):
    food = await get_food(request.food_id)

    customer_id = str(customer["_id"])
    food_id = str(food["_id"])

    customizations = validate_customizations(
        food,
        [option.dict() for option in request.customizations]
    )

    instructions = request.special_instructions.strip()

    cart = await database.carts.find_one({
        "customer_id": customer_id
    })

    items = cart.get("items", []) if cart else []

    existing = next(
        (
            item for item in items
            if item["food_id"] == food_id
            and same_customization(
                item,
                customizations,
                instructions
            )
        ),
        None
    )

    if existing:
        existing["quantity"] = min(
            int(existing.get("quantity", 1)) + request.quantity,
            99
        )
    else:
        items.append({
            "cart_item_id": str(uuid4()),
            "food_id": food_id,
            "quantity": request.quantity,
            "customizations": customizations,
            "special_instructions": instructions
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


# ---------------------------------------------------------
# CUSTOMIZE CART ITEM
# ---------------------------------------------------------

@router.patch("/items/{item_id}/customize")
async def customize_cart_item(
    item_id: str,
    request: CartCustomizeRequest,
    customer: dict = Depends(get_current_customer)
):
    customer_id = str(customer["_id"])

    cart = await database.carts.find_one({
        "customer_id": customer_id
    })

    if not cart:
        raise HTTPException(
            status_code=404,
            detail="Cart not found."
        )

    items = cart.get("items", [])

    target = next(
        (
            item for item in items
            if item.get("cart_item_id") == item_id
        ),
        None
    )

    # Support older cart entries without a cart_item_id.
    if not target:
        target = next(
            (
                item for item in items
                if item.get("food_id") == item_id
            ),
            None
        )

    if not target:
        raise HTTPException(
            status_code=404,
            detail="Cart item not found."
        )

    food = await get_food(target["food_id"])

    # Validate every option and replace client prices.
    target["customizations"] = validate_customizations(
        food,
        [option.dict() for option in request.customizations]
    )

    target["special_instructions"] = (
        request.special_instructions.strip()
    )

    await database.carts.update_one(
        {"customer_id": customer_id},
        {"$set": {"items": items}}
    )

    return await get_cart_response(customer_id)


# ---------------------------------------------------------
# UPDATE QUANTITY
# ---------------------------------------------------------

@router.patch("/items/{item_id}")
async def update_cart_quantity(
    item_id: str,
    quantity: int,
    customer: dict = Depends(get_current_customer)
):
    if quantity < 1 or quantity > 99:
        raise HTTPException(
            status_code=400,
            detail="Quantity must be between 1 and 99."
        )

    customer_id = str(customer["_id"])

    cart = await database.carts.find_one({
        "customer_id": customer_id
    })

    if not cart:
        raise HTTPException(
            status_code=404,
            detail="Cart item not found."
        )

    items = cart.get("items", [])

    target = next(
        (
            item for item in items
            if item.get("cart_item_id") == item_id
        ),
        None
    )

    if not target:
        target = next(
            (
                item for item in items
                if item.get("food_id") == item_id
            ),
            None
        )

    if not target:
        raise HTTPException(
            status_code=404,
            detail="Cart item not found."
        )

    target["quantity"] = quantity

    await database.carts.update_one(
        {"customer_id": customer_id},
        {"$set": {"items": items}}
    )

    return await get_cart_response(customer_id)


# ---------------------------------------------------------
# REMOVE CART ITEM
# ---------------------------------------------------------

@router.delete("/items/{item_id}")
async def remove_cart_item(
    item_id: str,
    customer: dict = Depends(get_current_customer)
):
    customer_id = str(customer["_id"])

    cart = await database.carts.find_one({
        "customer_id": customer_id
    })

    if not cart:
        raise HTTPException(
            status_code=404,
            detail="Cart item not found."
        )

    items = cart.get("items", [])

    updated_items = [
        item for item in items
        if item.get("cart_item_id") != item_id
    ]

    if len(updated_items) == len(items):
        updated_items = [
            item for item in items
            if item.get("food_id") != item_id
        ]

    await database.carts.update_one(
        {"customer_id": customer_id},
        {"$set": {"items": updated_items}}
    )

    return await get_cart_response(customer_id)


# ---------------------------------------------------------
# CLEAR CART
# ---------------------------------------------------------

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
