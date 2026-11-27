
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException

from app.database import database
from app.security import require_roles


router = APIRouter(
    prefix="/api/admin/orders",
    tags=["Admin Orders"]
)


# ==========================================
# SERIALIZE ORDER
# ==========================================

def serialize_order(order):
    order["order_id"] = str(order.pop("_id"))
    return order


# ==========================================
# GET RESTAURANT IDS FROM ORDER
# ==========================================


def get_id_string(value):
    if isinstance(value, dict):
        value = value.get("_id") or value.get("id")

    if value is None:
        return None

    value = str(value)

    if ObjectId.is_valid(value):
        return value

    return None


async def attach_restaurant_names(orders):

    all_restaurant_ids = set()
    food_ids = set()

    # Collect restaurant IDs and food IDs from orders
    for order in orders:

        for field in ["restaurant_id", "restaurantId"]:
            restaurant_id = get_id_string(order.get(field))
            if restaurant_id:
                all_restaurant_ids.add(restaurant_id)

        statuses = order.get("restaurant_statuses", {})

        if isinstance(statuses, dict):
            for restaurant_id in statuses.keys():
                restaurant_id = get_id_string(restaurant_id)
                if restaurant_id:
                    all_restaurant_ids.add(restaurant_id)

        for item in order.get("items", []):
            food_id = get_id_string(item.get("food_id"))
            if food_id:
                food_ids.add(food_id)

    # Look up food documents for older orders
    food_map = {}

    if food_ids:
        food_object_ids = [
            ObjectId(food_id) for food_id in food_ids
        ]

        foods = await database.foods.find({
            "_id": {"$in": food_object_ids}
        }).to_list(length=2000)

        for food in foods:
            food_map[str(food["_id"])] = food

    # Collect restaurant IDs from food documents
    for food in food_map.values():

        restaurant_id = (
            get_id_string(food.get("restaurant_id"))
            or get_id_string(food.get("restaurantId"))
        )

        if restaurant_id:
            all_restaurant_ids.add(restaurant_id)

    # Look up restaurant documents
    restaurant_map = {}

    if all_restaurant_ids:

        restaurant_object_ids = [
            ObjectId(restaurant_id)
            for restaurant_id in all_restaurant_ids
        ]

        restaurants = await database.restaurants.find({
            "_id": {"$in": restaurant_object_ids}
        }).to_list(length=1000)

        for restaurant in restaurants:

            restaurant_id = str(restaurant["_id"])

            restaurant_name = (
                restaurant.get("name")
                or restaurant.get("restaurant_name")
                or restaurant.get("restaurantName")
                or restaurant.get("title")
                or "Restaurant"
            )

            restaurant_map[restaurant_id] = restaurant_name

    # Attach restaurant names to individual items and orders
    for order in orders:

        names = []

        for item in order.get("items", []):

            food_id = get_id_string(item.get("food_id"))
            food = food_map.get(food_id) if food_id else None

            restaurant_id = (
                get_id_string(item.get("restaurant_id"))
                or get_id_string(item.get("restaurantId"))
            )

            if not restaurant_id and food:
                restaurant_id = (
                    get_id_string(food.get("restaurant_id"))
                    or get_id_string(food.get("restaurantId"))
                )

            restaurant_name = None

            if restaurant_id:
                restaurant_name = restaurant_map.get(restaurant_id)

            if not restaurant_name and food:
                restaurant_name = (
                    food.get("restaurant_name")
                    or food.get("restaurantName")
                )

            if not restaurant_name:
                restaurant_name = (
                    item.get("restaurant_name")
                    or item.get("restaurantName")
                )

            if restaurant_name:
                item["restaurant_name"] = restaurant_name
                names.append(restaurant_name)

            if restaurant_id:
                item["restaurant_id"] = restaurant_id

        # Include any order-level restaurant IDs
        for field in ["restaurant_id", "restaurantId"]:
            restaurant_id = get_id_string(order.get(field))

            if restaurant_id and restaurant_map.get(restaurant_id):
                names.append(restaurant_map[restaurant_id])

        statuses = order.get("restaurant_statuses", {})

        if isinstance(statuses, dict):
            for restaurant_id in statuses.keys():
                restaurant_id = get_id_string(restaurant_id)

                if restaurant_id and restaurant_map.get(restaurant_id):
                    names.append(restaurant_map[restaurant_id])

        names = list(dict.fromkeys(names))

        order["restaurant_name"] = (
            ", ".join(names)
            if names
            else "Restaurant details unavailable"
        )

    return orders

# ==========================================
# GET ALL CUSTOMER ORDERS
# ADMIN CAN VIEW AND MONITOR ALL ORDERS
# ==========================================

@router.get("/")
async def get_all_orders(
    admin: dict = Depends(require_roles("admin"))
):
    try:

        orders = await database.orders.find(
            {}
        ).sort(
            [
                ("created_at", -1),
                ("createdAt", -1)
            ]
        ).to_list(length=1000)

        # Add restaurant names
        orders = await attach_restaurant_names(orders)

        serialized_orders = [
            serialize_order(order)
            for order in orders
        ]

        return {
            "success": True,
            "total_orders": len(serialized_orders),
            "orders": serialized_orders
        }

    except Exception as e:

        print("Admin orders error:", str(e))

        raise HTTPException(
            status_code=500,
            detail="Unable to fetch orders"
        )


# ==========================================
# GET ONE ORDER DETAILS
# ==========================================

@router.get("/{order_id}")
async def get_order_details(
    order_id: str,
    admin: dict = Depends(require_roles("admin"))
):
    try:

        if not ObjectId.is_valid(order_id):
            raise HTTPException(
                status_code=400,
                detail="Invalid order ID"
            )

        order = await database.orders.find_one({
            "_id": ObjectId(order_id)
        })

        if not order:
            raise HTTPException(
                status_code=404,
                detail="Order not found"
            )

        # Add restaurant name
        enriched_orders = await attach_restaurant_names([order])

        return {
            "success": True,
            "order": serialize_order(enriched_orders[0])
        }

    except HTTPException:
        raise

    except Exception as e:

        print("Admin order details error:", str(e))

        raise HTTPException(
            status_code=500,
            detail="Unable to fetch order details"
        )
