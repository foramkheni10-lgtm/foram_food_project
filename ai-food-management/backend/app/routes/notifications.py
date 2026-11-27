from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query

from app.database import database
from app.security import get_current_user


router = APIRouter(
    prefix="/api/notifications",
    tags=["Notifications"]
)


# --------------------------------------------------
# Helper: Create a notification from other backend files
# --------------------------------------------------
async def create_notification(
    recipient_id: str,
    recipient_role: str,
    title: str,
    message: str,
    notification_type: str = "general",
    related_id: str = None
):
    notification = {
        "recipient_id": str(recipient_id),
        "recipient_role": str(recipient_role).lower(),
        "title": title,
        "message": message,
        "type": notification_type,
        "related_id": related_id,
        "is_read": False,
        "created_at": datetime.now(timezone.utc)
    }

    result = await database.notifications.insert_one(notification)
    notification["_id"] = str(result.inserted_id)

    return notification


# --------------------------------------------------
# Get logged-in user's notifications
# --------------------------------------------------
@router.get("/")
async def get_notifications(
    limit: int = Query(default=50, ge=1, le=100),
    user: dict = Depends(get_current_user)
):
    user_id = str(user["_id"])

    cursor = database.notifications.find({
        "recipient_id": user_id
    }).sort("created_at", -1).limit(limit)

    records = await cursor.to_list(length=limit)

    notifications = []

    for item in records:
        notifications.append({
            "id": str(item["_id"]),
            "title": item.get("title", "Notification"),
            "message": item.get("message", ""),
            "type": item.get("type", "general"),
            "related_id": item.get("related_id"),
            "is_read": item.get("is_read", False),
            "created_at": item.get("created_at")
        })

    return {
        "success": True,
        "notifications": notifications,
        "total": len(notifications)
    }


# --------------------------------------------------
# Get unread notification count
# --------------------------------------------------
@router.get("/unread-count")
async def get_unread_count(
    user: dict = Depends(get_current_user)
):
    user_id = str(user["_id"])

    count = await database.notifications.count_documents({
        "recipient_id": user_id,
        "is_read": False
    })

    return {
        "success": True,
        "unread_count": count
    }


# --------------------------------------------------
# Mark one notification as read
# --------------------------------------------------
@router.patch("/{notification_id}/read")
async def mark_notification_read(
    notification_id: str,
    user: dict = Depends(get_current_user)
):
    if not ObjectId.is_valid(notification_id):
        raise HTTPException(
            status_code=400,
            detail="Invalid notification ID"
        )

    result = await database.notifications.update_one(
        {
            "_id": ObjectId(notification_id),
            "recipient_id": str(user["_id"])
        },
        {
            "$set": {"is_read": True}
        }
    )

    if result.matched_count == 0:
        raise HTTPException(
            status_code=404,
            detail="Notification not found"
        )

    return {
        "success": True,
        "message": "Notification marked as read"
    }


# --------------------------------------------------
# Mark all notifications as read
# --------------------------------------------------
@router.patch("/read-all")
async def mark_all_notifications_read(
    user: dict = Depends(get_current_user)
):
    result = await database.notifications.update_many(
        {
            "recipient_id": str(user["_id"]),
            "is_read": False
        },
        {
            "$set": {"is_read": True}
        }
    )

    return {
        "success": True,
        "message": "All notifications marked as read",
        "updated_count": result.modified_count
    }


# --------------------------------------------------
# Delete one notification
# --------------------------------------------------
@router.delete("/{notification_id}")
async def delete_notification(
    notification_id: str,
    user: dict = Depends(get_current_user)
):
    if not ObjectId.is_valid(notification_id):
        raise HTTPException(
            status_code=400,
            detail="Invalid notification ID"
        )

    result = await database.notifications.delete_one({
        "_id": ObjectId(notification_id),
        "recipient_id": str(user["_id"])
    })

    if result.deleted_count == 0:
        raise HTTPException(
            status_code=404,
            detail="Notification not found"
        )

    return {
        "success": True,
        "message": "Notification deleted"
    }