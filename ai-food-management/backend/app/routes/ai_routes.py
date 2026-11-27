from fastapi import APIRouter
from app.db_config import db

router = APIRouter(
    prefix="/ai",
    tags=["AI Analysis"]
)

inventory_collection = db["inventory"]
transactions_collection = db["inventory_transactions"]


@router.get("/inventory-analysis")
async def inventory_analysis():

    inventory = list(inventory_collection.find())
    transactions = list(transactions_collection.find({
        "transaction_type": "kitchen_usage"
    }))

    analysis = []

    for item in inventory:

        ingredient_name = item.get("ingredient_name", "")
        current_stock = item.get("quantity", 0)
        minimum_stock = item.get("minimum_stock", 0)
        unit = item.get("unit", "")

        total_used = 0

        # Calculate actual usage from kitchen transactions
        for transaction in transactions:

            transaction_ingredient = transaction.get(
                "ingredient_name", ""
            )

            if (
                transaction_ingredient.strip().lower()
                == ingredient_name.strip().lower()
            ):
                total_used += abs(
                    transaction.get("quantity_change", 0)
                )

        # Determine stock status
        if current_stock <= minimum_stock:
            stock_status = "low_stock"
        else:
            stock_status = "normal"

        # Determine demand
        if total_used == 0:
            demand = "no_usage_data"
        elif total_used >= 20:
            demand = "high"
        elif total_used >= 10:
            demand = "medium"
        else:
            demand = "low"

        # Calculate recommended purchase quantity
        recommended_purchase = max(
            minimum_stock - current_stock,
            0
        )

        analysis.append({
            "ingredient_name": ingredient_name,
            "current_stock": current_stock,
            "minimum_stock": minimum_stock,
            "unit": unit,
            "total_used": total_used,
            "stock_status": stock_status,
            "demand": demand,
            "recommended_purchase": recommended_purchase
        })

    return {
        "status": "success",
        "count": len(analysis),
        "analysis": analysis
    }
