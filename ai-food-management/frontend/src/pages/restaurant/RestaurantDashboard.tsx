
import {
  useEffect,
  useState,
  type CSSProperties,
  type ChangeEvent,
  type FormEvent,
} from "react";

import { useNavigate } from "react-router-dom";
import axios from "axios";

import RestaurantSidebar from "./RestaurantSidebar";
import "../../styles/restaurant/RestaurantDashboard.css";

import { useRestaurantTheme } from "../../theme/RestaurantThemeContext";

import {
  defaultTheme,
  getTheme,
  themes,
  type ThemeName,
} from "../../theme/RestaurantTheme";

const API = "http://127.0.0.1:8000";

const getAuthConfig = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Authentication token missing. Please login again.");
  }

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

type OrderItem = {
  food_id: string;
  name: string;
  category?: string;
  price: number;
  quantity: number;
  subtotal: number;
};

type RestaurantOrder = {
  _id: string;
  order_number: string;
  customer_name: string;
  customer_email?: string;
  phone?: string;
  items: OrderItem[];
  total_items: number;
  total_price: number;
  restaurant_total?: number;
  payment_method?: string;
  payment_status?: string;
  order_status: string;
  delivery_type?: string;
  table_number?: string;
  created_at?: string;
};

type PopularFood = {
  name: string;
  quantity: number;
  revenue: number;
};

function RestaurantDashboard() {
  const navigate = useNavigate();
  const { theme, setRestaurantTheme } = useRestaurantTheme();

  const [restaurantName, setRestaurantName] = useState("Restaurant");
  const [ownerName, setOwnerName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [logo, setLogo] = useState("");

  const [todayOrders, setTodayOrders] = useState(0);
  const [pendingOrders, setPendingOrders] = useState(0);
  const [completedOrders, setCompletedOrders] = useState(0);
  const [todayRevenue, setTodayRevenue] = useState(0);

  const [recentOrders, setRecentOrders] = useState<RestaurantOrder[]>([]);
  const [popularFood, setPopularFood] = useState<PopularFood[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [selectedTheme, setSelectedTheme] = useState<ThemeName>(
    defaultTheme.themeName
  );

  const [editRestaurantName, setEditRestaurantName] = useState("");
  const [editOwnerName, setEditOwnerName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editLogo, setEditLogo] = useState("");

  // LOAD DASHBOARD AND AUTO REFRESH

  const getDashboardData = async (backgroundRefresh = false) => {
    try {
      const restaurantId = localStorage.getItem("restaurantId");

      if (!restaurantId) {
        setError("Restaurant ID not found. Please login again.");
        setLoading(false);
        return;
      }

      if (backgroundRefresh) {
        setRefreshing(true);
      }

      const authConfig = getAuthConfig();

      // Load dashboard data
      const dashboardResponse = await axios.get(
        `${API}/api/restaurants/${restaurantId}/dashboard`,
        authConfig
      );

      const data = dashboardResponse.data;

      setRestaurantName(data.restaurantName || "Restaurant");
      setOwnerName(data.ownerName || "");
      setEmail(data.email || "");

      setTodayOrders(data.todayOrders || 0);
      setPendingOrders(data.pendingOrders || 0);
      setCompletedOrders(data.completedOrders || 0);
      setTodayRevenue(data.todayRevenue || 0);

      const orders: RestaurantOrder[] = data.recentOrders || [];
      setRecentOrders(orders);

      // Calculate popular food from recent orders
      const foodMap: Record<string, PopularFood> = {};

      orders.forEach((order) => {
        (order.items || []).forEach((item) => {
          const foodName = item.name || "Food";

          if (!foodMap[foodName]) {
            foodMap[foodName] = {
              name: foodName,
              quantity: 0,
              revenue: 0,
            };
          }

          foodMap[foodName].quantity += Number(item.quantity || 0);
          foodMap[foodName].revenue += Number(item.subtotal || 0);
        });
      });

      const popular = Object.values(foodMap)
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);

      setPopularFood(popular);

      // Load restaurant profile
      const profileResponse = await axios.get(
        `${API}/api/restaurants/${restaurantId}`,
        authConfig
      );

      const profile = profileResponse.data;

      setRestaurantName(
        profile.restaurantName || data.restaurantName || "Restaurant"
      );

      setOwnerName(profile.ownerName || data.ownerName || "");
      setEmail(profile.email || data.email || "");
      setPhone(profile.phone || "");
      setAddress(profile.address || "");

      const savedLogo = profile.logo || "";

      setLogo(
        savedLogo.startsWith("data:image/") ||
          savedLogo.startsWith("https://") ||
          savedLogo.startsWith("http://")
          ? savedLogo
          : ""
      );

      // Load restaurant theme
      const savedTheme = getTheme(profile.theme);

      setRestaurantTheme(savedTheme);
      setSelectedTheme(savedTheme.themeName);

      localStorage.setItem(
        "restaurantName",
        profile.restaurantName || data.restaurantName || ""
      );

      setError("");
    } catch (error: unknown) {
      console.error("Dashboard error:", error);

      if (!backgroundRefresh) {
        if (axios.isAxiosError(error)) {
          const message =
            error.response?.data?.detail ||
            (error.response?.status === 401 ||
            error.response?.status === 403
              ? "Authentication failed. Please login again."
              : "Unable to load dashboard.");

          setError(message);
        } else if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("Unable to load dashboard.");
        }
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    getDashboardData();

    const interval = window.setInterval(() => {
      getDashboardData(true);
    }, 15000);

    return () => window.clearInterval(interval);
  }, []);

  // FORMAT DATE AND CURRENCY

  const formatDate = (date?: string) => {
    if (!date) return "Date unavailable";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Date unavailable";
    }

    return parsedDate.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number) => {
    return Number(amount || 0).toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    });
  };

  const getStatusClass = (status: string) => {
    return (status || "placed").toLowerCase().replace(/\s+/g, "-");
  };

  // PROFILE EDIT

  const openEditProfile = () => {
    setEditRestaurantName(restaurantName);
    setEditOwnerName(ownerName);
    setEditEmail(email);
    setEditPhone(phone);
    setEditAddress(address);
    setEditLogo(logo);
    setSelectedTheme(theme.themeName || "terracotta");

    setProfileMenuOpen(false);
    setEditModalOpen(true);
  };

  const handleEditLogo = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image.");
      event.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("Logo size should not exceed 2MB.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        setEditLogo(reader.result);
      }
    };

    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async (event: FormEvent) => {
    event.preventDefault();

    const restaurantId = localStorage.getItem("restaurantId");

    if (!restaurantId) {
      alert("Please login again.");
      return;
    }

    if (
      !editRestaurantName.trim() ||
      !editOwnerName.trim() ||
      !editEmail.trim() ||
      !editPhone.trim() ||
      !editAddress.trim()
    ) {
      alert("Please fill in all profile fields.");
      return;
    }

    setSaving(true);

    try {
      const updatedTheme = themes[selectedTheme] || defaultTheme;

      await axios.put(
        `${API}/api/restaurants/${restaurantId}`,
        {
          restaurantName: editRestaurantName.trim(),
          ownerName: editOwnerName.trim(),
          email: editEmail.trim(),
          phone: editPhone.trim(),
          address: editAddress.trim(),
          logo: editLogo,
          theme: updatedTheme,
        },
        getAuthConfig()
      );

      setRestaurantName(editRestaurantName.trim());
      setOwnerName(editOwnerName.trim());
      setEmail(editEmail.trim());
      setPhone(editPhone.trim());
      setAddress(editAddress.trim());
      setLogo(editLogo);

      setRestaurantTheme(updatedTheme);

      localStorage.setItem(
        "restaurantName",
        editRestaurantName.trim()
      );

      setEditModalOpen(false);

      alert("Restaurant profile updated successfully!");
    } catch (error: unknown) {
      console.error("Profile update error:", error);

      const message = axios.isAxiosError(error)
        ? error.response?.data?.detail ||
          "Unable to update profile. Please try again."
        : error instanceof Error
          ? error.message
          : "Unable to update profile. Please try again.";

      alert(message);
    } finally {
      setSaving(false);
    }
  };

  // DELETE RESTAURANT ACCOUNT

  const handleDeleteAccount = async () => {
    const restaurantId = localStorage.getItem("restaurantId");

    if (!restaurantId) {
      alert("Restaurant ID not found. Please login again.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to permanently delete your restaurant account?\n\nYour restaurant profile, food menu, orders, and related restaurant data will also be deleted. This action cannot be undone."
    );

    if (!confirmed) return;

    const secondConfirmation = window.confirm(
      "Final confirmation: Do you really want to delete this restaurant and all its data?"
    );

    if (!secondConfirmation) return;

    setDeleting(true);

    try {
      await axios.delete(
        `${API}/api/restaurants/${restaurantId}`,
        getAuthConfig()
      );

      localStorage.removeItem("token");
      localStorage.removeItem("restaurantId");
      localStorage.removeItem("restaurantName");
      localStorage.removeItem("restaurantEmail");

      alert("Restaurant account deleted successfully.");

      navigate("/restaurant/login");
    } catch (error: unknown) {
      console.error("Delete account error:", error);

      const message = axios.isAxiosError(error)
        ? error.response?.data?.detail ||
          "Unable to delete account. Please try again."
        : error instanceof Error
          ? error.message
          : "Unable to delete account. Please try again.";

      alert(message);
    } finally {
      setDeleting(false);
    }
  };

  // LOGOUT

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("restaurantId");
    localStorage.removeItem("restaurantName");
    localStorage.removeItem("restaurantEmail");

    navigate("/restaurant/login");
  };

  // DASHBOARD THEME

  const dashboardStyle = {
    "--primary": theme.primaryColor,
    "--primary-dark": theme.primaryColor,
    "--primary-light": theme.secondaryColor,
    "--primary-soft": `${theme.secondaryColor}30`,
    "--background": theme.backgroundColor,
    "--surface": theme.cardColor,
    "--text": theme.textColor,
    "--text-light": theme.textColor,
    "--border": `${theme.primaryColor}30`,
  } as CSSProperties;

  // LOADING AND ERROR

  if (loading) {
    return (
      <>
        <RestaurantSidebar />

        <div className="restaurant-content-area">
          <div className="dashboard-loading">
            <h2>Loading Dashboard...</h2>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <RestaurantSidebar />

        <div className="restaurant-content-area">
          <div className="dashboard-loading">
            <h2>Dashboard Error</h2>
            <p>{error}</p>

            <button
              onClick={() => getDashboardData()}
              className="login-again-button"
            >
              Try Again
            </button>

            <button
              onClick={handleLogout}
              className="login-again-button"
            >
              Go to Login
            </button>
          </div>
        </div>
      </>
    );
  }

  // MAIN DASHBOARD

  return (
    <>
      <RestaurantSidebar />

      <div className="restaurant-content-area">
        <div className="dashboard" style={dashboardStyle}>
          <main className="main-content">

            {/* HEADER */}

            <header className="dashboard-header">
              <div>
                <h1>Dashboard</h1>
                <p>Welcome back, {restaurantName} 👋</p>
              </div>

              <div className="profile-dropdown-container">
                <button
                  type="button"
                  className="restaurant-profile profile-trigger"
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  aria-expanded={profileMenuOpen}
                >
                  {logo ? (
                    <img
                      src={logo}
                      alt="Restaurant Logo"
                      className="profile-logo"
                    />
                  ) : (
                    <span className="profile-logo-placeholder">🍽️</span>
                  )}

                  <span>{restaurantName}</span>
                  <span className="profile-chevron">⌄</span>
                </button>

                {profileMenuOpen && (
                  <div className="profile-dropdown">
                    <div className="profile-dropdown-heading">
                      <strong>{restaurantName}</strong>
                      <span>{email}</span>
                    </div>

                    <button onClick={openEditProfile}>
                      <span>✏️</span> Edit Profile
                    </button>

                    <button onClick={openEditProfile}>
                      <span>🎨</span> Change Dashboard Theme
                    </button>

                    <button onClick={handleLogout}>
                      <span>🚪</span> Logout
                    </button>

                    <div className="profile-dropdown-divider" />

                    <button
                      className="delete-profile-option"
                      onClick={handleDeleteAccount}
                      disabled={deleting}
                    >
                      <span>🗑️</span>
                      {deleting
                        ? "Deleting..."
                        : "Delete Restaurant Account"}
                    </button>
                  </div>
                )}
              </div>
            </header>

            {/* RESTAURANT INFORMATION */}

            <section className="dashboard-card restaurant-info">
              <h2>Restaurant Information</h2>

              <div className="restaurant-details">
                <div>
                  <strong>Restaurant Name</strong>
                  <p>{restaurantName || "Not available"}</p>
                </div>

                <div>
                  <strong>Owner</strong>
                  <p>{ownerName || "Not available"}</p>
                </div>

                <div>
                  <strong>Email</strong>
                  <p>{email || "Not available"}</p>
                </div>

                <div>
                  <strong>Phone</strong>
                  <p>{phone || "Not available"}</p>
                </div>

                <div>
                  <strong>Address</strong>
                  <p>{address || "Not available"}</p>
                </div>
              </div>
            </section>

            {/* STATISTICS */}

            <section className="stats">
              <div className="stat-card">
                <div className="stat-icon">📦</div>
                <div>
                  <p>Today's Orders</p>
                  <h2>{todayOrders}</h2>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">⏳</div>
                <div>
                  <p>Pending Orders</p>
                  <h2>{pendingOrders}</h2>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">✅</div>
                <div>
                  <p>Completed Orders</p>
                  <h2>{completedOrders}</h2>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">₹</div>
                <div>
                  <p>Today's Revenue</p>
                  <h2>{formatCurrency(todayRevenue)}</h2>
                </div>
              </div>
            </section>

            {/* DASHBOARD CONTENT */}

            <section className="dashboard-grid">

              {/* RECENT ORDERS */}

              <div className="dashboard-card">
                <div className="card-header">
                  <h2>Recent Orders</h2>

                  <button
                    onClick={() => navigate("/restaurant/orders")}
                  >
                    View All
                  </button>
                </div>

                <div className="orders">
                  {recentOrders.length === 0 ? (
                    <div className="order">
                      <div>
                        <strong>No orders yet</strong>
                        <p>Orders will appear here.</p>
                      </div>
                    </div>
                  ) : (
                    recentOrders.slice(0, 5).map((order) => (
                      <div className="order" key={order._id}>
                        <div className="recent-order-details">
                          <strong>
                            {order.order_number || "Order"}
                          </strong>

                          <p>
                            Customer: {order.customer_name || "Customer"}
                          </p>

                          <p>
                            {(order.items || [])
                              .map(
                                (item) =>
                                  `${item.name} × ${item.quantity}`
                              )
                              .join(", ")}
                          </p>

                          <p>{formatDate(order.created_at)}</p>

                          <p>
                            Payment: {order.payment_status || "Pending"}
                          </p>
                        </div>

                        <div className="recent-order-right">
                          <strong>
                            {formatCurrency(
                              order.restaurant_total ?? order.total_price
                            )}
                          </strong>

                          <span
                            className={`order-status status-${getStatusClass(
                              order.order_status
                            )}`}
                          >
                            {order.order_status || "Placed"}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {refreshing && (
                  <p className="dashboard-refresh-message">
                    Updating dashboard...
                  </p>
                )}
              </div>

              {/* POPULAR FOOD */}

              <div className="dashboard-card">
                <div className="card-header">
                  <h2>Popular Food</h2>

                  <button
                    onClick={() => navigate("/restaurant/menu")}
                  >
                    View Menu
                  </button>
                </div>

                <div className="food-list">
                  {popularFood.length === 0 ? (
                    <div className="food-item">
                      <span>🍽️</span>

                      <div>
                        <strong>No food items yet</strong>
                        <p>
                          Add food items to your menu or receive orders.
                        </p>
                      </div>
                    </div>
                  ) : (
                    popularFood.map((food) => (
                      <div className="food-item" key={food.name}>
                        <span>🍽️</span>

                        <div>
                          <strong>{food.name}</strong>
                          <p>Ordered: {food.quantity} times</p>
                          <p>Sales: {formatCurrency(food.revenue)}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>

            {/* QUICK ACTIONS */}

            <section className="quick-section">
              <h2>Quick Actions</h2>

              <div className="quick-actions">
                <button
                  onClick={() => navigate("/restaurant/menu")}
                >
                  ➕ <span>Add Food</span>
                </button>

                <button
                  onClick={() => navigate("/restaurant/orders")}
                >
                  📦 <span>View Orders</span>
                </button>

                <button
                  onClick={() => navigate("/restaurant/kitchen")}
                >
                  👨‍🍳 <span>Kitchen</span>
                </button>

                <button
                  onClick={() => navigate("/restaurant/tables")}
                >
                  🪑 <span>Manage Tables</span>
                </button>
              </div>
            </section>
          </main>

          {/* EDIT PROFILE MODAL */}

          {editModalOpen && (
            <div
              className="profile-modal-overlay"
              onClick={() => setEditModalOpen(false)}
            >
              <div
                className="profile-modal"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="profile-modal-header">
                  <div>
                    <h2>Edit Restaurant Profile</h2>
                    <p>
                      Update your restaurant details and appearance.
                    </p>
                  </div>

                  <button
                    type="button"
                    className="profile-modal-close"
                    onClick={() => setEditModalOpen(false)}
                  >
                    ×
                  </button>
                </div>

                <form onSubmit={handleSaveProfile}>
                  <div className="profile-form-grid">
                    <div className="profile-form-group">
                      <label>Restaurant Name</label>

                      <input
                        value={editRestaurantName}
                        onChange={(e) =>
                          setEditRestaurantName(e.target.value)
                        }
                        required
                      />
                    </div>

                    <div className="profile-form-group">
                      <label>Owner Name</label>

                      <input
                        value={editOwnerName}
                        onChange={(e) =>
                          setEditOwnerName(e.target.value)
                        }
                        required
                      />
                    </div>

                    <div className="profile-form-group">
                      <label>Email Address</label>

                      <input
                        type="email"
                        value={editEmail}
                        onChange={(e) =>
                          setEditEmail(e.target.value)
                        }
                        required
                      />
                    </div>

                    <div className="profile-form-group">
                      <label>Phone Number</label>

                      <input
                        value={editPhone}
                        onChange={(e) =>
                          setEditPhone(e.target.value)
                        }
                        required
                      />
                    </div>

                    <div className="profile-form-group profile-form-full">
                      <label>Restaurant Address</label>

                      <textarea
                        value={editAddress}
                        onChange={(e) =>
                          setEditAddress(e.target.value)
                        }
                        rows={3}
                        required
                      />
                    </div>

                    <div className="profile-form-group profile-form-full">
                      <label>Restaurant Logo</label>

                      <div className="edit-logo-row">
                        {editLogo ? (
                          <img src={editLogo} alt="Logo preview" />
                        ) : (
                          <span className="edit-logo-placeholder">
                            🍽️
                          </span>
                        )}

                        <div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleEditLogo}
                          />

                          <small>
                            Image file, maximum size 2MB.
                          </small>
                        </div>

                        {editLogo && (
                          <button
                            type="button"
                            className="remove-edit-logo"
                            onClick={() => setEditLogo("")}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="profile-form-group profile-form-full">
                      <label>Dashboard Theme</label>

                      <select
                        value={selectedTheme}
                        onChange={(e) =>
                          setSelectedTheme(
                            e.target.value as ThemeName
                          )
                        }
                      >
                        <option value="terracotta">Terracotta</option>
                        <option value="ocean">Ocean Blue</option>
                        <option value="forest">Forest Green</option>
                        <option value="royal">Royal Purple</option>
                        <option value="rose">Rose Pink</option>
                        <option value="dark">Dark Theme</option>
                      </select>
                    </div>
                  </div>

                  <div className="profile-modal-actions">
                    <button
                      type="button"
                      className="profile-cancel-button"
                      onClick={() => setEditModalOpen(false)}
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      className="profile-save-button"
                      disabled={saving}
                    >
                      {saving ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default RestaurantDashboard;
