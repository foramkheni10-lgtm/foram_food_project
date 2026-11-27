
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bell,
  CheckCheck,
  Trash2,
  X,
  ShoppingBag,
  Info,
} from "lucide-react";
import api from "../../services/api";
import "./NotificationBell.css";

interface Notification {
  id: string;
  title: string;
  message: string;
  type?: string;
  related_id?: string | null;
  is_read: boolean;
  created_at?: string;
}

function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Supports both MongoDB _id and frontend id formats.
  const normalizeNotifications = (data: any): Notification[] => {
    const records = Array.isArray(data)
      ? data
      : data?.notifications || data?.items || [];

    return records.map((item: any) => ({
      id: String(item.id || item._id || ""),
      title: item.title || "Notification",
      message: item.message || "",
      type: item.type || "general",
      related_id: item.related_id
        ? String(item.related_id)
        : null,
      is_read: Boolean(item.is_read),
      created_at: item.created_at,
    })).filter((item: Notification) => item.id);
  };

  const fetchNotifications = useCallback(async () => {
    const token = localStorage.getItem("smartfoodcourt_token");

    if (!token) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    try {
      const [notificationResponse, countResponse] = await Promise.all([
        api.get("/api/notifications/"),
        api.get("/api/notifications/unread-count"),
      ]);

      const formatted = normalizeNotifications(notificationResponse.data);

      setNotifications(formatted);

      const serverCount =
        countResponse.data?.unread_count ??
        countResponse.data?.count;

      setUnreadCount(
        serverCount !== undefined
          ? Number(serverCount)
          : formatted.filter((item) => !item.is_read).length
      );
    } catch (error) {
      console.error("Unable to load notifications:", error);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();

    const interval = window.setInterval(fetchNotifications, 30000);

    return () => window.clearInterval(interval);
  }, [fetchNotifications]);

  const markAsRead = async (notificationId: string) => {
    try {
      await api.patch(`/api/notifications/${notificationId}/read`);

      setNotifications((previous) =>
        previous.map((item) =>
          item.id === notificationId
            ? { ...item, is_read: true }
            : item
        )
      );

      setUnreadCount((previous) => Math.max(0, previous - 1));
    } catch (error) {
      console.error("Unable to mark notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    if (unreadCount === 0) return;

    setLoading(true);

    try {
      await api.patch("/api/notifications/read-all");

      setNotifications((previous) =>
        previous.map((item) => ({ ...item, is_read: true }))
      );

      setUnreadCount(0);
    } catch (error) {
      console.error("Unable to mark all notifications as read:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    const selected = notifications.find(
      (item) => item.id === notificationId
    );

    try {
      await api.delete(`/api/notifications/${notificationId}`);

      setNotifications((previous) =>
        previous.filter((item) => item.id !== notificationId)
      );

      if (selected && !selected.is_read) {
        setUnreadCount((previous) => Math.max(0, previous - 1));
      }
    } catch (error) {
      console.error("Unable to delete notification:", error);
    }
  };

  const formatDate = (date?: string) => {
    if (!date) return "";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return "";

    return parsedDate.toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="sf-notification-wrapper">
      <button
        type="button"
        className={`sf-notification-bell ${isOpen ? "active" : ""}`}
        aria-label="Notifications"
        aria-expanded={isOpen}
        onClick={() => {
          const nextOpen = !isOpen;
          setIsOpen(nextOpen);

          if (nextOpen) {
            fetchNotifications();
          }
        }}
      >
        <Bell size={21} />

        {unreadCount > 0 && (
          <span className="sf-notification-count">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <button
            type="button"
            className="sf-notification-backdrop"
            aria-label="Close notifications"
            onClick={() => setIsOpen(false)}
          />

          <div className="sf-notification-panel">
            <div className="sf-notification-heading">
              <div>
                <h3>Notifications</h3>
                <p>
                  {unreadCount > 0
                    ? `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`
                    : "You're all caught up"}
                </p>
              </div>

              <button
                type="button"
                className="sf-notification-close"
                aria-label="Close"
                onClick={() => setIsOpen(false)}
              >
                <X size={19} />
              </button>
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                className="sf-mark-all-read"
                disabled={loading}
                onClick={markAllAsRead}
              >
                <CheckCheck size={16} />
                {loading ? "Please wait..." : "Mark all as read"}
              </button>
            )}

            <div className="sf-notification-list">
              {notifications.length === 0 ? (
                <div className="sf-notification-empty">
                  <Bell size={32} />
                  <strong>No notifications yet</strong>
                  <span>
                    Updates about your orders will appear here.
                  </span>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`sf-notification-item ${
                      notification.is_read ? "read" : "unread"
                    }`}
                  >
                    <div className="sf-notification-icon">
                      {notification.type === "order" ||
                      notification.type === "delivery" ? (
                        <ShoppingBag size={19} />
                      ) : (
                        <Info size={19} />
                      )}
                    </div>

                    <div className="sf-notification-content">
                      <strong>{notification.title}</strong>
                      <p>{notification.message}</p>

                      <div className="sf-notification-meta">
                        <span>
                          {formatDate(notification.created_at)}
                        </span>

                        {!notification.is_read && (
                          <span className="sf-unread-label">New</span>
                        )}
                      </div>

                      {notification.related_id && (
                        <Link
                          to="/my-orders"
                          className="sf-notification-order-link"
                          onClick={() => {
                            if (!notification.is_read) {
                              markAsRead(notification.id);
                            }
                            setIsOpen(false);
                          }}
                        >
                          View My Orders
                        </Link>
                      )}
                    </div>

                    <div className="sf-notification-actions">
                      {!notification.is_read && (
                        <button
                          type="button"
                          title="Mark as read"
                          aria-label="Mark as read"
                          onClick={() => markAsRead(notification.id)}
                        >
                          <CheckCheck size={16} />
                        </button>
                      )}

                      <button
                        type="button"
                        title="Delete notification"
                        aria-label="Delete notification"
                        onClick={() =>
                          deleteNotification(notification.id)
                        }
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="sf-notification-footer">
              <Link
                to="/my-orders"
                onClick={() => setIsOpen(false)}
              >
                View My Orders
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default NotificationBell;
