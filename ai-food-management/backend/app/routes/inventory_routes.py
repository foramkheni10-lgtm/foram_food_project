from fastapi import APIRouter, HTTPException
from bson import ObjectId
from datetime import datetime, timezone
import re

from app.db_config import db
from app.models.inventory_model import (
    InventoryCreate,
    InventoryUpdate
)

router = APIRouter(
    prefix="/inventory",
    tags=["Inventory"]
)

inventory_collection = db["inventory"]
ingredients_collection = db["ingredients"]
suppliers_collection = db["suppliers"]
transactions_collection = db["inventory_transactions"]


# ==========================================
# HELPER: GET OR FIX INGREDIENT ID
# ==========================================

def resolve_ingredient_id(inventory, inventory_id=None):

    ingredient_id = inventory.get("ingredient_id")

    # Check whether existing ingredient ID is valid
    if ingredient_id and ObjectId.is_valid(str(ingredient_id)):
        ingredient = ingredients_collection.find_one({
            "_id": ObjectId(str(ingredient_id))
        })

        if ingredient:
            return str(ingredient["_id"])

    # If ID is missing or invalid, search by ingredient name
    ingredient_name = inventory.get("ingredient_name", "")

    if ingredient_name:
        ingredient = ingredients_collection.find_one({
            "name": {
                "$regex": f"^{ingredient_name.strip()}$",
                "$options": "i"
            }
        })

        if ingredient:
            actual_id = str(ingredient["_id"])

            # Update old inventory record with actual ingredient ID
            if inventory_id is not None:
                inventory_collection.update_one(
                    {"_id": ObjectId(str(inventory_id))},
                    {"$set": {"ingredient_id": actual_id}}
                )

            return actual_id

    return ""



# ==========================================
# FIX MISSING INGREDIENT IDs
# ==========================================

@router.post("/fix-ingredient-ids")
async def fix_missing_ingredient_ids():

    inventory_items = list(inventory_collection.find())

    updated_count = 0
    skipped_items = []

    for item in inventory_items:

        existing_id = item.get("ingredient_id")

        # Skip records that already have a valid ingredient ID
        if existing_id and ObjectId.is_valid(str(existing_id)):
            ingredient = ingredients_collection.find_one({
                "_id": ObjectId(str(existing_id))
            })

            if ingredient:
                continue

        ingredient_name = item.get("ingredient_name", "").strip()

        if not ingredient_name:
            skipped_items.append({
                "ingredient_name": ingredient_name,
                "reason": "Ingredient name is missing"
            })
            continue

        # Find exact ingredient name, ignoring letter case
        matches = list(ingredients_collection.find({
            "name": {
                "$regex": f"^{re.escape(ingredient_name)}$",
                "$options": "i"
            }
        }))

        # Avoid updating if no match or multiple matches exist
        if len(matches) != 1:
            skipped_items.append({
                "ingredient_name": ingredient_name,
                "reason": (
                    "Ingredient not found"
                    if len(matches) == 0
                    else "Multiple matching ingredients found"
                )
            })
            continue

        actual_ingredient_id = str(matches[0]["_id"])

        # Update inventory record
        inventory_collection.update_one(
            {"_id": item["_id"]},
            {"$set": {"ingredient_id": actual_ingredient_id}}
        )

        # Also update old transactions for this inventory record
        transactions_collection.update_many(
            {"inventory_id": str(item["_id"])},
            {"$set": {"ingredient_id": actual_ingredient_id}}
        )

        updated_count += 1

    return {
        "status": "success",
        "message": "Ingredient ID migration completed",
        "updated_count": updated_count,
        "skipped_items": skipped_items
    }


# ==========================================
# HELPER: RECORD INVENTORY TRANSACTION
# ==========================================

def log_inventory_transaction(
    inventory_id,
    inventory,
    transaction_type,
    previous_quantity,
    new_quantity,
    source="manual",
    note=None
):

    actual_ingredient_id = resolve_ingredient_id(
        inventory,
        inventory_id
    )

    transaction_data = {
        "inventory_id": str(inventory_id),
        "ingredient_id": actual_ingredient_id,
        "ingredient_name": inventory.get("ingredient_name", ""),
        "transaction_type": transaction_type,
        "previous_quantity": previous_quantity,
        "new_quantity": new_quantity,
        "quantity_change": new_quantity - previous_quantity,
        "unit": inventory.get("unit", ""),
        "source": source,
        "note": note,
        "created_at": datetime.now(timezone.utc)
    }

    transactions_collection.insert_one(transaction_data)


# ==========================================
# HELPER: VALIDATE INGREDIENT
# ==========================================

def get_valid_ingredient(ingredient_id: str):

    if not ObjectId.is_valid(ingredient_id):
        raise HTTPException(
            status_code=400,
            detail="Invalid ingredient ID"
        )

    ingredient = ingredients_collection.find_one({
        "_id": ObjectId(ingredient_id)
    })

    if not ingredient:
        raise HTTPException(
            status_code=404,
            detail="Ingredient not found"
        )

    return ingredient


# ==========================================
# HELPER: VALIDATE SUPPLIER
# ==========================================

def validate_supplier(supplier_id):

    if supplier_id is None:
        return

    if not ObjectId.is_valid(supplier_id):
        raise HTTPException(
            status_code=400,
            detail="Invalid supplier ID"
        )

    supplier = suppliers_collection.find_one({
        "_id": ObjectId(supplier_id)
    })

    if not supplier:
        raise HTTPException(
            status_code=404,
            detail="Supplier not found"
        )


# ==========================================
# CREATE INVENTORY
# ==========================================

@router.post("/")
async def create_inventory(inventory: InventoryCreate):

    ingredient = get_valid_ingredient(inventory.ingredient_id)

    if inventory.unit.strip().lower() != ingredient["unit"].strip().lower():
        raise HTTPException(
            status_code=400,
            detail=f"Unit must match ingredient unit: {ingredient['unit']}"
        )

    validate_supplier(inventory.supplier_id)

    existing = inventory_collection.find_one({
        "ingredient_id": inventory.ingredient_id
    })

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Inventory already exists for this ingredient"
        )

    inventory_data = {
        "ingredient_id": str(ingredient["_id"]),
        "ingredient_name": ingredient["name"],
        "quantity": inventory.quantity,
        "unit": inventory.unit,
        "minimum_stock": inventory.minimum_stock,
        "supplier_id": inventory.supplier_id
    }

    result = inventory_collection.insert_one(inventory_data)

    log_inventory_transaction(
        inventory_id=result.inserted_id,
        inventory=inventory_data,
        transaction_type="opening_stock",
        previous_quantity=0,
        new_quantity=inventory.quantity,
        source="manual",
        note="Initial inventory created"
    )

    return {
        "status": "success",
        "message": "Inventory created successfully",
        "inventory_id": str(result.inserted_id)
    }


# ==========================================
# GET ALL INVENTORY
# ==========================================

@router.get("/")
async def get_all_inventory():

    inventory_items = list(inventory_collection.find())

    for item in inventory_items:
        item["_id"] = str(item["_id"])

    return {
        "status": "success",
        "count": len(inventory_items),
        "inventory": inventory_items
    }


# ==========================================
# GET LOW STOCK
# ==========================================

@router.get("/low-stock")
async def get_low_stock_inventory():

    low_stock_items = list(
        inventory_collection.find({
            "$expr": {
                "$lte": ["$quantity", "$minimum_stock"]
            }
        })
    )

    for item in low_stock_items:
        item["_id"] = str(item["_id"])

    return {
        "status": "success",
        "count": len(low_stock_items),
        "low_stock": low_stock_items
    }


# ==========================================
# GET ALL INVENTORY TRANSACTIONS
# ==========================================

@router.get("/transactions")
async def get_all_transactions():

    transactions = list(
        transactions_collection.find().sort("created_at", -1)
    )

    for transaction in transactions:
        transaction["_id"] = str(transaction["_id"])

    return {
        "status": "success",
        "count": len(transactions),
        "transactions": transactions
    }


# ==========================================
# GET TRANSACTIONS BY INVENTORY ID
# ==========================================

@router.get("/{inventory_id}/transactions")
async def get_inventory_transactions(inventory_id: str):

    if not ObjectId.is_valid(inventory_id):
        raise HTTPException(
            status_code=400,
            detail="Invalid inventory ID"
        )

    inventory = inventory_collection.find_one({
        "_id": ObjectId(inventory_id)
    })

    if not inventory:
        raise HTTPException(
            status_code=404,
            detail="Inventory not found"
        )

    transactions = list(
        transactions_collection.find({
            "inventory_id": inventory_id
        }).sort("created_at", -1)
    )

    for transaction in transactions:
        transaction["_id"] = str(transaction["_id"])

    return {
        "status": "success",
        "inventory_id": inventory_id,
        "ingredient_name": inventory.get("ingredient_name"),
        "count": len(transactions),
        "transactions": transactions
    }


# ==========================================
# GET INVENTORY BY ID
# ==========================================

@router.get("/{inventory_id}")
async def get_inventory(inventory_id: str):

    if not ObjectId.is_valid(inventory_id):
        raise HTTPException(
            status_code=400,
            detail="Invalid inventory ID"
        )

    inventory = inventory_collection.find_one({
        "_id": ObjectId(inventory_id)
    })

    if not inventory:
        raise HTTPException(
            status_code=404,
            detail="Inventory not found"
        )

    inventory["_id"] = str(inventory["_id"])

    return {
        "status": "success",
        "inventory": inventory
    }


# ==========================================
# UPDATE INVENTORY
# ==========================================

@router.put("/{inventory_id}")
async def update_inventory(
    inventory_id: str,
    inventory: InventoryUpdate
):

    if not ObjectId.is_valid(inventory_id):
        raise HTTPException(
            status_code=400,
            detail="Invalid inventory ID"
        )

    existing = inventory_collection.find_one({
        "_id": ObjectId(inventory_id)
    })

    if not existing:
        raise HTTPException(
            status_code=404,
            detail="Inventory not found"
        )

    update_data = {
        key: value
        for key, value in inventory.dict().items()
        if value is not None
    }

    if not update_data:
        raise HTTPException(
            status_code=400,
            detail="No data provided for update"
        )

    ingredient = None

    if "ingredient_id" in update_data:

        ingredient = get_valid_ingredient(
            update_data["ingredient_id"]
        )

        update_data["ingredient_id"] = str(ingredient["_id"])
        update_data["ingredient_name"] = ingredient["name"]

        if "unit" not in update_data:
            update_data["unit"] = ingredient["unit"]

        duplicate = inventory_collection.find_one({
            "ingredient_id": str(ingredient["_id"]),
            "_id": {"$ne": ObjectId(inventory_id)}
        })

        if duplicate:
            raise HTTPException(
                status_code=400,
                detail="Inventory already exists for this ingredient"
            )

    if "unit" in update_data or ingredient is not None:

        if ingredient is None:
            existing_ingredient_id = existing.get("ingredient_id")

            if existing_ingredient_id and ObjectId.is_valid(str(existing_ingredient_id)):
                ingredient = get_valid_ingredient(
                    str(existing_ingredient_id)
                )
            else:
                ingredient_id = resolve_ingredient_id(existing, inventory_id)

                if not ingredient_id:
                    raise HTTPException(
                        status_code=400,
                        detail="Could not find ingredient for this inventory record"
                    )

                ingredient = get_valid_ingredient(ingredient_id)

        if update_data.get("unit", existing.get("unit")).strip().lower() != ingredient["unit"].strip().lower():
            raise HTTPException(
                status_code=400,
                detail=f"Unit must match ingredient unit: {ingredient['unit']}"
            )

    if "supplier_id" in update_data:
        validate_supplier(update_data["supplier_id"])

    previous_quantity = existing["quantity"]

    new_quantity = update_data.get(
        "quantity",
        previous_quantity
    )

    inventory_collection.update_one(
        {"_id": ObjectId(inventory_id)},
        {"$set": update_data}
    )

    if new_quantity != previous_quantity:

        updated_inventory = {
            **existing,
            **update_data
        }

        transaction_type = (
            "stock_added"
            if new_quantity > previous_quantity
            else "stock_adjusted"
        )

        log_inventory_transaction(
            inventory_id=inventory_id,
            inventory=updated_inventory,
            transaction_type=transaction_type,
            previous_quantity=previous_quantity,
            new_quantity=new_quantity,
            source="manual",
            note="Inventory quantity updated manually"
        )

    return {
        "status": "success",
        "message": "Inventory updated successfully"
    }


# ==========================================
# DELETE INVENTORY
# ==========================================

@router.delete("/{inventory_id}")
async def delete_inventory(inventory_id: str):

    if not ObjectId.is_valid(inventory_id):
        raise HTTPException(
            status_code=400,
            detail="Invalid inventory ID"
        )

    existing = inventory_collection.find_one({
        "_id": ObjectId(inventory_id)
    })

    if not existing:
        raise HTTPException(
            status_code=404,
            detail="Inventory not found"
        )

    log_inventory_transaction(
        inventory_id=inventory_id,
        inventory=existing,
        transaction_type="inventory_deleted",
        previous_quantity=existing["quantity"],
        new_quantity=0,
        source="manual",
        note="Inventory record deleted"
    )

    result = inventory_collection.delete_one({
        "_id": ObjectId(inventory_id)
    })

    if result.deleted_count == 0:
        raise HTTPException(
            status_code=404,
            detail="Inventory not found"
        )

    return {
        "status": "success",
        "message": "Inventory deleted successfully"
    }
