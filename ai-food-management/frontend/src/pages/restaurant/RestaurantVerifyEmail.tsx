
import React, { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "../../styles/restaurant/auth.css";

const API_URL = "http://127.0.0.1:8000";

const RestaurantVerifyEmail: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [email, setEmail] = useState(
    location.state?.email || ""
  );
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState(
    location.state?.message || ""
  );
  const [error, setError] = useState("");

  const verifyEmail = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Enter a valid email address.");
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      setError("Enter the 6-digit verification code.");
      return;
    }

    setLoading(true);

    try {
      await axios.post(`${API_URL}/api/restaurants/verify-email`, {
        email: email.trim().toLowerCase(),
        otp,
      });

      setMessage("Email verified successfully. You can now log in.");
      navigate("/login", {
        replace: true,
        state: {
          accountType: "restaurant",
          message: "Restaurant email verified. Please log in.",
        },
      });
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
        "Verification failed. Check your code and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const resendCode = async () => {
    setError("");
    setMessage("");

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Enter a valid email address.");
      return;
    }

    setResending(true);

    try {
      const response = await axios.post(
        `${API_URL}/api/restaurants/resend-verification`,
        { email: email.trim().toLowerCase() }
      );

      setMessage(
        response.data?.message || "A new verification code has been sent."
      );
      setOtp("");
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
        "Unable to resend the verification code. Please try again later."
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Verify Restaurant Email</h1>

        <p className="auth-subtitle">
          Enter the 6-digit code sent to your email address.
        </p>

        {message && (
          <div className="auth-success" role="status">
            {message}
          </div>
        )}

        {error && (
          <div className="auth-error" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={verifyEmail} noValidate>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter registered email"
              required
            />
          </div>

          <div className="form-group">
            <label>Verification Code</label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) =>
                setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              required
            />
          </div>

          <button
            type="submit"
            className="auth-button"
            disabled={loading || otp.length !== 6}
          >
            {loading ? "Verifying..." : "Verify Email"}
          </button>
        </form>

        <button
          type="button"
          className="auth-secondary-button"
          onClick={resendCode}
          disabled={resending || loading}
        >
          {resending ? "Sending..." : "Resend Verification Code"}
        </button>

        <p className="auth-footer">
          <Link to="/login">Back to Login</Link>
        </p>
      </div>
    </div>
  );
};

export default RestaurantVerifyEmail;
