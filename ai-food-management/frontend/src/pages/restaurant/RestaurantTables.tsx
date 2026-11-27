
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import RestaurantSidebar from "../../pages/restaurant/RestaurantSidebar";
import "../../styles/restaurant/RestaurantTables.css";

const API = "http://127.0.0.1:8000";

interface TableOrderItem {
  name: string;
  quantity: number;
}

interface TableOrder {
  order_id: string;
  order_number: string;
  customer_name: string;
  order_status: string;
  items: TableOrderItem[];
}

interface RestaurantTable {
  _id: string;
  table_number: string;
  capacity: number;
  notes: string;
  status: string;
  occupied_minutes: number;
  own_active_orders_count: number;
  own_pending_orders_count: number;
  ai_message: string;
  recommendations: string[];
  restaurant_orders: TableOrder[];
}

function RestaurantTables() {
  const navigate = useNavigate();

  const restaurantId = localStorage.getItem("restaurantId");

  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState("");

  // FETCH SHARED TABLE INFORMATION
  const fetchTables = useCallback(async () => {
    if (!restaurantId) return;

    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `${API}/api/ai/table-monitoring/${restaurantId}`
      );

      const data = response.data;

      if (Array.isArray(data.tables)) {
        setTables(data.tables);
        setLastUpdated(new Date().toLocaleTimeString());
      } else {
        setTables([]);
        setError("Backend did not return a valid table list.");
      }
    } catch (err: any) {
      console.error("Table monitoring error:", err);

      setTables([]);

      setError(
        err.response?.data?.detail ||
          "Unable to load table monitoring information."
      );
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  // LOGIN CHECK AND INITIAL FETCH
  useEffect(() => {
    if (!restaurantId) {
      navigate("/login");
      return;
    }

    fetchTables();
  }, [restaurantId, navigate, fetchTables]);

  // AUTOMATIC REFRESH EVERY 30 SECONDS
  useEffect(() => {
    if (!restaurantId) return;

    const interval = window.setInterval(() => {
      fetchTables();
    }, 30000);

    return () => window.clearInterval(interval);
  }, [restaurantId, fetchTables]);

  // STATUS CLASS
  const getStatusClass = (status: string) =>
    (status || "unknown").toLowerCase().replace(/\s+/g, "-");

  // TABLE STATISTICS
  const occupiedCount = tables.filter(
    (table) => table.status === "Occupied"
  ).length;

  const availableCount = tables.filter(
    (table) => table.status === "Available"
  ).length;

  // OCCUPANCY DURATION
  const formatDuration = (minutes: number) => {
    if (!minutes || minutes < 1) return "Just started";

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }

    return `${remainingMinutes} minutes`;
  };

  // AI ATTENTION ALERTS
  const attentionTables = tables.filter(
    (table) =>
      table.status === "Occupied" &&
      (table.occupied_minutes >= 30 ||
        table.own_pending_orders_count > 0)
  );

  if (!restaurantId) return null;

  return (
    <>
      <RestaurantSidebar />

      <div className="restaurant-content-area">
        <main className="tables-page">

          {/* HEADER */}
          <header className="tables-header">
            <div>
              <h1>Food Court Tables</h1>

              <p>
                View shared table availability, your restaurant's
                orders and AI-powered occupancy monitoring.
              </p>
            </div>

            <button
              className="tables-add-btn"
              onClick={fetchTables}
              disabled={loading}
            >
              ↻ {loading ? "Refreshing..." : "Refresh"}
            </button>
          </header>

          {/* ERROR */}
          {error && (
            <div className="tables-message error">
              {error}
              <button
                className="tables-retry-btn"
                onClick={fetchTables}
                disabled={loading}
              >
                Try Again
              </button>
            </div>
          )}

          {/* TABLE STATISTICS */}
          <section className="tables-stats">

            <div className="tables-stat-card">
              <span>Total Tables</span>
              <h2>{tables.length}</h2>
            </div>

            <div className="tables-stat-card available">
              <span>Available</span>
              <h2>{availableCount}</h2>
            </div>

            <div className="tables-stat-card occupied">
              <span>Occupied</span>
              <h2>{occupiedCount}</h2>
            </div>

          </section>

          {/* AI ATTENTION ALERTS */}
          <section className="table-ai-overview">

            <div className="table-ai-icon">✦</div>

            <div className="table-ai-content">
              <h2>AI Table Attention Alerts</h2>

              <p>
                AI monitors shared table occupancy and your
                restaurant's pending orders to identify tables
                that may need attention.
              </p>

              {attentionTables.length > 0 ? (
                <div className="table-alert-list">

                  {attentionTables.map((table) => (
                    <div
                      className="table-alert-item"
                      key={table._id}
                    >
                      <strong>
                        Table {table.table_number}
                      </strong>

                      <p>
                        Occupied for:{" "}
                        {formatDuration(table.occupied_minutes)}
                      </p>

                      {table.own_pending_orders_count > 0 && (
                        <p>
                          Your pending orders:{" "}
                          {table.own_pending_orders_count}
                        </p>
                      )}
                    </div>
                  ))}

                </div>
              ) : (
                <p className="table-no-alert">
                  No tables currently require attention.
                </p>
              )}

              <small>
                AI alerts are advisory. Customer departure and
                table clearance are managed by Food Court Admin.
              </small>
            </div>

          </section>

          {/* INDIVIDUAL TABLE DETAILS */}
          <section className="tables-list-section">

            <div className="tables-list-heading">
              <div>
                <h2>All Food Court Tables</h2>

                <p>
                  Shared tables used by customers of all restaurants.
                </p>
              </div>

              {lastUpdated && (
                <span className="tables-last-updated">
                  Updated: {lastUpdated}
                </span>
              )}
            </div>

            {loading && tables.length === 0 ? (
              <div className="tables-empty">
                Loading table information...
              </div>
            ) : tables.length === 0 ? (
              <div className="tables-empty">
                <h3>No Tables Found</h3>

                <p>
                  Food Court Admin has not added any tables yet.
                </p>
              </div>
            ) : (

              <div className="tables-grid">

                {tables.map((table) => (

                  <article
                    className="table-card"
                    key={table._id}
                  >

                    {/* TABLE HEADER */}
                    <div className="table-card-top">

                      <div className="table-icon">🪑</div>

                      <span
                        className={`table-status ${getStatusClass(
                          table.status
                        )}`}
                      >
                        {table.status}
                      </span>

                    </div>

                    <h3>Table {table.table_number}</h3>

                    <p className="table-capacity">
                      ♧ {table.capacity} Seats
                    </p>

                    {table.notes && (
                      <p className="table-notes">
                        {table.notes}
                      </p>
                    )}

                    {/* OCCUPANCY INFORMATION */}
                    {table.status === "Occupied" && (

                      <div className="table-occupancy-info">

                        <strong>Occupancy Information</strong>

                        <p>
                          Occupied for:{" "}
                          <b>
                            {formatDuration(table.occupied_minutes)}
                          </b>
                        </p>

                        <p>
                          Your active orders:{" "}
                          <b>
                            {table.own_active_orders_count}
                          </b>
                        </p>

                        <p>
                          Your pending orders:{" "}
                          <b>
                            {table.own_pending_orders_count}
                          </b>
                        </p>

                      </div>

                    )}

                    {/* RESTAURANT'S OWN ORDERS */}
                    {table.restaurant_orders?.length > 0 && (

                      <div className="table-active-orders">

                        <strong>Your Restaurant's Orders</strong>

                        {table.restaurant_orders.map((order) => (

                          <div
                            key={order.order_id}
                            className="table-order-info"
                          >

                            <strong>
                              {order.order_number}
                            </strong>

                            <span>
                              Customer: {order.customer_name}
                            </span>

                            <small>
                              Status: {order.order_status}
                            </small>

                            {order.items?.length > 0 && (

                              <div className="table-order-items">

                                <strong>Your Food Items:</strong>

                                {order.items.map((item, index) => (
                                  <p key={index}>
                                    {item.name} × {item.quantity}
                                  </p>
                                ))}

                              </div>

                            )}

                          </div>

                        ))}

                      </div>

                    )}

                    {/* AI INSIGHT */}
                    {table.status === "Occupied" && (

                      <div className="table-ai-insight">

                        <div className="table-ai-insight-heading">
                          <span>✦</span>
                          <strong>AI Insight</strong>
                        </div>

                        <p>
                          {table.ai_message ||
                            "AI is monitoring this table."}
                        </p>

                        {table.recommendations?.length > 0 && (

                          <ul>
                            {table.recommendations.map(
                              (recommendation, index) => (
                                <li key={index}>
                                  {recommendation}
                                </li>
                              )
                            )}
                          </ul>

                        )}

                      </div>

                    )}

                    {/* TABLE OCCUPIED BY OTHER RESTAURANTS */}
                    {table.status === "Occupied" &&
                      table.own_active_orders_count === 0 && (

                        <p className="table-other-orders-note">
                          This table is occupied, but no order from
                          your restaurant is associated with it.
                        </p>

                    )}

                  </article>

                ))}

              </div>

            )}

          </section>

        </main>
      </div>
    </>
  );
}

export default RestaurantTables;