
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import RestaurantSidebar from "./RestaurantSidebar";
import "../../styles/restaurant/Kitchen.css";

const API = "http://127.0.0.1:8000";

interface OrderItem {
  food_id: string;
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

interface Order {
  _id: string;
  order_number: string;
  customer_name: string;
  delivery_type: string;
  table_number?: string;
  items: OrderItem[];
  restaurant_total: number;
  order_status: string;
  created_at: string;
}

function Kitchen() {
  const navigate = useNavigate();

  const restaurantId = localStorage.getItem("restaurantId");
  const restaurantName =
    localStorage.getItem("restaurantName") || "Restaurant";

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    if (!restaurantId) {
      setError("Restaurant ID not found.");
      setLoading(false);
      return;
    }

    try {
      setError("");

      const response = await axios.get(
        `${API}/api/restaurants/${restaurantId}/orders`
      );

      setOrders(response.data.orders || []);
    } catch (err: any) {
      setError(
        err.response?.data?.detail || "Unable to load kitchen orders."
      );
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    if (!restaurantId) {
      navigate("/login");
      return;
    }

    fetchOrders();

    const interval = setInterval(fetchOrders, 15000);

    return () => clearInterval(interval);
  }, [restaurantId, navigate, fetchOrders]);

  const updateStatus = async (orderId: string, status: string) => {
    if (!restaurantId) return;

    try {
      setUpdatingOrder(orderId);

      await axios.put(
        `${API}/api/restaurants/${restaurantId}/orders/${orderId}/status`,
        { status }
      );

      await fetchOrders();
    } catch (err: any) {
      alert(
        err.response?.data?.detail || "Unable to update order."
      );
    } finally {
      setUpdatingOrder(null);
    }
  };

  const columns = [
    {
      title: "New Orders",
      status: "Placed",
      nextStatus: "Accepted",
      action: "Accept Order",
      icon: "🆕",
      className: "new"
    },
    {
      title: "Accepted",
      status: "Accepted",
      nextStatus: "Preparing",
      action: "Start Preparing",
      icon: "👨‍🍳",
      className: "accepted"
    },
    {
      title: "Preparing",
      status: "Preparing",
      nextStatus: "Ready",
      action: "Mark as Ready",
      icon: "🔥",
      className: "preparing"
    },
    {
      title: "Ready",
      status: "Ready",
      nextStatus: "Completed",
      action: "Complete Order",
      icon: "✅",
      className: "ready"
    }
  ];

  const getElapsedTime = (date: string) => {
    if (!date) return "Time unavailable";

    const minutes = Math.max(
      0,
      Math.floor((Date.now() - new Date(date).getTime()) / 60000)
    );

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes} min ago`;

    return `${Math.floor(minutes / 60)} hr ${minutes % 60} min ago`;
  };

  const getOrderCount = (status: string) =>
    orders.filter((order) => order.order_status === status).length;

  return (
    <>
      <RestaurantSidebar />

      <div className="restaurant-content-area">
        <main className="kitchen-page">

          <header className="kitchen-header">
            <div>
              <span className="kitchen-label">RESTAURANT WORKSPACE</span>
              <h1>👨‍🍳 Kitchen Management</h1>
              <p>Manage food preparation for {restaurantName}</p>
            </div>

            <div className="kitchen-header-actions">
              <button onClick={fetchOrders} disabled={loading}>
                ↻ Refresh
              </button>

              <button onClick={() => navigate("/orders")}>
                View All Orders →
              </button>
            </div>
          </header>

          <section className="kitchen-summary">
            <div className="kitchen-summary-card">
              <span>🆕</span>
              <div>
                <p>New Orders</p>
                <h2>{getOrderCount("Placed")}</h2>
              </div>
            </div>

            <div className="kitchen-summary-card">
              <span>👨‍🍳</span>
              <div>
                <p>Accepted</p>
                <h2>{getOrderCount("Accepted")}</h2>
              </div>
            </div>

            <div className="kitchen-summary-card">
              <span>🔥</span>
              <div>
                <p>Preparing</p>
                <h2>{getOrderCount("Preparing")}</h2>
              </div>
            </div>

            <div className="kitchen-summary-card">
              <span>✅</span>
              <div>
                <p>Ready</p>
                <h2>{getOrderCount("Ready")}</h2>
              </div>
            </div>
          </section>

          {error && (
            <div className="kitchen-error">
              {error}
              <button onClick={fetchOrders}>Try Again</button>
            </div>
          )}

          {loading ? (
            <div className="kitchen-empty">Loading kitchen orders...</div>
          ) : (
            <section className="kitchen-board">

              {columns.map((column) => {
                const columnOrders = orders.filter(
                  (order) => order.order_status === column.status
                );

                return (
                  <div className="kitchen-column" key={column.status}>
                    <div className={`kitchen-column-header ${column.className}`}>
                      <div>
                        <h2>{column.icon} {column.title}</h2>
                        <p>{columnOrders.length} order(s)</p>
                      </div>
                      <span>{columnOrders.length}</span>
                    </div>

                    <div className="kitchen-column-body">
                      {columnOrders.length === 0 ? (
                        <div className="kitchen-no-orders">
                          <span>🍽️</span>
                          <p>No orders here</p>
                        </div>
                      ) : (
                        columnOrders.map((order) => (
                          <article className="kitchen-order-card" key={order._id}>
                            <div className="kitchen-order-top">
                              <div>
                                <h3>
                                  {order.order_number ||
                                    `#${order._id.slice(-6)}`}
                                </h3>
                                <p>{getElapsedTime(order.created_at)}</p>
                              </div>

                              <span className="kitchen-order-status">
                                {order.order_status}
                              </span>
                            </div>

                            <div className="kitchen-customer">
                              <strong>👤 {order.customer_name || "Customer"}</strong>
                              <span>
                                {order.delivery_type === "dine_in"
                                  ? `🪑 Table ${order.table_number || "-"}`
                                  : `📦 ${order.delivery_type || "Order"}`}
                              </span>
                            </div>

                            <div className="kitchen-items">
                              <h4>Food Items</h4>

                              {order.items.map((item, index) => (
                                <div
                                  className="kitchen-item"
                                  key={`${item.food_id}-${index}`}
                                >
                                  <span>{item.name}</span>
                                  <strong>× {item.quantity}</strong>
                                </div>
                              ))}
                            </div>

                            <div className="kitchen-order-total">
                              <span>Order Total</span>
                              <strong>
                                ₹{Number(order.restaurant_total || 0).toFixed(2)}
                              </strong>
                            </div>

                            <button
                              className={`kitchen-action-btn ${column.className}`}
                              disabled={updatingOrder === order._id}
                              onClick={() =>
                                updateStatus(order._id, column.nextStatus)
                              }
                            >
                              {updatingOrder === order._id
                                ? "Updating..."
                                : column.action}
                              {!updatingOrder || updatingOrder !== order._id
                                ? " →"
                                : ""}
                            </button>

                            {column.status === "Placed" && (
                              <button
                                className="kitchen-reject-btn"
                                disabled={updatingOrder === order._id}
                                onClick={() =>
                                  updateStatus(order._id, "Rejected")
                                }
                              >
                                Reject Order
                              </button>
                            )}
                          </article>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}

            </section>
          )}

          <footer className="kitchen-footer">
            <span>●</span> Automatic order refresh every 15 seconds
          </footer>

        </main>
      </div>
    </>
  );
}

export default Kitchen;