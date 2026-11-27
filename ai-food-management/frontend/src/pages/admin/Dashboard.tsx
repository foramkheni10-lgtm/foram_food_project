
import { useEffect, useState } from "react";
import {
  ShoppingBag,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  PackageCheck,
  Boxes,
  Utensils,
  RefreshCw,
  Brain,
  Lightbulb,
  BarChart3,
  PieChart as PieChartIcon,
} from "lucide-react";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

import api from "../../services/api";
import "./Dashboard.css";

interface InventoryStock {
  name: string;
  quantity: number;
  minimumStock: number;
  unit: string;
}

interface DashboardData {
  totalOrders: number;
  placedOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalDeliveries: number;
  deliveredOrders: number;
  totalInventoryItems: number;
  totalIngredients: number;
  inventoryStock: InventoryStock[];
}

interface Recommendation {
  type: string;
  category: string;
  message: string;
  suggestion: string;
}

interface AIRecommendationData {
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  lowStockItems: number;
  recommendationCount: number;
  recommendations: Recommendation[];
}

const ORDER_COLORS = [
  "#d97706",
  "#4d7c0f",
  "#b91c1c",
  "#78716c",
];

function Dashboard() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [aiData, setAiData] = useState<AIRecommendationData | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/api/admin/dashboard/");
      console.log("Dashboard API Response:", response.data);
      setDashboard(response.data);
    } catch (err) {
      console.error("Dashboard API Error:", err);
      setError("Unable to load dashboard statistics.");
    }

    try {
      const response = await api.get(
        "/api/ai/business-recommendations/"
      );

      console.log("AI Recommendation Response:", response.data);
      setAiData(response.data);
    } catch (err) {
      console.error("AI Recommendation API Error:", err);
      setAiData(null);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const cards = [
    {
      title: "Total Orders",
      value: dashboard?.totalOrders ?? 0,
      icon: ShoppingBag,
      className: "dashboard-card-blue",
    },
    {
      title: "Placed Orders",
      value: dashboard?.placedOrders ?? 0,
      icon: Clock,
      className: "dashboard-card-orange",
    },
    {
      title: "Completed Orders",
      value: dashboard?.completedOrders ?? 0,
      icon: CheckCircle,
      className: "dashboard-card-green",
    },
    {
      title: "Cancelled Orders",
      value: dashboard?.cancelledOrders ?? 0,
      icon: XCircle,
      className: "dashboard-card-red",
    },
    {
      title: "Total Deliveries",
      value: dashboard?.totalDeliveries ?? 0,
      icon: Truck,
      className: "dashboard-card-purple",
    },
    {
      title: "Delivered Orders",
      value: dashboard?.deliveredOrders ?? 0,
      icon: PackageCheck,
      className: "dashboard-card-teal",
    },
    {
      title: "Inventory Items",
      value: dashboard?.totalInventoryItems ?? 0,
      icon: Boxes,
      className: "dashboard-card-indigo",
    },
    {
      title: "Ingredients",
      value: dashboard?.totalIngredients ?? 0,
      icon: Utensils,
      className: "dashboard-card-yellow",
    },
  ];

  // Include orders with other statuses so the chart accounts for all orders.
  const otherOrders = Math.max(
    0,
    (dashboard?.totalOrders ?? 0) -
      (dashboard?.placedOrders ?? 0) -
      (dashboard?.completedOrders ?? 0) -
      (dashboard?.cancelledOrders ?? 0)
  );

  const orderChartData = [
    { name: "Placed", value: dashboard?.placedOrders ?? 0 },
    { name: "Completed", value: dashboard?.completedOrders ?? 0 },
    { name: "Cancelled", value: dashboard?.cancelledOrders ?? 0 },
    { name: "Other / In Progress", value: otherOrders },
  ];

  const inventoryChartData = (dashboard?.inventoryStock ?? []).map(
    (item) => ({
      ...item,
      displayName: `${item.name} (${item.unit})`,
    })
  );

  return (
    <div className="admin-dashboard">
      {/* Dashboard Header */}
      <div className="dashboard-header">
        <div>
          <p className="dashboard-welcome">Welcome back 👋</p>
          <h1>Admin Dashboard</h1>
          <p className="dashboard-subtitle">
            Overview of your AI Food Management System
          </p>
        </div>

        <button
          className="refresh-button"
          onClick={fetchDashboard}
          disabled={loading}
        >
          <RefreshCw
            size={18}
            className={loading ? "spin" : ""}
          />
          Refresh
        </button>
      </div>

      {error && <div className="dashboard-error">{error}</div>}

      {loading && !dashboard ? (
        <div className="dashboard-loading">
          <RefreshCw size={30} className="spin" />
          <p>Loading dashboard...</p>
        </div>
      ) : (
        <>
          {/* Statistics Cards */}
          <div className="dashboard-grid">
            {cards.map((card) => {
              const Icon = card.icon;

              return (
                <div
                  className={`dashboard-stat-card ${card.className}`}
                  key={card.title}
                >
                  <div className="stat-card-top">
                    <div className="stat-icon">
                      <Icon size={24} />
                    </div>
                  </div>

                  <div className="stat-content">
                    <p>{card.title}</p>
                    <h2>{card.value}</h2>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="dashboard-summary">
            <div className="summary-header">
              <div>
                <h2>Order Summary</h2>
                <p>Current order status overview</p>
              </div>
            </div>

            <div className="summary-list">
              <div className="summary-item">
                <div className="summary-left">
                  <span className="summary-dot placed"></span>
                  <span>Placed Orders</span>
                </div>
                <strong>{dashboard?.placedOrders ?? 0}</strong>
              </div>

              <div className="summary-item">
                <div className="summary-left">
                  <span className="summary-dot completed"></span>
                  <span>Completed Orders</span>
                </div>
                <strong>{dashboard?.completedOrders ?? 0}</strong>
              </div>

              <div className="summary-item">
                <div className="summary-left">
                  <span className="summary-dot cancelled"></span>
                  <span>Cancelled Orders</span>
                </div>
                <strong>{dashboard?.cancelledOrders ?? 0}</strong>
              </div>

              <div className="summary-item">
                <div className="summary-left">
                  <span className="summary-dot delivery"></span>
                  <span>Delivered Orders</span>
                </div>
                <strong>{dashboard?.deliveredOrders ?? 0}</strong>
              </div>
            </div>
          </div>

          {/* Dashboard Charts */}
          <div className="dashboard-charts-grid">
            {/* Order Status Chart */}
            <div className="dashboard-chart-card">
              <div className="dashboard-chart-header">
                <div className="dashboard-chart-icon">
                  <PieChartIcon size={21} />
                </div>
                <div>
                  <h2>Order Status Overview</h2>
                  <p>Distribution of all customer orders</p>
                </div>
              </div>

              <div className="dashboard-chart">
                {dashboard && dashboard.totalOrders > 0 ? (
                  <ResponsiveContainer width="100%" height={320}>
                    <PieChart>
                      <Pie
                        data={orderChartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="45%"
                        innerRadius={65}
                        outerRadius={105}
                        paddingAngle={3}
label={({ percent }) =>
  `${((percent ?? 0) * 100).toFixed(0)}%`
}
                      >
                        {orderChartData.map((entry, index) => (
                          <Cell
                            key={entry.name}
                            fill={ORDER_COLORS[index]}
                          />
                        ))}
                      </Pie>

                      <Tooltip />
                      <Legend verticalAlign="bottom" />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="chart-empty">
                    No order data available.
                  </div>
                )}
              </div>
            </div>

            {/* Inventory Stock Chart */}
            <div className="dashboard-chart-card">
              <div className="dashboard-chart-header">
                <div className="dashboard-chart-icon">
                  <BarChart3 size={21} />
                </div>
                <div>
                  <h2>Inventory Stock Overview</h2>
                  <p>Current stock compared with minimum stock</p>
                </div>
              </div>

              <div className="dashboard-chart inventory-chart">
                {inventoryChartData.length > 0 ? (
                  <ResponsiveContainer
                    width="100%"
                    height={Math.max(320, inventoryChartData.length * 48)}
                  >
                    <BarChart
                      data={inventoryChartData}
                      layout="vertical"
                      margin={{
                        top: 5,
                        right: 20,
                        left: 10,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        horizontal={false}
                      />

                      <XAxis type="number" />

                      <YAxis
                        type="category"
                        dataKey="displayName"
                        width={110}
                        tick={{ fontSize: 11 }}
                      />

                      <Tooltip
                        formatter={(value, name) => [
                          `${value}`,
                          name,
                        ]}
                      />

                      <Legend />

                      <Bar
                        dataKey="quantity"
                        name="Current Stock"
                        fill="#c65d3a"
                        radius={[0, 5, 5, 0]}
                      />

                      <Bar
                        dataKey="minimumStock"
                        name="Minimum Stock"
                        fill="#e7a66a"
                        radius={[0, 5, 5, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="chart-empty">
                    No inventory data available.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* AI Business Insights */}
          <div className="dashboard-ai-section">
            <div className="dashboard-ai-header">
              <div className="dashboard-ai-title">
                <div className="dashboard-ai-icon">
                  <Brain size={24} />
                </div>

                <div>
                  <h2>AI Business Insights</h2>
                  <p>
                    Smart recommendations based on your current business data
                  </p>
                </div>
              </div>

              <span className="ai-count">
                {aiData?.recommendationCount ?? 0} Insights
              </span>
            </div>

            {aiData?.recommendations &&
            aiData.recommendations.length > 0 ? (
              <div className="ai-recommendation-list">
                {aiData.recommendations.map((recommendation, index) => (
                  <div
                    className="ai-recommendation-card"
                    key={`${recommendation.category}-${index}`}
                  >
                    <div className="ai-recommendation-icon">
                      <Lightbulb size={20} />
                    </div>

                    <div className="ai-recommendation-content">
                      <span className="ai-category">
                        {recommendation.category}
                      </span>

                      <h3>{recommendation.message}</h3>
                      <p>{recommendation.suggestion}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="ai-empty-state">
                <Brain size={28} />
                <p>No AI recommendations available right now.</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;
