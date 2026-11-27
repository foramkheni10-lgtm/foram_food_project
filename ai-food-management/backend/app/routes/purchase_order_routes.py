from fastapi import APIRouter, HTTPException
from bson import ObjectId
from datetime import datetime, timezone
import re

from app.db_config import db
from app.models.purchase_order_model import (
    PurchaseOrderCreate,
    PurchaseOrderUpdate
)

router = APIRouter(
    prefix="/purchase-orders",
    tags=["Purchase Orders"]
)

purchase_orders_collection = db["purchase_orders"]
inventory_collection = db["inventory"]
transactions_collection = db["inventory_transactions"]
suppliers_collection = db["suppliers"]


def validate_supplier(supplier_id: str):
    """Check whether the selected supplier exists."""

    if not ObjectId.is_valid(supplier_id):
        raise HTTPException(
            status_code=400,
            detail="Invalid supplier ID"
        )

    supplier = suppliers_collection.find_one(
        {"_id": ObjectId(supplier_id)}
    )

    if not supplier:
        raise HTTPException(
            status_code=404,
            detail="Supplier not found"
        )


# =========================================================
# CREATE PURCHASE ORDER
# =========================================================
@router.post("/")
async def create_purchase_order(order: PurchaseOrderCreate):

    validate_supplier(order.supplier_id)

    order_data = order.dict()
    order_data["ingredient_name"] = order_data["ingredient_name"].strip()
    order_data["unit"] = order_data["unit"].strip()

    if not order_data["ingredient_name"] or not order_data["unit"]:
        raise HTTPException(
            status_code=400,
            detail="Ingredient name and unit cannot be empty"
        )

    result = purchase_orders_collection.insert_one(order_data)

    return {
        "status": "success",
        "message": "Purchase order created successfully",
        "purchase_order_id": str(result.inserted_id)
    }


# =========================================================
# GET ALL PURCHASE ORDERS
# =========================================================
@router.get("/")
async def get_purchase_orders():

    orders = []

    for order in purchase_orders_collection.find():
        order["_id"] = str(order["_id"])
        orders.append(order)

    return {
        "status": "success",
        "count": len(orders),
        "purchase_orders": orders
    }


# =========================================================
# GET PURCHASE ORDER BY ID
# =========================================================
@router.get("/{order_id}")
async def get_purchase_order(order_id: str):

    if not ObjectId.is_valid(order_id):
        raise HTTPException(
            status_code=400,
            detail="Invalid purchase order ID"
        )

    order = purchase_orders_collection.find_one(
        {"_id": ObjectId(order_id)}
    )

    if not order:
        raise HTTPException(
            status_code=404,
            detail="Purchase order not found"
        )

    order["_id"] = str(order["_id"])

    return {
        "status": "success",
        "purchase_order": order
    }


# =========================================================
# UPDATE PURCHASE ORDER
# =========================================================
@router.put("/{order_id}")
async def update_purchase_order(
    order_id: str,
    order: PurchaseOrderUpdate
):

    if not ObjectId.is_valid(order_id):
        raise HTTPException(
            status_code=400,
            detail="Invalid purchase order ID"
        )

    existing_order = purchase_orders_collection.find_one(
        {"_id": ObjectId(order_id)}
    )

    if not existing_order:
        raise HTTPException(
            status_code=404,
            detail="Purchase order not found"
        )

    if existing_order.get("status", "").lower() == "received":
        raise HTTPException(
            status_code=400,
            detail="Received purchase orders cannot be edited"
        )

    update_data = {
        key: value
        for key, value in order.dict().items()
        if value is not None
    }

    if not update_data:
        raise HTTPException(
            status_code=400,
            detail="No data provided for update"
        )

    if "supplier_id" in update_data:
        validate_supplier(update_data["supplier_id"])

    if "ingredient_name" in update_data:
        update_data["ingredient_name"] = update_data["ingredient_name"].strip()

        if not update_data["ingredient_name"]:
            raise HTTPException(
                status_code=400,
                detail="Ingredient name cannot be empty"
            )

    if "unit" in update_data:
        update_data["unit"] = update_data["unit"].strip()

        if not update_data["unit"]:
            raise HTTPException(
                status_code=400,
                detail="Unit cannot be empty"
            )

    result = purchase_orders_collection.update_one(
        {
            "_id": ObjectId(order_id),
            "status": {"$ne": "received"}
        },
        {"$set": update_data}
    )

    if result.matched_count == 0:
        raise HTTPException(
            status_code=400,
            detail="Purchase order could not be updated"
        )

    return {
        "status": "success",
        "message": "Purchase order updated successfully"
    }


# =========================================================
# DELETE PURCHASE ORDER
# =========================================================
@router.delete("/{order_id}")
async def delete_purchase_order(order_id: str):

    if not ObjectId.is_valid(order_id):
        raise HTTPException(
            status_code=400,
            detail="Invalid purchase order ID"
        )

    result = purchase_orders_collection.delete_one(
        {
            "_id": ObjectId(order_id),
            "status": {"$ne": "received"}
        }
    )

    if result.deleted_count == 0:
        existing_order = purchase_orders_collection.find_one(
            {"_id": ObjectId(order_id)}
        )

        if not existing_order:
            raise HTTPException(
                status_code=404,
                detail="Purchase order not found"
            )

        raise HTTPException(
            status_code=400,
            detail="Received purchase orders cannot be deleted"
        )

    return {
        "status": "success",
        "message": "Purchase order deleted successfully"
    }


# =========================================================
# RECEIVE PURCHASE ORDER → UPDATE INVENTORY
# =========================================================
@router.post("/{order_id}/receive")
async def receive_purchase_order(order_id: str):

    if not ObjectId.is_valid(order_id):
        raise HTTPException(
            status_code=400,
            detail="Invalid purchase order ID"
        )

    order = purchase_orders_collection.find_one(
        {"_id": ObjectId(order_id)}
    )

    if not order:
        raise HTTPException(
            status_code=404,
            detail="Purchase order not found"
        )

    if order.get("status", "").lower() == "received":
        raise HTTPException(
            status_code=400,
            detail="Purchase order has already been received"
        )

    ingredient_name = order.get("ingredient_name")
    quantity = order.get("quantity")
    unit = order.get("unit")

    if not ingredient_name or quantity is None or not unit:
        raise HTTPException(
            status_code=400,
            detail="Purchase order has incomplete ingredient information"
        )

    if quantity <= 0:
        raise HTTPException(
            status_code=400,
            detail="Purchase order quantity must be greater than 0"
        )

    inventory = inventory_collection.find_one(
        {
            "ingredient_name": {
                "$regex": f"^{re.escape(ingredient_name)}$",
                "$options": "i"
            }
        }
    )

    if not inventory:
        raise HTTPException(
            status_code=404,
            detail=f"Inventory for '{ingredient_name}' not found"
        )

    inventory_unit = inventory.get("unit")

    if inventory_unit and inventory_unit.lower() != unit.lower():
        raise HTTPException(
            status_code=400,
            detail=(
                f"Unit mismatch. Inventory uses '{inventory_unit}' "
                f"but purchase order uses '{unit}'"
            )
        )

    old_quantity = inventory.get("quantity", 0)
    new_quantity = old_quantity + quantity

    # Claim the order first so another request cannot receive it again.
    claim_result = purchase_orders_collection.update_one(
        {
            "_id": ObjectId(order_id),
            "status": {"$ne": "received"}
        },
        {
            "$set": {"status": "received"}
        }
    )

    if claim_result.modified_count == 0:
        raise HTTPException(
            status_code=400,
            detail="Purchase order has already been received"
        )

    try:
        inventory_result = inventory_collection.update_one(
            {
                "_id": inventory["_id"],
                "quantity": old_quantity
            },
            {
                "$set": {"quantity": new_quantity}
            }
        )

        if inventory_result.modified_count == 0:
            raise Exception("Inventory changed. Please try again.")

        transactions_collection.insert_one({
            "inventory_id": str(inventory["_id"]),
            "ingredient_id": str(inventory.get("ingredient_id", "")),
            "ingredient_name": inventory.get(
                "ingredient_name",
                ingredient_name
            ),
            "transaction_type": "purchase_received",
            "previous_quantity": old_quantity,
            "new_quantity": new_quantity,
            "quantity_change": quantity,
            "unit": inventory_unit or unit,
            "source": "purchase_order",
            "reference_id": order_id,
            "note": "Stock added through purchase order",
            "created_at": datetime.now(timezone.utc)
        })

    except Exception as error:
        # Attempt to restore the order status if receiving failed.
        purchase_orders_collection.update_one(
            {
                "_id": ObjectId(order_id),
                "status": "received"
            },
            {
                "$set": {"status": order.get("status", "pending")}
            }
        )

        # If stock was updated, attempt to restore the previous quantity.
        inventory_collection.update_one(
            {
                "_id": inventory["_id"],
                "quantity": new_quantity
            },
            {
                "$set": {"quantity": old_quantity}
            }
        )

        raise HTTPException(
            status_code=500,
            detail=f"Could not receive purchase order: {str(error)}"
        )

    return {
        "status": "success",
        "message": "Purchase order received and inventory updated successfully",
        "purchase_order_id": order_id,
        "ingredient_name": inventory.get(
            "ingredient_name",
            ingredient_name
        ),
        "received_quantity": quantity,
        "previous_stock": old_quantity,
        "new_stock": new_quantity,
        "unit": inventory_unit or unit,
        "purchase_order_status": "received"
    }
