
from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError

from app.database import database
from app.security import get_current_user, JWT_SECRET_KEY, JWT_ALGORITHM


router = APIRouter(
    prefix="/api/notifications",
    tags=["Notifications"]
)

restaurant_security = HTTPBearer()


# --------------------------------------------------
# Helper: Create notification
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
# Helper: Authenticate restaurant using restaurant JWT
# --------------------------------------------------
async def get_restaurant_notification_user(
    credentials: HTTPAuthorizationCredentials = Depends(restaurant_security)
):
    token = credentials.credentials

    try:
        payload = jwt.decode(
            token,
            JWT_SECRET_KEY,
            algorithms=[JWT_ALGORITHM]
        )

        restaurant_id = payload.get("restaurant_id")

        if not restaurant_id:
            raise HTTPException(
                status_code=401,
                detail="Invalid restaurant authentication token"
            )

    except JWTError:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired restaurant token"
        )

    # Find the restaurant using its database ID
    if ObjectId.is_valid(str(restaurant_id)):
        restaurant = await database.restaurants.find_one({
            "_id": ObjectId(str(restaurant_id))
        })
    else:
        restaurant = await database.restaurants.find_one({
            "_id": restaurant_id
        })

    if not restaurant:
        raise HTTPException(
            status_code=401,
            detail="Restaurant account not found"
        )

    return {
        "restaurant_id": str(restaurant["_id"]),
        "role": "restaurant"
    }


# --------------------------------------------------
# Helper: Format notification response
# --------------------------------------------------
def format_notification(item):
    return {
        "id": str(item["_id"]),
        "title": item.get("title", "Notification"),
        "message": item.get("message", ""),
        "type": item.get("type", "general"),
        "related_id": item.get("related_id"),
        "is_read": item.get("is_read", False),
        "created_at": item.get("created_at")
    }


# ==================================================
# CUSTOMER / ADMIN NOTIFICATIONS
# ==================================================

# --------------------------------------------------
# Get logged-in user's notifications
# --------------------------------------------------
@router.get("/")
async def get_notifications(
    limit: int = Query(default=50, ge=1, le=100),
    user: dict = Depends(get_current_user)
):
    user_id = str(user["_id"])
    user_role = str(user.get("role", "customer")).lower()

    cursor = database.notifications.find({
        "recipient_id": user_id,
        "recipient_role": user_role
    }).sort("created_at", -1).limit(limit)

    records = await cursor.to_list(length=limit)

    notifications = [
        format_notification(item)
        for item in records
    ]

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
    user_role = str(user.get("role", "customer")).lower()

    count = await database.notifications.count_documents({
        "recipient_id": user_id,
        "recipient_role": user_role,
        "is_read": False
    })

    return {
        "success": True,
        "unread_count": count
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
            "recipient_role": str(user.get("role", "customer")).lower(),
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
            "recipient_id": str(user["_id"]),
            "recipient_role": str(user.get("role", "customer")).lower()
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
        "recipient_id": str(user["_id"]),
        "recipient_role": str(user.get("role", "customer")).lower()
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


# ==================================================
# RESTAURANT NOTIFICATIONS
# ==================================================

# --------------------------------------------------
# Get restaurant notifications
# --------------------------------------------------
@router.get("/restaurant/")
async def get_restaurant_notifications(
    limit: int = Query(default=50, ge=1, le=100),
    restaurant: dict = Depends(get_restaurant_notification_user)
):
    restaurant_id = restaurant["restaurant_id"]

    cursor = database.notifications.find({
        "recipient_id": restaurant_id,
        "recipient_role": "restaurant"
    }).sort("created_at", -1).limit(limit)

    records = await cursor.to_list(length=limit)

    notifications = [
        format_notification(item)
        for item in records
    ]

    return {
        "success": True,
        "notifications": notifications,
        "total": len(notifications)
    }


# --------------------------------------------------
# Get restaurant unread notification count
# --------------------------------------------------
@router.get("/restaurant/unread-count")
async def get_restaurant_unread_count(
    restaurant: dict = Depends(get_restaurant_notification_user)
):
    count = await database.notifications.count_documents({
        "recipient_id": restaurant["restaurant_id"],
        "recipient_role": "restaurant",
        "is_read": False
    })

    return {
        "success": True,
        "unread_count": count
    }


# --------------------------------------------------
# Mark all restaurant notifications as read
# --------------------------------------------------
@router.patch("/restaurant/read-all")
async def mark_all_restaurant_notifications_read(
    restaurant: dict = Depends(get_restaurant_notification_user)
):
    result = await database.notifications.update_many(
        {
            "recipient_id": restaurant["restaurant_id"],
            "recipient_role": "restaurant",
            "is_read": False
        },
        {
            "$set": {"is_read": True}
        }
    )

    return {
        "success": True,
        "message": "All restaurant notifications marked as read",
        "updated_count": result.modified_count
    }


# --------------------------------------------------
# Mark one restaurant notification as read
# --------------------------------------------------
@router.patch("/restaurant/{notification_id}/read")
async def mark_restaurant_notification_read(
    notification_id: str,
    restaurant: dict = Depends(get_restaurant_notification_user)
):
    if not ObjectId.is_valid(notification_id):
        raise HTTPException(
            status_code=400,
            detail="Invalid notification ID"
        )

    result = await database.notifications.update_one(
        {
            "_id": ObjectId(notification_id),
            "recipient_id": restaurant["restaurant_id"],
            "recipient_role": "restaurant"
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
        "message": "Restaurant notification marked as read"
    }


# --------------------------------------------------
# Delete one restaurant notification
# --------------------------------------------------
@router.delete("/restaurant/{notification_id}")
async def delete_restaurant_notification(
    notification_id: str,
    restaurant: dict = Depends(get_restaurant_notification_user)
):
    if not ObjectId.is_valid(notification_id):
        raise HTTPException(
            status_code=400,
            detail="Invalid notification ID"
        )

    result = await database.notifications.delete_one({
        "_id": ObjectId(notification_id),
        "recipient_id": restaurant["restaurant_id"],
        "recipient_role": "restaurant"
    })

    if result.deleted_count == 0:
        raise HTTPException(
            status_code=404,
            detail="Notification not found"
        )

    return {
        "success": True,
        "message": "Restaurant notification deleted"
    }
