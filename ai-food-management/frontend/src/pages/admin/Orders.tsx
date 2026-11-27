
import { useEffect, useMemo, useState } from "react";
import {
  Search,
  RefreshCw,
  ShoppingBag,
  Clock,
  ChefHat,
  CheckCircle,
  XCircle,
  Eye,
  CreditCard,
  MapPin,
  Package,
} from "lucide-react";

import api from "../../services/api";
import "./Orders.css";

interface OrderItem {
  foodName?: string;
  name?: string;
  quantity?: number;
  price?: number;
  subtotal?: number;
  category?: string;
  customizations?: {
    group?: string;
    option?: string;
    additional_price?: number;
  }[];
  special_instructions?: string;
}

interface Order {
  _id?: string;
  id?: string;
  order_id?: string;
  orderId?: string;
  order_number?: string;

  customerName?: string;
  customer_name?: string;
  customer?: string;
  customer_email?: string;
  customerEmail?: string;
  phone?: string;

  restaurantName?: string;
  restaurant_name?: string;
  restaurant?: string;
  restaurantId?: string;
  restaurantId_old?: string;

  status?: string;
  order_status?: string;
  delivery_status?: string;
  restaurant_statuses?: Record<string, string>;

  totalAmount?: number;
  total_price?: number;
  total?: number;
  amount?: number;

  total_items?: number;
  items?: OrderItem[];

  createdAt?: string;
  created_at?: string;

  payment_method?: string;
  payment_status?: string;
  paymentMethod?: string;
  paymentStatus?: string;

  delivery_type?: string;
  orderType?: string;
  delivery_address?: {
    house_number?: string;
    street?: string;
    area?: string;
    landmark?: string;
    city?: string;
    state?: string;
    pincode?: string;
  } | string;
  deliveryAddress?: string;

  table_number?: string | number;
  tableNumber?: string | number;

  completed_at?: string;
}

function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const [selectedOrder, setSelectedOrder] =
    useState<Order | null>(null);

  const [showOrderModal, setShowOrderModal] =
    useState(false);

  // ==========================================
  // LOAD ALL ORDERS
  // ==========================================

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/api/admin/orders/");

      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.orders || [];

      setOrders(data);
    } catch (err) {
      console.error("Failed to load admin orders:", err);
      setError(
        "Unable to load orders. Please check your Admin login and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // ==========================================
  // ORDER ID
  // ==========================================

  const getOrderId = (order: Order) => {
    return (
      order.order_number ||
      order.order_id ||
      order.orderId ||
      order._id ||
      order.id ||
      "N/A"
    );
  };

  // ==========================================
  // ORDER STATUS
  // ==========================================

  const getStatus = (order: Order) => {
    return (
      order.order_status ||
      order.status ||
      order.delivery_status ||
      "Unknown"
    ).trim();
  };

  const normalizedStatus = (order: Order) =>
    getStatus(order).toLowerCase().trim();

  const formatStatus = (status?: string) => {
    if (!status) return "Unknown";

    return status
      .trim()
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  const getStatusClass = (status?: string) => {
    switch (status?.toLowerCase().trim()) {
      case "placed":
        return "order-status placed";

      case "accepted":
        return "order-status accepted";

      case "preparing":
        return "order-status preparing";

      case "ready":
        return "order-status ready";

      case "out for delivery":
        return "order-status ready";

      case "completed":
      case "delivered":
        return "order-status completed";

      case "cancelled":
      case "rejected":
        return "order-status cancelled";

      default:
        return "order-status";
    }
  };

  // ==========================================
  // CUSTOMER
  // ==========================================

  const getCustomerName = (order: Order) => {
    return (
      order.customer_name ||
      order.customerName ||
      order.customer ||
      "Customer"
    );
  };

  const getCustomerEmail = (order: Order) => {
    return order.customer_email || order.customerEmail || "N/A";
  };

  // ==========================================
  // RESTAURANT
  // ==========================================

  const getRestaurantName = (order: Order) => {
    return (
      order.restaurant_name ||
      order.restaurantName ||
      order.restaurant ||
      "Restaurant details unavailable"
    );
  };

  // ==========================================
  // AMOUNT
  // ==========================================

  const getAmount = (order: Order) => {
    return Number(
      order.total_price ??
      order.totalAmount ??
      order.total ??
      order.amount ??
      0
    );
  };

  // ==========================================
  // DATE
  // ==========================================

  const getDate = (order: Order) => {
    const date = order.created_at || order.createdAt;

    if (!date) return "N/A";

    const parsedDate = new Date(date);

    if (isNaN(parsedDate.getTime())) return "N/A";

    return parsedDate.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ==========================================
  // DELIVERY TYPE
  // ==========================================

  const getDeliveryType = (order: Order) => {
    const type = (
      order.delivery_type ||
      order.orderType ||
      "N/A"
    ).toLowerCase();

    if (type === "take_away" || type === "takeaway") {
      return "Take Away";
    }

    if (type === "dine_in" || type === "dine-in") {
      return "Dine In";
    }

    if (type === "delivery") {
      return "Delivery";
    }

    return formatStatus(type);
  };

  // ==========================================
  // PAYMENT
  // ==========================================

  const getPaymentMethod = (order: Order) => {
    return order.payment_method || order.paymentMethod || "N/A";
  };

  const getPaymentStatus = (order: Order) => {
    return (
      order.payment_status ||
      order.paymentStatus ||
      "Unknown"
    ).trim();
  };

  // ==========================================
  // ADDRESS
  // ==========================================

  const getAddress = (order: Order) => {
    const address = order.delivery_address;

    if (typeof address === "string") {
      return address || "No delivery address";
    }

    if (address && typeof address === "object") {
      return [
        address.house_number,
        address.street,
        address.area,
        address.landmark,
        address.city,
        address.state,
        address.pincode,
      ]
        .filter(Boolean)
        .join(", ") || "No delivery address";
    }

    return order.deliveryAddress || "No delivery address";
  };

  // ==========================================
  // FILTER ORDERS
  // ==========================================

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const customer = getCustomerName(order).toLowerCase();
      const restaurant = getRestaurantName(order).toLowerCase();
      const orderId = getOrderId(order).toLowerCase();
      const email = getCustomerEmail(order).toLowerCase();

      const status = normalizedStatus(order);
      const deliveryType = (
        order.delivery_type ||
        order.orderType ||
        ""
      ).toLowerCase();

      const searchText = search.toLowerCase().trim();

      const matchesSearch =
        orderId.includes(searchText) ||
        customer.includes(searchText) ||
        restaurant.includes(searchText) ||
        email.includes(searchText);

      const matchesStatus =
        statusFilter === "all" ||
        status === statusFilter;

      const matchesType =
        typeFilter === "all" ||
        deliveryType === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [orders, search, statusFilter, typeFilter]);

  // ==========================================
  // SUMMARY COUNTS
  // ==========================================

  const totalOrders = orders.length;

  const placedOrders = orders.filter(
    (order) => normalizedStatus(order) === "placed"
  ).length;

  const preparingOrders = orders.filter(
    (order) => normalizedStatus(order) === "preparing"
  ).length;

  const completedOrders = orders.filter(
    (order) =>
      ["completed", "delivered"].includes(normalizedStatus(order))
  ).length;

  const cancelledOrders = orders.filter(
    (order) =>
      ["cancelled", "rejected"].includes(normalizedStatus(order))
  ).length;

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="orders-page">
        <div className="orders-loading">
          <RefreshCw size={30} className="orders-spin" />
          <p>Loading orders...</p>
        </div>
      </div>
    );
  }

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <div className="orders-page">

      {/* HEADER */}

      <div className="orders-header">
        <div>
          <p className="orders-welcome">
            Monitor customer orders across restaurants
          </p>

          <h1>Orders</h1>

          <p className="orders-subtitle">
            View order details, payment information and delivery progress.
          </p>
        </div>

        <button
          className="orders-refresh-button"
          onClick={loadOrders}
        >
          <RefreshCw size={18} />
          Refresh
        </button>
      </div>

      {/* ERROR */}

      {error && (
        <div className="orders-error">
          {error}
        </div>
      )}

      {/* SUMMARY */}

      <div className="orders-summary-grid">

        <div className="orders-summary-card">
          <div className="orders-summary-icon total">
            <ShoppingBag size={22} />
          </div>
          <div>
            <p>Total Orders</p>
            <h2>{totalOrders}</h2>
          </div>
        </div>

        <div className="orders-summary-card">
          <div className="orders-summary-icon placed">
            <Clock size={22} />
          </div>
          <div>
            <p>Placed</p>
            <h2>{placedOrders}</h2>
          </div>
        </div>

        <div className="orders-summary-card">
          <div className="orders-summary-icon preparing">
            <ChefHat size={22} />
          </div>
          <div>
            <p>Preparing</p>
            <h2>{preparingOrders}</h2>
          </div>
        </div>

        <div className="orders-summary-card">
          <div className="orders-summary-icon completed">
            <CheckCircle size={22} />
          </div>
          <div>
            <p>Completed</p>
            <h2>{completedOrders}</h2>
          </div>
        </div>

        <div className="orders-summary-card">
          <div className="orders-summary-icon cancelled">
            <XCircle size={22} />
          </div>
          <div>
            <p>Cancelled / Rejected</p>
            <h2>{cancelledOrders}</h2>
          </div>
        </div>

      </div>

      {/* ORDERS CONTAINER */}

      <div className="orders-container">

        {/* TOOLBAR */}

        <div className="orders-toolbar">

          <div className="orders-search">
            <Search size={19} />

            <input
              type="text"
              placeholder="Search order number, customer or restaurant..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="orders-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="placed">Placed</option>
            <option value="accepted">Accepted</option>
            <option value="preparing">Preparing</option>
            <option value="ready">Ready</option>
            <option value="out for delivery">Out for Delivery</option>
            <option value="completed">Completed</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
            <option value="rejected">Rejected</option>
          </select>

          <select
            className="orders-filter"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">All Order Types</option>
            <option value="delivery">Delivery</option>
            <option value="take_away">Take Away</option>
            <option value="dine_in">Dine In</option>
            <option value="takeaway">Take Away (Legacy)</option>
            <option value="dine-in">Dine In (Legacy)</option>
          </select>

        </div>

        {/* TABLE */}

        <div className="orders-table-wrapper">
          <table className="orders-table">

            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Restaurant</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>

              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="orders-empty">
                    <ShoppingBag size={40} />
                    <h3>No orders found</h3>
                    <p>There are no orders matching your filters.</p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={getOrderId(order)}>

                    <td>
                      <span className="order-id">
                        #{getOrderId(order).slice(-8)}
                      </span>
                    </td>

                    <td>
                      <div className="customer-info">
                        <div className="customer-avatar">
                          {getCustomerName(order).charAt(0).toUpperCase()}
                        </div>
                        <span>{getCustomerName(order)}</span>
                      </div>
                    </td>

                    <td>
                      <span className="restaurant-name">
                        {getRestaurantName(order)}
                      </span>
                    </td>

                    <td>
                      <div className="order-items">
                        {order.items?.length ? (
                          <>
                            {order.items.slice(0, 2).map((item, index) => (
                              <span key={index}>
                                {item.name || item.foodName || "Food"}
                                {" × "}
                                {item.quantity || 1}
                              </span>
                            ))}

                            {order.items.length > 2 && (
                              <small>
                                +{order.items.length - 2} more
                              </small>
                            )}
                          </>
                        ) : (
                          <span>No item details</span>
                        )}
                      </div>
                    </td>

                    <td>
                      <strong className="order-total">
                        ₹{getAmount(order).toLocaleString("en-IN")}
                      </strong>
                    </td>

                    <td>
                      <span className={getStatusClass(getStatus(order))}>
                        {formatStatus(getStatus(order))}
                      </span>
                    </td>

                    <td>
                      <span>
                        {formatStatus(getPaymentStatus(order))}
                      </span>
                    </td>

                    <td>
                      <span className="order-date">
                        {getDate(order)}
                      </span>
                    </td>

                    <td>
                      <button
                        className="order-view-button"
                        title="View order"
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowOrderModal(true);
                        }}
                      >
                        <Eye size={17} />
                      </button>
                    </td>

                  </tr>
                ))
              )}

            </tbody>
          </table>
        </div>

        <div style={{ padding: "16px 20px" }}>
          Showing {filteredOrders.length} of {totalOrders} orders
        </div>

      </div>

      {/* ORDER DETAILS MODAL */}

      {showOrderModal && selectedOrder && (
        <div
          className="order-modal-overlay"
          onClick={() => setShowOrderModal(false)}
        >
          <div
            className="order-modal"
            onClick={(e) => e.stopPropagation()}
          >

            {/* MODAL HEADER */}

            <div className="order-modal-header">
              <div>
                <p>Order Details</p>
                <h2>#{getOrderId(selectedOrder)}</h2>
              </div>

              <button
                className="order-modal-close"
                onClick={() => setShowOrderModal(false)}
              >
                ×
              </button>
            </div>

            {/* CUSTOMER INFORMATION */}

            <div className="order-modal-info">

              <div className="order-info-box">
                <span>Customer</span>
                <strong>{getCustomerName(selectedOrder)}</strong>
                <span>{getCustomerEmail(selectedOrder)}</span>
                <span>{selectedOrder.phone || "No phone number"}</span>
              </div>

              <div className="order-info-box">
                <span>Restaurant</span>
                <strong>{getRestaurantName(selectedOrder)}</strong>
                <span>Order Type: {getDeliveryType(selectedOrder)}</span>

                {(selectedOrder.table_number || selectedOrder.tableNumber) && (
                  <span>
                    Table: {selectedOrder.table_number || selectedOrder.tableNumber}
                  </span>
                )}
              </div>

            </div>

            {/* ORDER ITEMS */}

            <div className="order-modal-section">
              <h3>Order Items</h3>

              <div className="modal-items">

                {selectedOrder.items?.length ? (
                  selectedOrder.items.map((item, index) => (
                    <div className="modal-item" key={index}>

                      <div>
                        <strong>
                          {item.name || item.foodName || "Food Item"}
                        </strong>

                        <span>
                          × {item.quantity || 1}
                        </span>

                        {item.customizations?.map((customization, i) => (
                          <small key={i} style={{ display: "block" }}>
                            {customization.group}: {customization.option}
                            {customization.additional_price
                              ? ` (+₹${customization.additional_price})`
                              : ""}
                          </small>
                        ))}

                        {item.special_instructions && (
                          <small style={{ display: "block" }}>
                            Instructions: {item.special_instructions}
                          </small>
                        )}
                      </div>

                      <strong>
                        ₹{Number(
                          item.subtotal ??
                          Number(item.price || 0) * Number(item.quantity || 1)
                        ).toLocaleString("en-IN")}
                      </strong>

                    </div>
                  ))
                ) : (
                  <p className="modal-no-items">
                    No item details available.
                  </p>
                )}

              </div>
            </div>

            {/* PAYMENT INFORMATION */}

            <div className="order-modal-section">
              <h3>
                <CreditCard size={18} /> Payment Information
              </h3>

              <div className="order-modal-info">

                <div className="order-info-box">
                  <span>Payment Method</span>
                  <strong>{getPaymentMethod(selectedOrder)}</strong>
                </div>

                <div className="order-info-box">
                  <span>Payment Status</span>
                  <strong>
                    {formatStatus(getPaymentStatus(selectedOrder))}
                  </strong>
                </div>

              </div>
            </div>

            {/* DELIVERY INFORMATION */}

            {getDeliveryType(selectedOrder) === "Delivery" && (
              <div className="order-modal-section">
                <h3>
                  <MapPin size={18} /> Delivery Address
                </h3>

                <p>{getAddress(selectedOrder)}</p>
              </div>
            )}

            {/* TOTAL */}

            <div className="modal-total">
              <span>Total Amount</span>

              <strong>
                ₹{getAmount(selectedOrder).toLocaleString("en-IN")}
              </strong>
            </div>

            {/* STATUS MONITORING */}

            <div className="order-modal-section">
              <h3>
                <Package size={18} /> Order Status Monitoring
              </h3>

              <p>
                Current Status:{" "}
                <span className={getStatusClass(getStatus(selectedOrder))}>
                  {formatStatus(getStatus(selectedOrder))}
                </span>
              </p>

              <p style={{ marginTop: "10px" }}>
                Restaurant and delivery partners manage order status updates.
                Admin can monitor progress here.
              </p>
            </div>

            {/* FOOTER */}

            <div className="order-modal-footer">
              <span>{getDate(selectedOrder)}</span>

              <span className={getStatusClass(getStatus(selectedOrder))}>
                {formatStatus(getStatus(selectedOrder))}
              </span>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default Orders;
