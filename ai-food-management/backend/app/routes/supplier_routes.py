from fastapi import APIRouter, HTTPException
from bson import ObjectId

from app.db_config import db
from app.models.supplier_model import (
    SupplierCreate,
    SupplierUpdate
)

router = APIRouter(
    prefix="/suppliers",
    tags=["Suppliers"]
)

suppliers_collection = db["suppliers"]
inventory_collection = db["inventory"]
purchase_orders_collection = db["purchase_orders"]
purchase_orders_hyphen_collection = db["purchase-orders"]


# =========================
# CREATE SUPPLIER
# =========================
@router.post("/")
def create_supplier(supplier: SupplierCreate):

    supplier_data = supplier.dict()

    result = suppliers_collection.insert_one(supplier_data)

    return {
        "status": "success",
        "message": "Supplier created successfully",
        "supplier_id": str(result.inserted_id)
    }


# =========================
# GET ALL SUPPLIERS
# =========================
@router.get("/")
def get_suppliers():

    suppliers = list(suppliers_collection.find())

    for supplier in suppliers:
        supplier["_id"] = str(supplier["_id"])

    return {
        "status": "success",
        "count": len(suppliers),
        "suppliers": suppliers
    }


# =========================
# GET SUPPLIER BY ID
# =========================
@router.get("/{supplier_id}")
def get_supplier(supplier_id: str):

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

    supplier["_id"] = str(supplier["_id"])

    return {
        "status": "success",
        "supplier": supplier
    }


# =========================
# UPDATE SUPPLIER
# =========================
@router.put("/{supplier_id}")
def update_supplier(
    supplier_id: str,
    supplier: SupplierUpdate
):

    if not ObjectId.is_valid(supplier_id):
        raise HTTPException(
            status_code=400,
            detail="Invalid supplier ID"
        )

    update_data = {
        key: value
        for key, value in supplier.dict().items()
        if value is not None
    }

    if not update_data:
        raise HTTPException(
            status_code=400,
            detail="No data provided for update"
        )

    result = suppliers_collection.update_one(
        {"_id": ObjectId(supplier_id)},
        {"$set": update_data}
    )

    if result.matched_count == 0:
        raise HTTPException(
            status_code=404,
            detail="Supplier not found"
        )

    return {
        "status": "success",
        "message": "Supplier updated successfully"
    }


# =========================
# DELETE SUPPLIER
# =========================
@router.delete("/{supplier_id}")
def delete_supplier(supplier_id: str):

    if not ObjectId.is_valid(supplier_id):
        raise HTTPException(
            status_code=400,
            detail="Invalid supplier ID"
        )

    supplier_object_id = ObjectId(supplier_id)

    supplier = suppliers_collection.find_one(
        {"_id": supplier_object_id}
    )

    if not supplier:
        raise HTTPException(
            status_code=404,
            detail="Supplier not found"
        )

    # Check inventory references
    inventory_item = inventory_collection.find_one({
        "$or": [
            {"supplier_id": supplier_id},
            {"supplier_id": supplier_object_id}
        ]
    })

    if inventory_item:
        raise HTTPException(
            status_code=400,
            detail="Cannot delete supplier because it is being used in inventory"
        )

    # Check purchase_orders collection
    purchase_order = purchase_orders_collection.find_one({
        "$or": [
            {"supplier_id": supplier_id},
            {"supplier_id": supplier_object_id}
        ]
    })

    # Check purchase-orders collection
    if not purchase_order:
        purchase_order = purchase_orders_hyphen_collection.find_one({
            "$or": [
                {"supplier_id": supplier_id},
                {"supplier_id": supplier_object_id}
            ]
        })

    if purchase_order:
        raise HTTPException(
            status_code=400,
            detail="Cannot delete supplier because it is being used in purchase orders"
        )

    result = suppliers_collection.delete_one(
        {"_id": supplier_object_id}
    )

    if result.deleted_count == 0:
        raise HTTPException(
            status_code=404,
            detail="Supplier not found"
        )

    return {
        "status": "success",
        "message": "Supplier deleted successfully"
    }
