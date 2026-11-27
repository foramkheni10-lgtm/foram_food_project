
from datetime import datetime, timedelta, timezone
from math import ceil
from typing import Optional

from bson import ObjectId
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.db_config import db


router = APIRouter(
    prefix="/api/ai",
    tags=["AI Features"]
)

# MongoDB collections
orders_collection = db["orders"]
foods_collection = db["foods"]
restaurants_collection = db["restaurants"]
tables_collection = db["tables"]

# ==========================================================
# COMMON HELPER FUNCTIONS
# ==========================================================

def check_restaurant(restaurant_id: str):

    if not ObjectId.is_valid(restaurant_id):
        raise HTTPException(
            status_code=400,
            detail="Invalid restaurant ID"
        )

    restaurant = restaurants_collection.find_one({
        "_id": ObjectId(restaurant_id)
    })

    if not restaurant:
        raise HTTPException(
            status_code=404,
            detail="Restaurant not found"
        )

    return restaurant


def get_restaurant_foods(restaurant_id: str):

    foods = list(foods_collection.find({
        "restaurant_id": restaurant_id
    }))

    return foods


def get_order_date(created_at):

    if isinstance(created_at, datetime):
        if created_at.tzinfo is None:
            created_at = created_at.replace(tzinfo=timezone.utc)

        return created_at.date()

    if isinstance(created_at, str):
        try:
            created_at = datetime.fromisoformat(
                created_at.replace("Z", "+00:00")
            )

            return created_at.date()

        except ValueError:
            return None

    return None


def get_restaurant_order_status(order, restaurant_id):

    restaurant_statuses = order.get(
        "restaurant_statuses", {}
    )

    return str(
        restaurant_statuses.get(
            restaurant_id,
            order.get("order_status", "")
        )
    ).lower()


def get_completed_orders(restaurant_id, food_ids):

    if not food_ids:
        return []

    orders = orders_collection.find({
        "items.food_id": {"$in": food_ids}
    })

    completed_orders = []

    for order in orders:

        status = get_restaurant_order_status(
            order,
            restaurant_id
        )

        if status != "completed":
            continue

        completed_items = []

        for item in order.get("items", []):

            food_id = str(item.get("food_id", ""))

            if food_id in food_ids:
                completed_items.append(item)

        if completed_items:
            order["restaurant_items"] = completed_items
            completed_orders.append(order)

    return completed_orders


def get_food_analysis(restaurant_id):

    foods = get_restaurant_foods(restaurant_id)

    food_map = {}

    for food in foods:

        food_id = str(food["_id"])

        food_map[food_id] = {
            "food_id": food_id,
            "food_name": food.get("food_name", "Unknown Food"),
            "category": food.get("category", "Other"),
            "quantity_sold": 0,
            "revenue": 0
        }

    food_ids = list(food_map.keys())

    orders = get_completed_orders(
        restaurant_id,
        food_ids
    )

    for order in orders:

        for item in order.get("restaurant_items", []):

            food_id = str(item.get("food_id", ""))

            if food_id not in food_map:
                continue

            quantity = int(item.get("quantity", 0) or 0)

            subtotal = item.get("subtotal")

            if subtotal is None:
                price = float(item.get("price", 0) or 0)
                subtotal = price * quantity
            else:
                subtotal = float(subtotal)

            food_map[food_id]["quantity_sold"] += quantity
            food_map[food_id]["revenue"] += subtotal

    all_foods = list(food_map.values())

    for food in all_foods:
        food["revenue"] = round(food["revenue"], 2)

    popular_foods = sorted(
        all_foods,
        key=lambda x: x["quantity_sold"],
        reverse=True
    )[:5]

    low_selling_foods = sorted(
        all_foods,
        key=lambda x: x["quantity_sold"]
    )[:5]

    return {
        "foods": all_foods,
        "orders": orders,
        "popular_foods": popular_foods,
        "low_selling_foods": low_selling_foods,
        "total_items_sold": sum(
            food["quantity_sold"] for food in all_foods
        ),
        "total_revenue": round(
            sum(food["revenue"] for food in all_foods), 2
        ),
        "total_completed_orders": len(orders)
    }


# ==========================================================
# 1. POPULAR FOOD ANALYSIS
# ==========================================================

@router.get("/popular-foods/{restaurant_id}")
async def popular_food_analysis(restaurant_id: str):

    restaurant = check_restaurant(restaurant_id)

    analysis = get_food_analysis(restaurant_id)

    return {
        "success": True,
        "restaurant_name": restaurant.get(
            "restaurantName",
            restaurant.get("restaurant_name", "")
        ),
        "total_completed_orders": analysis[
            "total_completed_orders"
        ],
        "total_items_sold": analysis["total_items_sold"],
        "total_revenue": analysis["total_revenue"],
        "popular_foods": analysis["popular_foods"],
        "low_selling_foods": analysis["low_selling_foods"]
    }


# ==========================================================
# 2. SALES PREDICTION
# ==========================================================

@router.get("/sales-prediction/{restaurant_id}")
async def sales_prediction(restaurant_id: str):

    check_restaurant(restaurant_id)

    analysis = get_food_analysis(restaurant_id)

    orders = analysis["orders"]

    today = datetime.now(timezone.utc).date()

    # Last 7 calendar days, including days with zero sales
    daily_sales = {}

    for i in range(6, -1, -1):

        day = today - timedelta(days=i)

        daily_sales[day.isoformat()] = 0.0

    for order in orders:

        order_date = get_order_date(
            order.get("created_at")
        )

        if not order_date:
            continue

        date_key = order_date.isoformat()

        if date_key not in daily_sales:
            continue

        for item in order.get("restaurant_items", []):

            subtotal = item.get("subtotal")

            if subtotal is None:
                subtotal = (
                    float(item.get("price", 0) or 0)
                    * int(item.get("quantity", 0) or 0)
                )

            daily_sales[date_key] += float(subtotal)

    # Average daily revenue over the 7-day period
    total_last_7_days = sum(daily_sales.values())

    average_daily_sales = total_last_7_days / 7

    tomorrow = today + timedelta(days=1)

    tomorrow_prediction = round(
        average_daily_sales, 2
    )

    weekly_prediction = round(
        average_daily_sales * 7, 2
    )

    return {
        "success": True,
        "method": "7-day average baseline",
        "historical_days": 7,
        "historical_revenue": round(
            total_last_7_days, 2
        ),
        "average_daily_sales": round(
            average_daily_sales, 2
        ),
        "tomorrow": {
            "date": tomorrow.isoformat(),
            "predicted_sales": tomorrow_prediction
        },
        "next_7_days": {
            "predicted_sales": weekly_prediction
        },
        "daily_sales": [
            {
                "date": date,
                "sales": round(sales, 2)
            }
            for date, sales in daily_sales.items()
        ],
        "notice": (
            "This is a basic estimate. More historical orders "
            "are needed for reliable machine-learning predictions."
        )
    }


# ==========================================================
# 3. FOOD DEMAND PREDICTION
# ==========================================================

@router.get("/demand-prediction/{restaurant_id}")
async def demand_prediction(restaurant_id: str):

    check_restaurant(restaurant_id)

    analysis = get_food_analysis(restaurant_id)

    foods = analysis["foods"]
    orders = analysis["orders"]

    today = datetime.now(timezone.utc).date()

    seven_days_ago = today - timedelta(days=6)

    food_demand = {
        food["food_id"]: {
            "food_id": food["food_id"],
            "food_name": food["food_name"],
            "quantity_sold_last_7_days": 0
        }
        for food in foods
    }

    for order in orders:

        order_date = get_order_date(
            order.get("created_at")
        )

        if not order_date:
            continue

        if order_date < seven_days_ago or order_date > today:
            continue

        for item in order.get("restaurant_items", []):

            food_id = str(item.get("food_id", ""))

            if food_id not in food_demand:
                continue

            quantity = int(item.get("quantity", 0) or 0)

            food_demand[food_id][
                "quantity_sold_last_7_days"
            ] += quantity

    predictions = []

    for food in food_demand.values():

        average_daily_demand = (
            food["quantity_sold_last_7_days"] / 7
        )

        predicted_quantity = ceil(
            average_daily_demand
        )

        predictions.append({
            "food_id": food["food_id"],
            "food_name": food["food_name"],
            "quantity_sold_last_7_days": food[
                "quantity_sold_last_7_days"
            ],
            "average_daily_demand": round(
                average_daily_demand, 2
            ),
            "predicted_quantity_tomorrow": predicted_quantity
        })

    predictions.sort(
        key=lambda x: x["predicted_quantity_tomorrow"],
        reverse=True
    )

    return {
        "success": True,
        "method": "7-day average demand baseline",
        "predictions": predictions,
        "notice": (
            "Predictions are estimates based on completed orders. "
            "Ingredient requirements need recipe quantities."
        )
    }


# ==========================================================
# 4. FOOD RECOMMENDATIONS
# ==========================================================

@router.get("/recommendations/{restaurant_id}")
async def food_recommendations(
    restaurant_id: str,
    customer_id: Optional[str] = None
):

    check_restaurant(restaurant_id)

    analysis = get_food_analysis(restaurant_id)

    foods = analysis["foods"]
    orders = analysis["orders"]

    if not foods:
        return {
            "success": True,
            "recommendations": [],
            "message": "No menu items found"
        }

    purchased_foods = set()
    customer_food_counts = {}

    # Read customer's previous completed orders
    if customer_id:

        for order in orders:

            if str(order.get("customer_id", "")) != customer_id:
                continue

            for item in order.get("restaurant_items", []):

                food_id = str(item.get("food_id", ""))

                purchased_foods.add(food_id)

                customer_food_counts[food_id] = (
                    customer_food_counts.get(food_id, 0)
                    + int(item.get("quantity", 0) or 0)
                )

    recommendations = []

    for food in foods:

        if food["food_id"] in purchased_foods:
            continue

        popularity = food["quantity_sold"]

        recommendations.append({
            "food_id": food["food_id"],
            "food_name": food["food_name"],
            "category": food["category"],
            "quantity_sold": popularity,
            "reason": (
                "Popular among restaurant customers"
                if popularity > 0
                else "Try this menu item"
            ),
            "score": popularity
        })

    recommendations.sort(
        key=lambda x: x["score"],
        reverse=True
    )

    return {
        "success": True,
        "customer_id": customer_id,
        "recommendations": recommendations[:5],
        "method": (
            "Customer purchase history and restaurant popularity"
            if customer_id
            else "Restaurant popularity"
        )
    }


# ==========================================================
# 5. RESTAURANT AI ASSISTANT
# ==========================================================

class AssistantQuestion(BaseModel):
    restaurant_id: str
    question: str


@router.post("/assistant")
async def restaurant_assistant(data: AssistantQuestion):

    restaurant = check_restaurant(data.restaurant_id)

    analysis = get_food_analysis(data.restaurant_id)

    question = data.question.lower().strip()

    if not question:
        raise HTTPException(
            status_code=400,
            detail="Please enter a question"
        )

    popular = analysis["popular_foods"]
    low_selling = analysis["low_selling_foods"]

    # Popular food questions
    if any(word in question for word in [
        "popular", "best selling", "top food", "most sold"
    ]):

        if popular and popular[0]["quantity_sold"] > 0:

            answer = (
                f"Your best-selling food is "
                f"{popular[0]['food_name']} with "
                f"{popular[0]['quantity_sold']} items sold."
            )

        else:
            answer = "There are not enough completed sales yet."

    # Low-selling food questions
    elif any(word in question for word in [
        "low selling", "least selling", "slow selling"
    ]):

        if low_selling:

            zero_sales = [
                food["food_name"]
                for food in low_selling
                if food["quantity_sold"] == 0
            ]

            if zero_sales:
                answer = (
                    "These foods have no recorded sales: "
                    + ", ".join(zero_sales)
                )
            else:
                answer = (
                    f"Your lowest-selling food is "
                    f"{low_selling[0]['food_name']}."
                )

        else:
            answer = "No menu items are available for analysis."

    # Revenue questions
    elif any(word in question for word in [
        "revenue", "income", "earning", "sales amount"
    ]):

        answer = (
            f"Your completed-order revenue is "
            f"₹{analysis['total_revenue']:.2f}."
        )

    # Order questions
    elif "order" in question:

        answer = (
            f"You have {analysis['total_completed_orders']} "
            f"completed orders in the available order data."
        )

    # Demand questions
    elif any(word in question for word in [
        "demand", "prepare", "preparation", "quantity"
    ]):

        answer = (
            "You can use the Food Demand Prediction section "
            "to estimate tomorrow's food quantities based "
            "on the last 7 days of completed orders."
        )

    # Menu questions
    elif any(word in question for word in [
        "menu", "food items", "total food"
    ]):

        answer = (
            f"Your restaurant currently has "
            f"{len(analysis['foods'])} food items in its menu."
        )

    else:

        answer = (
            "I can help with popular foods, low-selling foods, "
            "sales revenue, completed orders, food demand, "
            "and menu information. Please ask one of these questions."
        )

    return {
        "success": True,
        "restaurant_name": restaurant.get(
            "restaurantName",
            restaurant.get("restaurant_name", "")
        ),
        "question": data.question,
        "answer": answer,
        "assistant_type": "Local rule-based restaurant assistant"
    }

# ==========================================================
# 6. AI TABLE MONITORING FOR RESTAURANTS
# ==========================================================

TABLE_TERMINAL_STATUSES = [
    "completed",
    "delivered",
    "rejected",
    "cancelled"
]


def parse_monitoring_datetime(value):

    if isinstance(value, str):
        try:
            value = datetime.fromisoformat(
                value.replace("Z", "+00:00")
            )
        except ValueError:
            return None

    if not isinstance(value, datetime):
        return None

    if value.tzinfo is None:
        value = value.replace(tzinfo=timezone.utc)

    return value


@router.get("/table-monitoring/{restaurant_id}")
async def table_monitoring(restaurant_id: str):

    check_restaurant(restaurant_id)

    now = datetime.now(timezone.utc)

    all_tables = tables_collection.find().sort(
        "table_number_key", 1
    )

    result = []

    for table in all_tables:

        table_number = table.get("table_number", "")

        baseline = parse_monitoring_datetime(
            table.get(
                "last_cleared_at",
                table.get("created_at")
            )
        )

        dine_in_orders = orders_collection.find({
            "delivery_type": {
                "$regex": "^dine_in$",
                "$options": "i"
            },
            "table_number": table_number
        }).sort("created_at", -1)

        current_orders = []
        restaurant_orders = []
        occupancy_times = []

        for order in dine_in_orders:

            order_created = parse_monitoring_datetime(
                order.get("created_at")
            )

            restaurant_statuses = order.get(
                "restaurant_statuses", {}
            )

            involved_restaurants = set()
            own_items = []

            # Find which restaurants own the food items.
            for item in order.get("items", []):

                food_id = str(item.get("food_id", ""))

                if not ObjectId.is_valid(food_id):
                    continue

                food = foods_collection.find_one({
                    "_id": ObjectId(food_id)
                })

                if not food:
                    continue

                food_restaurant_id = str(
                    food.get("restaurant_id", "")
                )

                if food_restaurant_id:
                    involved_restaurants.add(
                        food_restaurant_id
                    )

                # Keep only this restaurant's food items.
                if food_restaurant_id == restaurant_id:

                    own_items.append({
                        "name": item.get(
                            "name",
                            food.get("food_name", "Food")
                        ),
                        "quantity": int(
                            item.get("quantity", 1) or 1
                        )
                    })

            # Find the status of every restaurant involved.
            statuses = []

            for rid in involved_restaurants:

                status = restaurant_statuses.get(
                    rid,
                    order.get("order_status", "Placed")
                )

                statuses.append(str(status).strip().lower())

            if not statuses:
                statuses.append(
                    str(
                        order.get("order_status", "Placed")
                    ).strip().lower()
                )

            # Ignore orders rejected or cancelled by every restaurant.
            if all(
                status in ["rejected", "cancelled"]
                for status in statuses
            ):
                continue

            # Ignore old completed orders from a previous table session.
            is_after_clear = (
                baseline is None
                or order_created is None
                or order_created > baseline
            )

            has_unfinished_order = any(
                status not in TABLE_TERMINAL_STATUSES
                for status in statuses
            )

            if not is_after_clear and not has_unfinished_order:
                continue

            current_orders.append({
                "statuses": statuses,
                "created_at": order_created
            })

            if order_created:
                occupancy_times.append(order_created)

            # Include this order in the restaurant view only
            # when it contains food belonging to this restaurant.
            if own_items:

                own_status = str(
                    restaurant_statuses.get(
                        restaurant_id,
                        order.get("order_status", "Placed")
                    )
                ).title()

                restaurant_orders.append({
                    "order_id": str(order["_id"]),
                    "order_number": order.get(
                        "order_number", ""
                    ),
                    "customer_name": order.get(
                        "customer_name", "Customer"
                    ),
                    "order_status": own_status,
                    "items": own_items
                })

        # Determine shared table status using all restaurants' orders.
        if current_orders:
            current_status = "Occupied"
        else:
            current_status = table.get(
                "manual_status", "Available"
            )

        # Calculate occupancy duration.
        occupied_minutes = 0

        if current_status == "Occupied" and occupancy_times:

            occupied_since = min(occupancy_times)

            occupied_minutes = max(
                0,
                int(
                    (now - occupied_since).total_seconds() / 60
                )
            )

        # Count this restaurant's pending orders.
        own_pending_count = sum(
            1
            for order in restaurant_orders
            if order["order_status"].lower()
            not in TABLE_TERMINAL_STATUSES
        )

        own_active_count = len(restaurant_orders)

        # Check whether all restaurants have completed their orders.
        all_orders_completed = (
            bool(current_orders)
            and all(
                all(
                    status in TABLE_TERMINAL_STATUSES
                    for status in order["statuses"]
                )
                for order in current_orders
            )
        )

        # AI-generated monitoring suggestions.
        recommendations = []

        if current_status != "Occupied":

            ai_message = (
                "This table is currently "
                + current_status.lower()
                + ". No active dine-in session is detected."
            )

        elif all_orders_completed:

            ai_message = (
                "All restaurant orders in this table session "
                "are completed. The table is still occupied "
                "until food court staff confirm customer departure."
            )

            recommendations.append(
                "Food court staff should verify whether the "
                "customer has left."
            )

        elif occupied_minutes >= 60:

            ai_message = (
                "This table has been occupied for more than "
                "one hour. It may need staff attention."
            )

            recommendations.append(
                "Ask food court staff to check the table."
            )

        elif occupied_minutes >= 30:

            ai_message = (
                "This table has been occupied for a while. "
                "Monitor its order progress."
            )

        else:

            ai_message = (
                "The table is occupied. Continue monitoring "
                "your restaurant's order progress."
            )

        if own_pending_count > 0:

            recommendations.append(
                f"You have {own_pending_count} pending "
                f"order(s) associated with this table."
            )

        elif own_active_count > 0:

            recommendations.append(
                "Your restaurant's orders for this table "
                "are completed."
            )

        elif current_status == "Occupied":

            recommendations.append(
                "Other restaurant orders may be associated "
                "with this shared table."
            )

        result.append({
            "_id": str(table["_id"]),
            "table_number": table_number,
            "capacity": table.get("capacity", 2),
            "notes": table.get("notes", ""),
            "status": current_status,
            "occupied_minutes": occupied_minutes,
            "own_active_orders_count": own_active_count,
            "own_pending_orders_count": own_pending_count,
            "restaurant_orders": restaurant_orders,
            "ai_message": ai_message,
            "recommendations": recommendations
        })

    return {
        "success": True,
        "restaurant_id": restaurant_id,
        "total_tables": len(result),
        "occupied_tables": sum(
            1 for table in result
            if table["status"] == "Occupied"
        ),
        "available_tables": sum(
            1 for table in result
            if table["status"] == "Available"
        ),
        "tables": result
    }