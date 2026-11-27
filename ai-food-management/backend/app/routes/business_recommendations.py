
from fastapi import APIRouter, Depends, HTTPException
from app.database import database
from app.security import require_roles

router = APIRouter(
    prefix="/api/ai/business-recommendations",
    tags=["AI Business Recommendations"]
)


@router.get("/")
async def get_business_recommendations(
    admin: dict = Depends(require_roles("admin"))
):
    try:
        total_orders = await database.orders.count_documents({})

        completed_orders = await database.orders.count_documents({
            "$or": [
                {"order_status": {"$in": ["Completed", "Delivered", "completed", "delivered"]}},
                {"status": {"$in": ["Completed", "Delivered", "completed", "delivered"]}}
            ]
        })

        cancelled_orders = await database.orders.count_documents({
            "$or": [
                {"order_status": {"$in": ["Cancelled", "Canceled", "Rejected", "cancelled", "canceled", "rejected"]}},
                {"status": {"$in": ["Cancelled", "Canceled", "Rejected", "cancelled", "canceled", "rejected"]}}
            ]
        })

        recommendations = []

        # Check ingredient stock levels
        ingredients = await database.inventory.find({}).to_list(length=1000)

        low_stock_items = []

        for ingredient in ingredients:
            quantity = float(ingredient.get("quantity", 0) or 0)
            minimum_stock = float(ingredient.get("minimum_stock", 0) or 0)

            if quantity <= minimum_stock:
                low_stock_items.append(ingredient)

        for ingredient in low_stock_items:
            name = ingredient.get("ingredient_name", "Unknown ingredient")
            quantity = ingredient.get("quantity", 0)
            unit = ingredient.get("unit", "")

            recommendations.append({
                "type": "warning",
                "category": "Inventory",
                "message": name + " is running low",
                "suggestion": (
                    "Current stock is "
                    + str(quantity)
                    + " "
                    + str(unit)
                    + ". Please arrange replenishment."
                )
            })

        # Order performance insight
        if total_orders > 0:
            completion_rate = (completed_orders / total_orders) * 100

            if completion_rate < 50:
                recommendations.append({
                    "type": "warning",
                    "category": "Orders",
                    "message": "Order completion rate needs attention",
                    "suggestion": (
                        "Only "
                        + str(round(completion_rate, 1))
                        + "% of orders are completed. Review pending orders."
                    )
                })

        # Cancellation insight
        if cancelled_orders > 0:
            recommendations.append({
                "type": "warning",
                "category": "Orders",
                "message": "Cancelled orders detected",
                "suggestion": (
                    str(cancelled_orders)
                    + " orders are cancelled or rejected. Review the reasons."
                )
            })

        # Positive insight when stock is healthy
        if not low_stock_items and total_orders > 0:
            recommendations.append({
                "type": "success",
                "category": "Inventory",
                "message": "Ingredient stock levels look healthy",
                "suggestion": "Continue monitoring stock to avoid shortages."
            })

        return {
            "success": True,
            "totalOrders": total_orders,
            "completedOrders": completed_orders,
            "cancelledOrders": cancelled_orders,
            "lowStockItems": len(low_stock_items),
            "recommendationCount": len(recommendations),
            "recommendations": recommendations
        }

    except Exception as e:
        print("Business recommendations error:", str(e))
        raise HTTPException(
            status_code=500,
            detail="Unable to generate business recommendations"
        )
