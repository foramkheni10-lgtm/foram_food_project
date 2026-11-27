import {
  LayoutDashboard,
  ShoppingBag,
  Store,
  Utensils,
  Table,
  MessageSquare,
  Brain,
  LogOut,
} from "lucide-react";

import { NavLink, useNavigate } from "react-router-dom";
import "../../styles/restaurant/RestaurantSidebar.css";

const menuItems = [
  {
    label: "Dashboard",
    path: "/restaurant/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Menu Management",
    path: "/restaurant/menu",
    icon: Utensils,
  },
  {
    label: "Orders",
    path: "/restaurant/orders",
    icon: ShoppingBag,
  },
  {
    label: "Table Monitoring",
    path: "/restaurant/tables",
    icon: Table,
  },
  {
    label: "Customer Feedback",
    path: "/restaurant/feedback",
    icon: MessageSquare,
  },
  {
    label: "AI Insights",
    path: "/restaurant/ai-analytics",
    icon: Brain,
  },
];

function RestaurantSidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("restaurantId");
    localStorage.removeItem("restaurantName");
    localStorage.removeItem("restaurantEmail");

    navigate("/login", { replace: true });
  };

  return (
    <aside className="restaurant-sidebar">

      {/* SIDEBAR HEADER */}

      <div className="restaurant-sidebar-header">
        <div className="restaurant-sidebar-brand">
          <img
            src="/images/logo.png"
            alt="Smart FoodCourt"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />

          <div>
            <h2>Smart FoodCourt</h2>
            <span>RESTAURANT PANEL</span>
          </div>
        </div>
      </div>

      {/* RESTAURANT PROFILE */}

      
      {/* NAVIGATION */}

      <nav className="restaurant-sidebar-nav">
        <p className="restaurant-sidebar-section-title">
          MAIN MENU
        </p>

        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/restaurant/dashboard"}
              className={({ isActive }) =>
                `restaurant-sidebar-link ${
                  isActive ? "active" : ""
                }`
              }
            >
              <Icon size={19} strokeWidth={1.9} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* SIDEBAR FOOTER */}

      <div className="restaurant-sidebar-footer">
        <div className="restaurant-sidebar-footer-info">
          <Store size={17} />
          <span>Restaurant Management</span>
        </div>

        <button
          className="restaurant-sidebar-logout"
          onClick={handleLogout}
        >
          <LogOut size={19} />
          <span>Logout</span>
        </button>

        <p>Smart FoodCourt © 2026</p>
      </div>

    </aside>
  );
}

export default RestaurantSidebar;
