
import { Routes, Route, Navigate } from "react-router-dom";

// Customer Layout
import CustomerLayout from "./pages/customer/CustomerLayout";

// Customer Pages
import Home from "./pages/customer/Home";
import Login from "./pages/customer/Login";
import Register from "./pages/customer/Register";
import Profile from "./pages/customer/Profile";
import Menu from "./pages/customer/Menu";
import Restaurants from "./pages/customer/Restaurants";
import Cart from "./pages/customer/Cart";
import Checkout from "./pages/customer/Checkout";
import MyOrders from "./pages/customer/MyOrders";
import CustomerFeedback from "./pages/customer/Feedback";
import TermsAndConditions from "./pages/customer/TermsAndConditions";
import PrivacyPolicy from "./pages/customer/PrivacyPolicy";
import BestSellers from "./pages/customer/BestSellers";

// Customer Authentication
import VerifyEmail from "./pages/customer/VerifyEmail";
import ForgotPassword from "./pages/customer/ForgotPassword";
import ResetPassword from "./pages/customer/ResetPassword";

// Admin Pages
import Suppliers from "./pages/admin/Suppliers";
import PurchaseOrders from "./pages/admin/PurchaseOrders";
import Dashboard from "./pages/admin/Dashboard";
import Orders from "./pages/admin/Orders";
import AdminRestaurants from "./pages/admin/Restaurants";
import Foods from "./pages/admin/Foods";
import Deliveries from "./pages/admin/Deliveries";
import Inventory from "./pages/admin/Inventory";
import Ingredients from "./pages/admin/Ingredients";
import Kitchen from "./pages/admin/Kitchen";
import AdminFeedback from "./pages/admin/Feedback";
import Analytics from "./pages/admin/Analytics";
import AIAnalysis from "./pages/admin/AIAnalysis";
import Settings from "./pages/admin/Settings";
import AdminLayout from "./components/admin/Layout";

// Common Components
import ScrollToTop from "./components/ScrollToTop";

// Restaurant Pages
import RestaurantRegister from "./pages/restaurant/RestaurantRegister";
import RestaurantDashboard from "./pages/restaurant/RestaurantDashboard";
import RestaurantMenu from "./pages/restaurant/RestaurantMenu";
import RestaurantOrders from "./pages/restaurant/RestaurantOrders";
import RestaurantTables from "./pages/restaurant/RestaurantTables";
import AIAnalytics from "./pages/restaurant/AIAnalytics";
import RestaurantFeedback from "./pages/restaurant/Feedback";
import RestaurantVerifyEmail from "./pages/restaurant/RestaurantVerifyEmail";

// Restaurant Theme
import { RestaurantThemeProvider } from "./theme/RestaurantThemeContext";

function App() {
  return (
    <>
      <ScrollToTop />

      <Routes>
        {/* ================= RESTAURANT EMAIL VERIFICATION ================= */}

        <Route
          path="/restaurant/verify-email"
          element={<RestaurantVerifyEmail />}
        />

        {/* ================= CUSTOMER ROUTES ================= */}

        <Route element={<CustomerLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/restaurants" element={<Restaurants />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/my-orders" element={<MyOrders />} />

          <Route
            path="/feedback"
            element={<CustomerFeedback />}
          />

          <Route path="/best-sellers" element={<BestSellers />} />

          <Route
            path="/terms-and-conditions"
            element={<TermsAndConditions />}
          />

          <Route
            path="/privacy-policy"
            element={<PrivacyPolicy />}
          />

          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Route>

        {/* ================= ADMIN ROUTES ================= */}

        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="orders" element={<Orders />} />
          <Route path="restaurants" element={<AdminRestaurants />} />
          <Route path="foods" element={<Foods />} />
          <Route path="deliveries" element={<Deliveries />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="ingredients" element={<Ingredients />} />
          <Route path="kitchen" element={<Kitchen />} />
          <Route path="feedback" element={<AdminFeedback />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="ai-analysis" element={<AIAnalysis />} />
          <Route path="settings" element={<Settings />} />
          <Route path="suppliers" element={<Suppliers />} />
          <Route path="purchase-orders" element={<PurchaseOrders />} />
        </Route>

        {/* ================= RESTAURANT ROUTES ================= */}

        <Route
          path="/restaurant/*"
          element={
            <RestaurantThemeProvider>
              <Routes>
                <Route
                  path="login"
                  element={<Navigate to="/login" replace />}
                />

                <Route
                  path="register"
                  element={<RestaurantRegister />}
                />

                <Route
                  path="dashboard"
                  element={<RestaurantDashboard />}
                />

                <Route
                  path="menu"
                  element={<RestaurantMenu />}
                />

                <Route
                  path="orders"
                  element={<RestaurantOrders />}
                />

                <Route
                  path="tables"
                  element={<RestaurantTables />}
                />

                <Route
                  path="ai-analytics"
                  element={<AIAnalytics />}
                />

                <Route
                  path="feedback"
                  element={<RestaurantFeedback />}
                />
              </Routes>
            </RestaurantThemeProvider>
          }
        />
      </Routes>
    </>
  );
}

export default App;
