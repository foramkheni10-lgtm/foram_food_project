
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import RestaurantSidebar from "../../pages/restaurant/RestaurantSidebar";
import "../../styles/restaurant/RestaurantOrders.css";

const API = "http://127.0.0.1:8000";

interface OrderItem {
  food_id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  subtotal: number;
}

interface Order {
  _id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  phone: string;
  alternate_phone?: string;
  delivery_type: string;
  delivery_address?: any;
  table_number?: string;
  items: OrderItem[];
  total_items: number;
  restaurant_total: number;
  payment_method: string;
  payment_status: string;
  order_status: string;
  created_at: string;
}

const statuses = [
  "All",
  "Placed",
  "Accepted",
  "Preparing",
  "Ready",
  "Completed",
  "Rejected"
];

function RestaurantOrders() {
  const navigate = useNavigate();

  const restaurantId = localStorage.getItem("restaurantId");
  const restaurantName =
    localStorage.getItem("restaurantName") || "Restaurant";

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [activeStatus, setActiveStatus] = useState("All");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    if (!restaurantId) {
      setError("Restaurant ID not found. Please log in again.");
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
        err.response?.data?.detail ||
          "Unable to load orders. Please try again."
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

  const updateStatus = async (orderId: string, newStatus: string) => {
    if (!restaurantId) return;

    try {
      setUpdatingOrder(orderId);

      await axios.put(
        `${API}/api/restaurants/${restaurantId}/orders/${orderId}/status`,
        { status: newStatus }
      );

      await fetchOrders();

      alert(`Order ${newStatus.toLowerCase()} successfully!`);
    } catch (err: any) {
      alert(
        err.response?.data?.detail ||
          "Unable to update order status."
      );
    } finally {
      setUpdatingOrder(null);
    }
  };

  const getNextActions = (status: string) => {
    switch (status) {
      case "Placed":
        return [
          { label: "Accept Order", status: "Accepted", style: "accept" },
          { label: "Reject", status: "Rejected", style: "reject" }
        ];

      case "Accepted":
        return [
          {
            label: "Start Preparing",
            status: "Preparing",
            style: "primary"
          }
        ];

      case "Preparing":
        return [
          {
            label: "Mark as Ready",
            status: "Ready",
            style: "primary"
          }
        ];

      case "Ready":
        return [
          {
            label: "Complete Order",
            status: "Completed",
            style: "complete"
          }
        ];

      default:
        return [];
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesStatus =
      activeStatus === "All" ||
      order.order_status === activeStatus;

    const searchText = search.toLowerCase();

    const matchesSearch =
      (order.order_number || "").toLowerCase().includes(searchText) ||
      (order.customer_name || "").toLowerCase().includes(searchText) ||
      (order.phone || "").toLowerCase().includes(searchText);

    return matchesStatus && matchesSearch;
  });

  const getCount = (status: string) => {
    if (status === "All") return orders.length;

    return orders.filter(
      (order) => order.order_status === status
    ).length;
  };

  const formatDate = (date: string) => {
    if (!date) return "Date unavailable";

    return new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short"
    });
  };

  const formatAddress = (address: any) => {
    if (!address) return "";

    if (typeof address === "string") return address;

    return Object.values(address)
      .filter(
        (value) =>
          typeof value === "string" && value.trim()
      )
      .join(", ");
  };

  const getStatusClass = (status: string) => {
    return status.toLowerCase().replace(/\s+/g, "-");
  };

  return (
    <>
      <RestaurantSidebar />

      <div className="restaurant-content-area">
        <div className="orders-page">

          {/* HEADER */}
          <header className="orders-header">
            <div>
              <h1>Order Management</h1>
              <p>Manage orders for {restaurantName}</p>
            </div>

            <div className="orders-header-actions">
              <button
                className="orders-refresh-btn"
                onClick={fetchOrders}
                disabled={loading}
              >
                ↻ Refresh
              </button>

              <button
                className="orders-back-btn"
                onClick={() => navigate("/dashboard")}
              >
                ← Dashboard
              </button>
            </div>
          </header>

          {/* SUMMARY CARDS */}
          <div className="orders-summary">
            <div className="orders-summary-card">
              <span className="summary-icon">📦</span>
              <div>
                <p>Total Orders</p>
                <h2>{orders.length}</h2>
              </div>
            </div>

            <div className="orders-summary-card">
              <span className="summary-icon">🆕</span>
              <div>
                <p>New Orders</p>
                <h2>{getCount("Placed")}</h2>
              </div>
            </div>

            <div className="orders-summary-card">
              <span className="summary-icon">👨‍🍳</span>
              <div>
                <p>Preparing</p>
                <h2>{getCount("Preparing")}</h2>
              </div>
            </div>

            <div className="orders-summary-card">
              <span className="summary-icon">✅</span>
              <div>
                <p>Completed</p>
                <h2>{getCount("Completed")}</h2>
              </div>
            </div>
          </div>

          {/* SEARCH */}
          <div className="orders-toolbar">
            <input
              type="text"
              placeholder="Search by order number, customer or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* STATUS FILTERS */}
          <div className="orders-filter-list">
            {statuses.map((status) => (
              <button
                key={status}
                className={activeStatus === status ? "active" : ""}
                onClick={() => setActiveStatus(status)}
              >
                {status}
                <span>{getCount(status)}</span>
              </button>
            ))}
          </div>

          {/* ERROR */}
          {error && (
            <div className="orders-error">
              {error}
              <button onClick={fetchOrders}>Try Again</button>
            </div>
          )}

          {/* LOADING AND ORDERS */}
          {loading ? (
            <div className="orders-message">
              Loading orders...
            </div>
          ) : (
            <div className="orders-list">
              {filteredOrders.length === 0 ? (
                <div className="orders-empty">
                  <div>🛒</div>
                  <h2>No Orders Found</h2>
                  <p>
                    There are no orders matching your selected filter.
                  </p>
                </div>
              ) : (
                filteredOrders.map((order) => {
                  const actions = getNextActions(order.order_status);
                  const isExpanded = expandedOrder === order._id;

                  return (
                    <div className="order-card" key={order._id}>

                      {/* ORDER TOP */}
                      <div className="order-card-header">
                        <div>
                          <h3>
                            {order.order_number ||
                              `Order #${order._id.slice(-6)}`}
                          </h3>

                          <p>{formatDate(order.created_at)}</p>
                        </div>

                        <span
                          className={`order-status ${getStatusClass(
                            order.order_status
                          )}`}
                        >
                          {order.order_status}
                        </span>
                      </div>

                      {/* CUSTOMER DETAILS */}
                      <div className="order-customer-details">
                        <div>
                          <span>Customer</span>
                          <strong>
                            {order.customer_name || "Customer"}
                          </strong>
                        </div>

                        <div>
                          <span>Phone</span>
                          <strong>
                            {order.phone || "Not provided"}
                          </strong>
                        </div>

                        <div>
                          <span>Order Type</span>
                          <strong>
                            {order.delivery_type === "dine_in"
                              ? `Dine In - Table ${
                                  order.table_number || "-"
                                }`
                              : order.delivery_type || "Not specified"}
                          </strong>
                        </div>

                        <div>
                          <span>Payment</span>
                          <strong>
                            {order.payment_method || "Not specified"}
                          </strong>
                        </div>
                      </div>

                      {/* ORDER ITEMS */}
                      <div className="order-items-preview">
                        <h4>Ordered Items</h4>

                        {order.items.map((item, index) => (
                          <div
                            className="order-item-row"
                            key={`${item.food_id}-${index}`}
                          >
                            <div>
                              <strong>{item.name}</strong>
                              <span>
                                ₹{item.price.toFixed(2)} × {item.quantity}
                              </span>
                            </div>

                            <strong>
                              ₹{item.subtotal.toFixed(2)}
                            </strong>
                          </div>
                        ))}
                      </div>

                      {/* TOTAL */}
                      <div className="order-total-row">
                        <span>
                          {order.total_items} item(s)
                        </span>

                        <strong>
                          Total: ₹
                          {Number(order.restaurant_total || 0).toFixed(2)}
                        </strong>
                      </div>

                      {/* PAYMENT AND ADDRESS */}
                      <div className="order-extra-details">
                        <span>
                          Payment Status:{" "}
                          <strong>{order.payment_status}</strong>
                        </span>

                        {order.delivery_type !== "dine_in" && (
                          <span>
                            Address:{" "}
                            {formatAddress(order.delivery_address) ||
                              "Not provided"}
                          </span>
                        )}
                      </div>

                      {/* ACTIONS */}
                      <div className="order-card-actions">
                        <button
                          className="order-details-btn"
                          onClick={() =>
                            setExpandedOrder(
                              isExpanded ? null : order._id
                            )
                          }
                        >
                          {isExpanded ? "Hide Details" : "View Details"}
                        </button>

                        <div className="order-status-actions">
                          {actions.map((action) => (
                            <button
                              key={action.status}
                              className={`order-action-btn ${action.style}`}
                              disabled={updatingOrder === order._id}
                              onClick={() =>
                                updateStatus(order._id, action.status)
                              }
                            >
                              {updatingOrder === order._id
                                ? "Updating..."
                                : action.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* EXPANDED DETAILS */}
                      {isExpanded && (
                        <div className="order-expanded-details">
                          <h4>Customer Information</h4>

                          <p>
                            <strong>Name:</strong>{" "}
                            {order.customer_name}
                          </p>

                          <p>
                            <strong>Email:</strong>{" "}
                            {order.customer_email || "Not provided"}
                          </p>

                          <p>
                            <strong>Phone:</strong>{" "}
                            {order.phone || "Not provided"}
                          </p>

                          {order.alternate_phone && (
                            <p>
                              <strong>Alternate Phone:</strong>{" "}
                              {order.alternate_phone}
                            </p>
                          )}

                          <p>
                            <strong>Order Number:</strong>{" "}
                            {order.order_number}
                          </p>

                          <p>
                            <strong>Payment Method:</strong>{" "}
                            {order.payment_method}
                          </p>

                          <p>
                            <strong>Payment Status:</strong>{" "}
                            {order.payment_status}
                          </p>

                          {order.delivery_type !== "dine_in" && (
                            <p>
                              <strong>Delivery Address:</strong>{" "}
                              {formatAddress(order.delivery_address) ||
                                "Not provided"}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default RestaurantOrders;