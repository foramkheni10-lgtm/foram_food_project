
import { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import "./Home.css";
import AIFoodAssistant from "./AIFoodAssistant";


interface Customer {
  name?: string;
  email?: string;
  phone?: string;
  profile_image?: string;
}

function CustomerLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [headerScrolled, setHeaderScrolled] = useState(false);

  const [customer, setCustomer] = useState<Customer | null>(() => {
    try {
      const savedUser = localStorage.getItem("smartfoodcourt_user");
      const token = localStorage.getItem("smartfoodcourt_token");

      return savedUser && token
        ? (JSON.parse(savedUser) as Customer)
        : null;
    } catch {
      return null;
    }
  });

  // Update customer login status
  useEffect(() => {
    const updateCustomer = () => {
      try {
        const savedUser = localStorage.getItem("smartfoodcourt_user");
        const token = localStorage.getItem("smartfoodcourt_token");

        setCustomer(
          savedUser && token
            ? (JSON.parse(savedUser) as Customer)
            : null
        );
      } catch {
        setCustomer(null);
      }
    };

    updateCustomer();
    setMobileMenuOpen(false);

    window.addEventListener("storage", updateCustomer);

    return () => {
      window.removeEventListener("storage", updateCustomer);
    };
  }, [location.pathname]);

  // Header scroll effect
  useEffect(() => {
    const updateHeader = () => {
      setHeaderScrolled(window.scrollY > 30);
    };

    updateHeader();

    window.addEventListener("scroll", updateHeader, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", updateHeader);
    };
  }, []);

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("smartfoodcourt_user");
    localStorage.removeItem("smartfoodcourt_token");

    setCustomer(null);
    setMobileMenuOpen(false);

    navigate("/");
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <div className="customer-layout">

      {/* HEADER */}
      <div
        className={`sf-sticky-shell${
          headerScrolled ? " is-scrolled scrolled" : ""
        }`}
      >
        <header
          className={`sf-header${
            mobileMenuOpen ? " mobile-menu-open" : ""
          }`}
        >

          {/* BRAND LOGO */}
          <Link to="/" className="sf-brand" onClick={closeMobileMenu}>
            <img
              src="/images/logo.png"
              alt="Smart FoodCourt Logo"
              className="sf-logo-image"
            />

            <span className="sf-brand-name">
              Smart <span>FoodCourt</span>
            </span>
          </Link>

          {/* MOBILE MENU BUTTON */}
          <button
            type="button"
            className="sf-mobile-menu-toggle"
            aria-label={
              mobileMenuOpen
                ? "Close navigation menu"
                : "Open navigation menu"
            }
            aria-expanded={mobileMenuOpen}
            aria-controls="sf-main-navigation"
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            {mobileMenuOpen ? (
              <X size={27} />
            ) : (
              <Menu size={27} />
            )}
          </button>

          {/* NAVIGATION */}
          <nav
            id="sf-main-navigation"
            className="sf-navbar"
            aria-label="Main navigation"
          >
            <Link to="/" onClick={closeMobileMenu}>
              Home
            </Link>

            <Link to="/restaurants" onClick={closeMobileMenu}>
              Restaurants
            </Link>

            <Link to="/menu" onClick={closeMobileMenu}>
              Menu
            </Link>
            <Link to="/best-sellers" onClick={closeMobileMenu}>
  Best Sellers
</Link>

            {/* SHOW ONLY AFTER LOGIN */}
            {customer && (
              <>
                <Link to="/cart" onClick={closeMobileMenu}>
                  Cart
                </Link>

                <Link to="/my-orders" onClick={closeMobileMenu}>
                  My Orders
                </Link>
              </>
            )}
          </nav>

          {/* AI ASSISTANT */}
          <div className="sf-header-actions">
            <AIFoodAssistant />
          </div>

          {/* AUTH BUTTONS */}
          <div className="sf-auth-actions">
  {customer ? (
    <>
      <button
        type="button"
        className="sf-login-button"
        onClick={handleLogout}
      >
        Logout
      </button>

      <Link
        to="/profile"
        className="sf-header-profile"
        onClick={closeMobileMenu}
        title="My Profile"
      >
        <img
          src={
            customer.profile_image
              ? `http://127.0.0.1:8000${customer.profile_image}`
              : "/default-profile.png"
          }
          alt="Profile"
          onError={(e) => {
            e.currentTarget.src = "/default-profile.png";
          }}
        />
      </Link>
    </>
  ) : (
    <>
      <Link
        to="/login"
        className="sf-login-button"
        onClick={closeMobileMenu}
      >
        Login
      </Link>

      <Link
        to="/register"
        className="sf-register-button"
        onClick={closeMobileMenu}
      >
        Sign Up
      </Link>
    </>
  )}
</div>

          {/* MOBILE LOGOUT */}
          {customer && mobileMenuOpen && (
            <button
              type="button"
              className="sf-mobile-logout"
              onClick={handleLogout}
            >
              Logout
            </button>
          )}

        </header>
      </div>

      {/* PAGE CONTENT */}
      <main className="customer-page-content">
        <Outlet />
      </main>

      {/* FOOTER */}
    
<footer className="sf-footer">
  <div className="sf-footer-main">

    {/* FOOTER BRAND */}
    <div className="sf-footer-brand">
      <div className="sf-footer-logo">
        <img
          src="/images/logo.png"
          alt="Smart FoodCourt"
          className="sf-footer-logo-image"
        />
      </div>

      <p>
        Smart FoodCourt is your destination for delicious food,
        discovering restaurants and enjoying a smarter food
        ordering experience.
      </p>

      {/* SOCIAL ICONS - DISPLAY ONLY */}
      <div className="sf-footer-socials">
  <div className="sf-social-links">

    {/* Instagram */}
    <span aria-label="Instagram">
      <svg viewBox="0 0 24 24">
        <rect x="3" y="3" width="18" height="18" rx="5"
          fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="12" cy="12" r="4"
          fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="18" cy="6" r="1.2" fill="currentColor" />
      </svg>
    </span>

    {/* Facebook */}
    <span aria-label="Facebook">
      <svg viewBox="0 0 24 24">
        <path
          d="M14 21v-8h3l.5-4H14V7c0-1.2.4-2 2-2h2V1.5C17.3 1.3 16.3 1 15 1c-3.2 0-5 1.9-5 5v3H7v4h3v8z"
          fill="currentColor"
        />
      </svg>
    </span>

    {/* LinkedIn */}
    <span aria-label="LinkedIn">
      <svg viewBox="0 0 24 24">
        <path
          d="M5 3a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM3 9h4v12H3zm7 0h4v1.7c.6-1.1 1.8-2 3.5-2 3.5 0 4.5 2.2 4.5 5.2V21h-4v-6.3c0-1.5-.3-2.7-1.9-2.7s-2.1 1.3-2.1 2.7V21h-4z"
          fill="currentColor"
        />
      </svg>
    </span>

  </div>
</div>
    </div>

    {/* QUICK LINKS */}
    <div className="sf-footer-column">
      <h3>Quick Links</h3>
      <Link to="/">Home</Link>
      <Link to="/about">About Us</Link>
      <Link to="/contact">Contact Us</Link>
    </div>

    {/* LEGAL */}
  <div className="sf-footer-column">
  <h3>Legal</h3>

  <Link to="/privacy-policy">
    Privacy Policy
  </Link>

  <Link to="/terms-and-conditions">
    Terms & Conditions
  </Link>
</div>

    {/* SUPPORT */}
    <div className="sf-footer-column">
      <h3>Support</h3>
      <Link to="/feedback">Feedback</Link>
      <Link to="/faqs">FAQs</Link>
      <Link to="/help">Help & Support</Link>
    </div>

  </div>

  {/* FOOTER BOTTOM */}
  <div className="sf-footer-bottom">

    <p>
      Designed & Developed by{" "}
      <strong>Smart FoodCourt Team</strong>
    </p>

    <p>
      © {new Date().getFullYear()} <strong>Smart FoodCourt Team</strong>.
      All Rights Reserved.
    </p>

    

  </div>
</footer>


    </div>
  );
}

export default CustomerLayout;
