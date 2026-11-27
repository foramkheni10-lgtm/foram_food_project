
from fastapi import APIRouter, Depends, HTTPException
from app.database import database
from app.security import require_roles

router = APIRouter(
    prefix="/api/admin/dashboard",
    tags=["Admin Dashboard"]
)


@router.get("/")
async def get_admin_dashboard(
    admin: dict = Depends(require_roles("admin"))
):
    try:
        total_orders = await database.orders.count_documents({})

        placed_orders = await database.orders.count_documents({
            "$or": [
                {"order_status": {"$in": ["Placed", "placed"]}},
                {"status": {"$in": ["Placed", "placed"]}}
            ]
        })

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

        total_deliveries = await database.deliveries.count_documents({})

        delivered_orders = await database.deliveries.count_documents({
            "$or": [
                {"delivery_status": {"$in": ["Delivered", "delivered"]}},
                {"status": {"$in": ["Delivered", "delivered"]}}
            ]
        })

        total_inventory_items = await database.inventory.count_documents({})
        total_ingredients = await database.ingredients.count_documents({})

        inventory_items = await database.inventory.find({}).to_list(length=1000)

        inventory_stock = []

        for item in inventory_items:
            inventory_stock.append({
                "name": item.get("ingredient_name", "Unknown"),
                "quantity": float(item.get("quantity", 0) or 0),
                "minimumStock": float(item.get("minimum_stock", 0) or 0),
                "unit": item.get("unit", "")
            })

        return {
            "success": True,
            "totalOrders": total_orders,
            "placedOrders": placed_orders,
            "completedOrders": completed_orders,
            "cancelledOrders": cancelled_orders,
            "totalDeliveries": total_deliveries,
            "deliveredOrders": delivered_orders,
            "totalInventoryItems": total_inventory_items,
            "totalIngredients": total_ingredients,
            "inventoryStock": inventory_stock
        }

    except Exception as e:
        print("Admin dashboard error:", str(e))
        raise HTTPException(
            status_code=500,
            detail="Unable to load dashboard statistics"
        )
