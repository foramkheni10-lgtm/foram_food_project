
from fastapi import APIRouter, HTTPException
from app.db_config import db
from bson import ObjectId
from datetime import datetime
from pydantic import BaseModel, Field
from typing import Optional
from app.routes.notifications import create_notification

router = APIRouter(
    prefix="/api/deliveries",
    tags=["Delivery"]
)

orders_collection = db["orders"]
deliveries_collection = db["deliveries"]


# GPS LOCATION MODEL
class LocationUpdate(BaseModel):
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)
    accuracy: Optional[float] = Field(default=None, ge=0)


# =========================================================
# ASSIGN DELIVERY
# =========================================================

@router.post("/assign/{order_id}")
async def assign_delivery(order_id: str, delivery: dict):
    try:
        order = orders_collection.find_one(
            {"_id": ObjectId(order_id)}
        )

        if not order:
            raise HTTPException(404, "Order not found")

        if order.get("orderType", order.get("delivery_type")) != "delivery":
            raise HTTPException(
                400, "This is not a delivery order"
            )

        delivery_data = {
            "orderId": order_id,
            "deliveryPerson": delivery.get("deliveryPerson"),
            "phone": delivery.get("phone"),
            "status": "assigned",
            "locationSharing": False,
            "assignedAt": datetime.now()
        }

        result = deliveries_collection.insert_one(
            delivery_data
        )
                # Notify customer about delivery assignment
        if order.get("customer_id"):
            try:
                await create_notification(
                    recipient_id=str(order["customer_id"]),
                    recipient_role="customer",
                    title="Delivery Person Assigned!",
                    message=(
                        f"A delivery person has been assigned to your order "
                        f"{order.get('order_number', order_id)}."
                    ),
                    notification_type="delivery",
                    related_id=order_id
                )
            except Exception as e:
                print("Delivery assignment notification error:", str(e))

        return {
            "message": "Delivery person assigned successfully",
            "deliveryId": str(result.inserted_id)
        }

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            500, detail=f"Failed to assign delivery: {str(e)}"
        )


# =========================================================
# UPDATE DELIVERY STATUS
# =========================================================

@router.patch("/{delivery_id}/status")
async def update_delivery_status(delivery_id: str, status: str):

    valid_statuses = [
        "assigned",
        "picked_up",
        "out_for_delivery",
        "delivered"
    ]

    if status not in valid_statuses:
        raise HTTPException(
            400,
            detail={
                "message": "Invalid delivery status",
                "validStatuses": valid_statuses
            }
        )

    try:
        delivery_object_id = ObjectId(delivery_id)
    except Exception:
        raise HTTPException(400, "Invalid delivery ID")

    try:
        delivery = deliveries_collection.find_one(
            {"_id": delivery_object_id}
        )

        if not delivery:
            raise HTTPException(404, "Delivery not found")

        update_data = {
            "status": status,
            "updatedAt": datetime.now()
        }

        if status == "delivered":
            update_data["locationSharing"] = False

                # Notify customer about delivery status
        order = orders_collection.find_one({
            "_id": ObjectId(delivery.get("orderId"))
        })

        notification_messages = {
            "assigned": (
                "Delivery Assigned",
                "A delivery person has been assigned to your order."
            ),
            "picked_up": (
                "Order Picked Up!",
                "Your order has been picked up by the delivery person."
            ),
            "out_for_delivery": (
                "Out for Delivery!",
                "Your order is on its way."
            ),
            "delivered": (
                "Order Delivered Successfully!",
                "Your order has been delivered. Enjoy your meal!"
            )
        }

        notification = notification_messages.get(status)

        if notification and order and order.get("customer_id"):
            try:
                await create_notification(
                    recipient_id=str(order["customer_id"]),
                    recipient_role="customer",
                    title=notification[0],
                    message=notification[1],
                    notification_type="delivery",
                    related_id=str(delivery.get("orderId"))
                )
            except Exception as e:
                print("Delivery status notification error:", str(e))
        return {
            "message": "Delivery status updated successfully",
            "deliveryId": delivery_id,
            "status": status
        }

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            500, detail=f"Failed to update delivery status: {str(e)}"
        )


# =========================================================
# UPDATE DELIVERY PERSON GPS LOCATION
# =========================================================

@router.put("/{delivery_id}/location")
def update_delivery_location(
    delivery_id: str,
    location: LocationUpdate
):

    try:
        delivery_object_id = ObjectId(delivery_id)
    except Exception:
        raise HTTPException(400, "Invalid delivery ID")

    delivery = deliveries_collection.find_one(
        {"_id": delivery_object_id}
    )

    if not delivery:
        raise HTTPException(404, "Delivery not found")

    if delivery.get("status") == "delivered":
        raise HTTPException(
            400, "Delivery is already completed"
        )

    update_data = {
        "latitude": location.latitude,
        "longitude": location.longitude,
        "locationUpdatedAt": datetime.now(),
        "locationSharing": True
    }

    if location.accuracy is not None:
        update_data["locationAccuracy"] = location.accuracy

    deliveries_collection.update_one(
        {"_id": delivery_object_id},
        {"$set": update_data}
    )

    return {
        "message": "Location updated successfully",
        "latitude": location.latitude,
        "longitude": location.longitude
    }


# =========================================================
# GET LATEST DELIVERY LOCATION
# =========================================================

@router.get("/{delivery_id}/location")
def get_delivery_location(delivery_id: str):

    try:
        delivery_object_id = ObjectId(delivery_id)
    except Exception:
        raise HTTPException(400, "Invalid delivery ID")

    delivery = deliveries_collection.find_one(
        {"_id": delivery_object_id}
    )

    if not delivery:
        raise HTTPException(404, "Delivery not found")

    if "latitude" not in delivery or "longitude" not in delivery:
        raise HTTPException(
            404, "Delivery location is not available yet"
        )

    return {
        "deliveryId": delivery_id,
        "orderId": delivery.get("orderId"),
        "latitude": delivery.get("latitude"),
        "longitude": delivery.get("longitude"),
        "locationUpdatedAt": delivery.get("locationUpdatedAt"),
        "locationSharing": delivery.get("locationSharing", False),
        "status": delivery.get("status")
    }


# =========================================================
# GET DELIVERY USING ORDER ID
# =========================================================

@router.get("/by-order/{order_id}")
def get_delivery_by_order(order_id: str):

    delivery = deliveries_collection.find_one(
        {"orderId": order_id}
    )

    if not delivery:
        raise HTTPException(
            404, "Delivery not found for this order"
        )

    delivery["_id"] = str(delivery["_id"])
    return delivery


# =========================================================
# GET SINGLE DELIVERY
# =========================================================

@router.get("/{delivery_id}")
def get_delivery(delivery_id: str):

    try:
        delivery_object_id = ObjectId(delivery_id)
    except Exception:
        raise HTTPException(400, "Invalid delivery ID")

    delivery = deliveries_collection.find_one(
        {"_id": delivery_object_id}
    )

    if not delivery:
        raise HTTPException(404, "Delivery not found")

    delivery["_id"] = str(delivery["_id"])
    return delivery
