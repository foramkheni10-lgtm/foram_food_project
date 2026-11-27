
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  X,
  RefreshCw,
} from "lucide-react";
import "../../styles/restaurant/RestaurantHeader.css";

const API = "https://foram-food-project.onrender.com";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  related_id?: string;
  is_read: boolean;
  created_at?: string;
}

function RestaurantHeader() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const token = localStorage.getItem("token");

  const apiRequest = useCallback(async (endpoint: string, options: RequestInit = {}) => {
    if (!token) return null;

    const response = await fetch(`${API}/api/notifications/restaurant/${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Notification request failed (${response.status})`);
    }

    return response.json();
  }, [token]);

  const fetchNotifications = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);

      const [notificationData, countData] = await Promise.all([
        apiRequest(""),
        apiRequest("unread-count"),
      ]);

      if (notificationData?.success) {
        setNotifications(notificationData.notifications || []);
      }

      if (countData?.success) {
        setUnreadCount(countData.unread_count || 0);
      }
    } catch (error) {
      console.error("Restaurant notification error:", error);
    } finally {
      setLoading(false);
    }
  }, [apiRequest, token]);

  useEffect(() => {
    fetchNotifications();

    const interval = window.setInterval(fetchNotifications, 30000);

    return () => window.clearInterval(interval);
  }, [fetchNotifications]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await apiRequest(`${encodeURIComponent(id)}/read`, {
        method: "PATCH",
      });

      setNotifications((previous) =>
        previous.map((item) =>
          item.id === id ? { ...item, is_read: true } : item
        )
      );

      setUnreadCount((previous) => Math.max(0, previous - 1));
    } catch (error) {
      console.error("Could not mark notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiRequest("read-all", { method: "PATCH" });

      setNotifications((previous) =>
        previous.map((item) => ({ ...item, is_read: true }))
      );

      setUnreadCount(0);
    } catch (error) {
      console.error("Could not mark all notifications as read:", error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await apiRequest(encodeURIComponent(id), {
        method: "DELETE",
      });

      const deleted = notifications.find((item) => item.id === id);

      setNotifications((previous) =>
        previous.filter((item) => item.id !== id)
      );

      if (deleted && !deleted.is_read) {
        setUnreadCount((previous) => Math.max(0, previous - 1));
      }
    } catch (error) {
      console.error("Could not delete notification:", error);
    }
  };

  const formatDate = (date?: string) => {
    if (!date) return "";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) return "";

    return parsed.toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <header className="restaurant-header">
      <div className="restaurant-header-left">
        <div>
          <h1>Restaurant Dashboard</h1>
          <p>Manage your restaurant operations</p>
        </div>
      </div>

      <div className="restaurant-header-right">
        <div className="restaurant-notification-wrapper" ref={dropdownRef}>
          <button
            className="restaurant-notification-button"
            onClick={() => {
              setIsOpen((previous) => !previous);
              if (!isOpen) fetchNotifications();
            }}
            aria-label="Notifications"
          >
            <Bell size={22} />

            {unreadCount > 0 && (
              <span className="restaurant-notification-badge">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {isOpen && (
            <div className="restaurant-notification-dropdown">
              <div className="restaurant-notification-heading">
                <div>
                  <h3>Notifications</h3>
                  <span>{unreadCount} unread</span>
                </div>

                <div className="restaurant-notification-actions">
                  <button
                    onClick={fetchNotifications}
                    title="Refresh"
                    disabled={loading}
                  >
                    <RefreshCw size={16} />
                  </button>

                  <button
                    onClick={() => setIsOpen(false)}
                    title="Close"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {unreadCount > 0 && (
                <button
                  className="restaurant-mark-all"
                  onClick={markAllAsRead}
                >
                  <CheckCheck size={15} />
                  Mark all as read
                </button>
              )}

              <div className="restaurant-notification-list">
                {loading && notifications.length === 0 ? (
                  <div className="restaurant-notification-empty">
                    Loading notifications...
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="restaurant-notification-empty">
                    <Bell size={30} />
                    <p>No notifications yet</p>
                  </div>
                ) : (
                  notifications.map((item) => (
                    <div
                      key={item.id}
                      className={`restaurant-notification-item ${
                        !item.is_read ? "unread" : ""
                      }`}
                    >
                      <div
                        className="restaurant-notification-content"
                        onClick={() => {
                          if (!item.is_read) markAsRead(item.id);
                        }}
                      >
                        <div className="restaurant-notification-title">
                          <strong>{item.title}</strong>
                          {!item.is_read && (
                            <span className="restaurant-unread-dot" />
                          )}
                        </div>

                        <p>{item.message}</p>

                        <span className="restaurant-notification-date">
                          {formatDate(item.created_at)}
                        </span>
                      </div>

                      <div className="restaurant-notification-item-actions">
                        {!item.is_read && (
                          <button
                            title="Mark as read"
                            onClick={() => markAsRead(item.id)}
                          >
                            <Check size={16} />
                          </button>
                        )}

                        <button
                          title="Delete notification"
                          onClick={() => deleteNotification(item.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="restaurant-notification-footer">
                Smart FoodCourt Notifications
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default RestaurantHeader;
