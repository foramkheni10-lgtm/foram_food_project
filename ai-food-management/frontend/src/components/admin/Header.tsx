
import {
  Menu,
  Bell,
  User,
  Check,
} from "lucide-react";

import { useEffect, useState } from "react";
import api from "../../services/api";
import "./Header.css";

interface HeaderProps {
  onMenuClick: () => void;
}

interface Notification {
  _id: string;
  type?: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

interface NotificationResponse {
  notifications: Notification[];
  unreadCount: number;
}

function Header({ onMenuClick }: HeaderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const [showNotifications, setShowNotifications] = useState(false);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [notificationsAvailable, setNotificationsAvailable] = useState(true);
  const [notificationError, setNotificationError] = useState("");

  // Fetch notifications only when the dropdown is opened.
  useEffect(() => {
    if (!showNotifications || !notificationsAvailable) {
      return;
    }

    let cancelled = false;

    const fetchNotifications = async () => {
      setLoadingNotifications(true);
      setNotificationError("");

      try {
        const response = await api.get<NotificationResponse>(
          "/api/admin/notifications"
        );

        if (cancelled) return;

        setNotifications(response.data.notifications || []);
        setUnreadCount(response.data.unreadCount || 0);
        setNotificationsAvailable(true);
      } catch (error) {
        if (cancelled) return;

        const status = (
          error as { response?: { status?: number } }
        ).response?.status;

        if (status === 404) {
          setNotificationsAvailable(false);
          setNotificationError(
            "Notifications have not been configured yet."
          );
        } else {
          setNotificationError(
            "Unable to load notifications. Please try again."
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingNotifications(false);
        }
      }
    };

    fetchNotifications();

    return () => {
      cancelled = true;
    };
  }, [showNotifications, notificationsAvailable]);

  const markAsRead = async (notificationId: string) => {
    try {
      await api.patch(
        `/api/admin/notifications/${notificationId}/read`
      );

      setNotifications((previous) =>
        previous.map((notification) =>
          notification._id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );

      setUnreadCount((previous) => Math.max(0, previous - 1));
    } catch {
      setNotificationError(
        "Unable to update this notification."
      );
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch("/api/admin/notifications/read-all");

      setNotifications((previous) =>
        previous.map((notification) => ({
          ...notification,
          read: true,
        }))
      );

      setUnreadCount(0);
    } catch {
      setNotificationError(
        "Unable to update notifications."
      );
    }
  };

  const formatTime = (date: string) => {
    if (!date) return "";

    const notificationDate = new Date(date);

    if (isNaN(notificationDate.getTime())) {
      return "";
    }

    return notificationDate.toLocaleString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <header className="top-header">
      {/* Mobile Menu */}
      <button
        className="menu-button"
        onClick={onMenuClick}
        aria-label="Open menu"
      >
        <Menu size={24} />
      </button>

      {/* Brand */}
      <div className="header-brand">
        <div className="header-brand-icon">
          <img src="/images/logo.png" alt="Smart FoodCourt Logo" />
        </div>

        <div>
          <h2>Smart FoodCourt</h2>
          <p>Smart Restaurant Management</p>
          
        </div>
      </div>

      {/* Right Side */}
      <div className="header-actions">
        {/* Notifications */}
        <div className="notification-wrapper">
          <button
            className="notification-button"
            aria-label="Notifications"
            onClick={() =>
              setShowNotifications((previous) => !previous)
            }
          >
            <Bell size={20} />

            {unreadCount > 0 && (
              <span className="notification-count">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="notification-dropdown">
              <div className="notification-header">
                <div>
                  <h3>Notifications</h3>
                  <span>{unreadCount} unread</span>
                </div>

                {notificationsAvailable && unreadCount > 0 && (
                  <button
                    className="mark-all-button"
                    onClick={markAllAsRead}
                  >
                    <Check size={15} />
                    Mark all read
                  </button>
                )}
              </div>

              <div className="notification-list">
                {loadingNotifications ? (
                  <div className="no-notifications">
                    <p>Loading notifications...</p>
                  </div>
                ) : notificationError ? (
                  <div className="no-notifications">
                    <Bell size={30} />
                    <p>{notificationError}</p>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="no-notifications">
                    <Bell size={30} />
                    <p>No notifications</p>
                    <span>You're all caught up.</span>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification._id}
                      className={`notification-item ${
                        notification.read
                          ? "notification-read"
                          : "notification-unread"
                      }`}
                      onClick={() =>
                        !notification.read &&
                        markAsRead(notification._id)
                      }
                    >
                      <div className="notification-item-icon">
                        <Bell size={17} />
                      </div>

                      <div className="notification-content">
                        <strong>{notification.title}</strong>
                        <p>{notification.message}</p>
                        <span>
                          {formatTime(notification.createdAt)}
                        </span>
                      </div>

                      {!notification.read && (
                        <div className="notification-unread-dot" />
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Admin Profile */}
        <div className="admin-profile">
          <div className="admin-avatar">
            <User size={19} />
          </div>

          <div className="admin-info">
            <strong>Admin</strong>
            <span>Administrator</span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
