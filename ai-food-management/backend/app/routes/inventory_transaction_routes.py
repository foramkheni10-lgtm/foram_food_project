
from fastapi import APIRouter, HTTPException
from datetime import datetime
from app.db_config import db
from app.models.inventory_transaction_model import (
    InventoryTransactionCreate
)

router = APIRouter(
    prefix="/inventory-transactions",
    tags=["Inventory Transactions"]
)

transaction_collection = db["inventory_transactions"]
inventory_collection = db["inventory"]


# GET ALL INVENTORY TRANSACTIONS
@router.get("/")
async def get_transactions():

    transactions = []

    for transaction in transaction_collection.find().sort(
        "transaction_date", -1
    ):
        transaction["_id"] = str(transaction["_id"])
        transactions.append(transaction)

    return {
        "status": "success",
        "count": len(transactions),
        "transactions": transactions
    }


# GET TRANSACTIONS FOR ONE INGREDIENT
@router.get("/{ingredient_name}")
async def get_ingredient_transactions(ingredient_name: str):

    transactions = []

    for transaction in transaction_collection.find({
        "ingredient_name": {
            "$regex": f"^{ingredient_name}$",
            "$options": "i"
        }
    }).sort("transaction_date", -1):

        transaction["_id"] = str(transaction["_id"])
        transactions.append(transaction)

    return {
        "status": "success",
        "count": len(transactions),
        "ingredient_name": ingredient_name,
        "transactions": transactions
    }


# CREATE INVENTORY TRANSACTION
@router.post("/")
async def create_transaction(
    transaction: InventoryTransactionCreate
):

    inventory_item = inventory_collection.find_one({
        "ingredient_name": {
            "$regex": f"^{transaction.ingredient_name}$",
            "$options": "i"
        }
    })

    if not inventory_item:
        raise HTTPException(
            status_code=404,
            detail="Ingredient not found in inventory"
        )

    inventory_unit = inventory_item.get("unit", "")

    if inventory_unit.lower() != transaction.unit.lower():
        raise HTTPException(
            status_code=400,
            detail="Inventory unit mismatch"
        )

    previous_stock = inventory_item.get("quantity", 0)

    if transaction.transaction_type == "purchase":
        new_stock = previous_stock + transaction.quantity

    elif transaction.transaction_type == "usage":
        if previous_stock < transaction.quantity:
            raise HTTPException(
                status_code=400,
                detail="Insufficient inventory stock"
            )

        new_stock = previous_stock - transaction.quantity

    else:
        new_stock = transaction.quantity

    inventory_collection.update_one(
        {"_id": inventory_item["_id"]},
        {"$set": {"quantity": new_stock}}
    )

    transaction_data = transaction.dict()

    transaction_data.update({
        "previous_stock": previous_stock,
        "new_stock": new_stock,
        "transaction_date": datetime.utcnow()
    })

    result = transaction_collection.insert_one(
        transaction_data
    )

    return {
        "status": "success",
        "message": "Inventory transaction recorded successfully",
        "transaction_id": str(result.inserted_id),
        "previous_stock": previous_stock,
        "new_stock": new_stock
    }
