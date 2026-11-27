
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Login.css";

const API = "http://127.0.0.1:8000";

function VerifyEmail() {
  const location = useLocation();
  const navigate = useNavigate();

  const [email, setEmail] = useState(location.state?.email || "");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState(location.state?.message || "");
  const [error, setError] = useState("");

  const verifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!email.trim() || !/^\d{6}$/.test(otp)) {
      setError("Enter your email and valid 6-digit OTP.");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(`${API}/customer/verify-email`, {
        email: email.trim().toLowerCase(),
        otp,
      });

      navigate("/login", {
        state: { message: response.data.message },
      });
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.detail || "OTP verification failed.");
      } else {
        setError("Unable to connect to server.");
      }
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = async () => {
    setError("");
    setMessage("");

    if (!email.trim()) {
      setError("Enter your registered email address.");
      return;
    }

    try {
      setResending(true);

      const response = await axios.post(
        `${API}/customer/resend-verification`,
        { email: email.trim().toLowerCase() }
      );

      setMessage(response.data.message);
      setOtp("");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.detail || "Unable to resend OTP.");
      } else {
        setError("Unable to connect to server.");
      }
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-layout">
        <section className="auth-form-panel">
          <div className="auth-card">
            <div className="auth-heading">
              <span className="auth-eyebrow">SMART FOODCOURT</span>
              <h2>Verify Your Email</h2>
              <p>Enter the 6-digit OTP sent to your email address.</p>
            </div>

            {message && <p className="auth-success">{message}</p>}
            {error && <p className="auth-error">{error}</p>}

            <form onSubmit={verifyOTP} noValidate>
              <label htmlFor="verify-email">Email Address</label>
              <input
                id="verify-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />

              <label htmlFor="verify-otp">Verification OTP</label>
              <input
                id="verify-otp"
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="Enter 6-digit OTP"
                required
              />

              <button type="submit" disabled={loading}>
                {loading ? "Verifying..." : "Verify Email"}
              </button>
            </form>

            <button
              type="button"
              className="auth-secondary-button"
              onClick={resendOTP}
              disabled={resending}
            >
              {resending ? "Sending..." : "Resend OTP"}
            </button>

            <p className="auth-switch">
              Already verified? <Link to="/login">Login</Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

export default VerifyEmail;
