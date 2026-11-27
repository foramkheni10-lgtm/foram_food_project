
import { useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";
import "./Layout.css";
import "../../styles/admin.css";

function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleMenuClick = () => {
    setIsSidebarOpen((previous) => !previous);
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="admin-layout">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={handleCloseSidebar}
      />

      <div className="admin-main">
        <Header onMenuClick={handleMenuClick} />

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;
