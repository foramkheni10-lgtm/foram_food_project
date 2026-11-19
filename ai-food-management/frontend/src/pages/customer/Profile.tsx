import { Link, Navigate } from "react-router-dom";
import "./Profile.css";

interface Customer {
  name?: string;
  email?: string;
  phone?: string;
}

function Profile() {
  const savedUser = localStorage.getItem("smartfoodcourt_user");

  if (!savedUser) {
    return <Navigate to="/login" replace />;
  }

  let customer: Customer;

  try {
    customer = JSON.parse(savedUser);
  } catch {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="profile-page">
      <div className="profile-card">
        <div className="profile-avatar">
          {customer.name?.charAt(0).toUpperCase() || "U"}
        </div>

        <h1>My Profile</h1>
        <p className="profile-subtitle">
          Manage your personal information
        </p>

        <div className="profile-details">
          <div className="profile-detail">
            <span>Full Name</span>
            <strong>{customer.name || "Not available"}</strong>
          </div>

          <div className="profile-detail">
            <span>Email Address</span>
            <strong>{customer.email || "Not available"}</strong>
          </div>

          <div className="profile-detail">
            <span>Phone Number</span>
            <strong>{customer.phone || "Not available"}</strong>
          </div>
        </div>

        <Link to="/" className="profile-home-button">
          Back to Home
        </Link>
      </div>
    </div>
  );
}

export default Profile;