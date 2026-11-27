
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Login.css";

const API = "http://127.0.0.1:8000";

function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();

  const [email, setEmail] = useState(location.state?.email || "");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!/^\d{6}$/.test(otp)) {
      setError("Enter a valid 6-digit OTP.");
      return;
    }

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (new TextEncoder().encode(password).length > 72) {
      setError("Password is too long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      await axios.post(`${API}/customer/reset-password`, {
        email: email.trim().toLowerCase(),
        otp,
        new_password: password,
        confirm_password: confirmPassword,
      });

      navigate("/login", {
        state: {
          message: "Password changed successfully. Please login again.",
        },
      });
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.detail || "Password reset failed.");
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
              <h2>Reset Password</h2>
              <p>Enter your OTP and create your new password.</p>
            </div>

            {error && <p className="auth-error">{error}</p>}

            <form onSubmit={handleReset} noValidate>
              <label htmlFor="reset-email">Email Address</label>
              <input
                id="reset-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your registered email"
                required
              />

              <label htmlFor="reset-otp">6-Digit OTP</label>
              <input
                id="reset-otp"
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="Enter OTP"
                required
              />

              <label htmlFor="new-password">New Password</label>
              <input
                id="new-password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                required
              />

              <label htmlFor="confirm-new-password">
                Confirm New Password
              </label>
              <input
                id="confirm-new-password"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                required
              />

              <button type="submit" disabled={loading}>
                {loading ? "Updating Password..." : "Reset Password"}
              </button>
            </form>

            <p className="auth-switch">
              <Link to="/login">Back to Login</Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

export default ResetPassword;
