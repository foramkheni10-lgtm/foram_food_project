
import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

import "../../styles/restaurant/auth.css";

function RestaurantLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email.trim() || !password) {
      alert("Please enter email and password");
      return;
    }

    try {
      setLoading(true);

      const normalizedEmail = email.trim().toLowerCase();

      const response = await axios.post(
        "http://127.0.0.1:8000/api/restaurants/login",
        {
          email: normalizedEmail,
          password,
        }
      );

      const data = response.data;

      console.log("Restaurant login response:", data);

      // Validate backend response
      if (!data.access_token || !data.restaurant_id) {
        console.error("Missing login fields:", data);

        alert(
          "Login response is missing restaurant ID or access token. Please check the backend login API."
        );
        return;
      }

      // Store authentication details
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("restaurantId", String(data.restaurant_id));
      localStorage.setItem(
        "restaurantName",
        data.restaurantName || "Restaurant"
      );
      localStorage.setItem("restaurantEmail", normalizedEmail);

      alert("Login successful!");

      navigate("/restaurant/dashboard", { replace: true });

    } catch (error: unknown) {
      console.error("Restaurant login error:", error);

      if (axios.isAxiosError(error)) {
        alert(
          error.response?.data?.detail ||
          error.response?.data?.message ||
          "Invalid email or password"
        );
      } else {
        alert("Something went wrong during login.");
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card login-card">

        <div className="auth-header">
          <h1>Restaurant Login</h1>
          <p>Login to manage your restaurant</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account?{" "}
            <Link to="/restaurant/register">
              Register Restaurant
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}

export default RestaurantLogin;
