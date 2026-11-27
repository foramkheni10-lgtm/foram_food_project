
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Login.css";

const API = "http://127.0.0.1:8000";

function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Enter a valid email address.");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        `${API}/customer/forgot-password`,
        { email: email.trim().toLowerCase() }
      );

      setMessage(response.data.message);

      navigate("/reset-password", {
        state: {
          email: email.trim().toLowerCase(),
        },
      });
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.detail || "Unable to send OTP.");
      } else {
        setError("Unable to connect to server.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-layout">
        <section className="auth-form-panel">
          <div className="auth-card">
            <div className="auth-heading">
              <span className="auth-eyebrow">SMART FOODCOURT</span>
              <h2>Forgot Password?</h2>
              <p>Enter your registered email to receive a password reset OTP.</p>
            </div>

            {message && <p className="auth-success">{message}</p>}
            {error && <p className="auth-error">{error}</p>}

            <form onSubmit={handleSubmit} noValidate>
              <label htmlFor="forgot-email">Email Address</label>
              <input
                id="forgot-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your registered email"
                required
              />

              <button type="submit" disabled={loading}>
                {loading ? "Sending OTP..." : "Send Reset OTP"}
              </button>
            </form>

            <p className="auth-switch">
              Remember your password? <Link to="/login">Login</Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

export default ForgotPassword;
