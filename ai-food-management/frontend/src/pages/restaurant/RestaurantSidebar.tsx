
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  LayoutDashboard,
  UtensilsCrossed,
  ShoppingBag,
  Table2,
  MessageSquare,
  ChartNoAxesCombined,
  LogOut,
  ChevronRight,
  Store,
} from "lucide-react";

import "../../styles/restaurant/RestaurantSidebar.css";

const navigationItems = [
  {
    label: "Dashboard",
    path: "/restaurant/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Menu Management",
    path: "/restaurant/menu",
    icon: UtensilsCrossed,
  },
  {
    label: "Orders",
    path: "/restaurant/orders",
    icon: ShoppingBag,
  },
  {
    label: "Tables",
    path: "/restaurant/tables",
    icon: Table2,
  },
  {
    label: "Customer Feedback",
    path: "/restaurant/feedback",
    icon: MessageSquare,
  },
  {
    label: "AI Analytics",
    path: "/restaurant/ai-analytics",
    icon: ChartNoAxesCombined,
  },
];

function RestaurantSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const restaurantName =
    localStorage.getItem("restaurantName") || "My Restaurant";

  const closeSidebar = () => setIsOpen(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("restaurantId");
    localStorage.removeItem("restaurantName");
    localStorage.removeItem("restaurantEmail");
    localStorage.removeItem("restaurant_token");
    localStorage.removeItem("restaurantToken");

    navigate("/login", { replace: true });
  };

  return (
    <>
      {/* TOP HEADER */}

      <header className="restaurant-topbar">
        <div className="restaurant-topbar-brand">
          <div className="restaurant-brand-logo">
            <span>S</span>
          </div>

          <div className="restaurant-brand-name">
            <span>Smart</span> FoodCourt
          </div>
        </div>

        <button
          className="restaurant-menu-toggle"
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
          aria-expanded={isOpen}
        >
          {isOpen ? <X size={29} /> : <Menu size={31} />}
        </button>
      </header>

      {/* OVERLAY */}

      <div
        className={`restaurant-sidebar-overlay ${
          isOpen ? "show" : ""
        }`}
        onClick={closeSidebar}
      />

      {/* SLIDE OUT SIDEBAR */}

      <aside
        className={`restaurant-sidebar ${
          isOpen ? "open" : ""
        }`}
      >
        <div className="restaurant-sidebar-heading">
          <div>
            <span className="restaurant-sidebar-eyebrow">
              RESTAURANT WORKSPACE
            </span>
            <h2>Navigation</h2>
          </div>

          <button
            type="button"
            className="restaurant-sidebar-close"
            onClick={closeSidebar}
            aria-label="Close sidebar"
          >
            <X size={21} />
          </button>
        </div>

        {/* RESTAURANT PROFILE */}

        <div className="restaurant-sidebar-profile">
          <div className="restaurant-profile-icon">
            <Store size={23} />
          </div>

          <div className="restaurant-profile-details">
            <strong>{restaurantName}</strong>
            <span>Restaurant Account</span>
          </div>
        </div>

        {/* NAVIGATION */}

        <div className="restaurant-sidebar-section-label">
          MAIN MENU
        </div>

        <nav className="restaurant-sidebar-nav">
          {navigationItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/restaurant/dashboard"}
                onClick={closeSidebar}
                className={({ isActive }) =>
                  `restaurant-sidebar-link ${
                    isActive ? "active" : ""
                  }`
                }
              >
                <Icon size={20} />

                <span>{item.label}</span>

                <ChevronRight
                  className="restaurant-nav-arrow"
                  size={17}
                />
              </NavLink>
            );
          })}
        </nav>

        {/* HELP CARD */}

        <div className="restaurant-sidebar-help">
          <div className="restaurant-help-icon">?</div>

          <div>
            <strong>Need Help?</strong>
            <p>Manage your restaurant with Smart FoodCourt.</p>
          </div>
        </div>

        {/* LOGOUT */}

        <button
          type="button"
          className="restaurant-sidebar-logout"
          onClick={handleLogout}
        >
          <LogOut size={19} />
          <span>Logout</span>
        </button>

        <div className="restaurant-sidebar-footer">
          Smart FoodCourt
          <span>Eat Smart • Live Better.</span>
        </div>
      </aside>
    </>
  );
}

export default RestaurantSidebar;
