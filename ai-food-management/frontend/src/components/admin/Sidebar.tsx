
import {
  LayoutDashboard,
  ShoppingBag,
  Store,
  Utensils,
  Truck,
  Package,
  CookingPot,
  MessageSquare,
  BarChart3,
  Brain,
  Settings,
  LogOut,
  X,
  Users,
  ClipboardList,
} from "lucide-react";

import { NavLink, useNavigate } from "react-router-dom";
import "./Sidebar.css";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  { label: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Orders", path: "/admin/orders", icon: ShoppingBag },
  { label: "Restaurants", path: "/admin/restaurants", icon: Store },
  { label: "Foods", path: "/admin/foods", icon: Utensils },
  { label: "Kitchen", path: "/admin/kitchen", icon: CookingPot },
  { label: "Deliveries", path: "/admin/deliveries", icon: Truck },
  { label: "Inventory", path: "/admin/inventory", icon: Package },
  { label: "Ingredients", path: "/admin/ingredients", icon: Package },
  { label: "Suppliers", path: "/admin/suppliers", icon: Users },
  {
    label: "Purchase Orders",
    path: "/admin/purchase-orders",
    icon: ClipboardList,
  },
  { label: "Feedback", path: "/admin/feedback", icon: MessageSquare },
  { label: "Analytics", path: "/admin/analytics", icon: BarChart3 },
  { label: "AI Analysis", path: "/admin/ai-analysis", icon: Brain },
  { label: "Settings", path: "/admin/settings", icon: Settings },
];

function Sidebar({ isOpen, onClose }: SidebarProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("smartfoodcourt_token");
    localStorage.removeItem("smartfoodcourt_user");
    navigate("/login");
  };

  return (
    <>
      {isOpen && (
        <div className="sidebar-overlay" onClick={onClose} />
      )}

      <aside className={`sidebar ${isOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <img src="/images/logo.png" alt="Smart FoodCourt" />
            <div>
              <h2>Smart FoodCourt</h2>
              <span>Admin Panel</span>
            </div>
          </div>

          <button
            className="sidebar-close"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X size={21} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <p className="sidebar-section-title">MAIN MENU</p>

          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/admin/dashboard"}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? "active" : ""}`
                }
                onClick={onClose}
              >
                <Icon size={19} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-logout" onClick={handleLogout}>
            <LogOut size={19} />
            <span>Logout</span>
          </button>

          <p>Smart FoodCourt © 2026</p>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
