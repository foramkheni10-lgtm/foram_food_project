
import { useState, useEffect, type FormEvent } from "react";
import { Eye, EyeOff, RefreshCw } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "./Login.css";

const API_URL = "http://127.0.0.1:8000";

interface CaptchaData {
  captcha_id: string;
  captcha_image: string;
  expires_in: number;
}

type AccountType = "customer" | "admin" | "restaurant" | "inventory";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [accountType, setAccountType] =
    useState<AccountType>("customer");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [captchaId, setCaptchaId] = useState("");
 
  const [captchaAnswer, setCaptchaAnswer] = useState("");
   const [captchaImage, setCaptchaImage] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [captchaLoading, setCaptchaLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const successMessage = location.state?.message as string | undefined;

  // --------------------------------------------------
  // REFRESH IMAGE CAPTCHA
  // --------------------------------------------------

  const refreshCaptcha = async () => {
  setCaptchaLoading(true);

  try {
    const response = await axios.get<CaptchaData>(
      `${API_URL}/customer/captcha`
    );

    setCaptchaId(response.data.captcha_id);
    setCaptchaImage(response.data.captcha_image);
    setCaptchaAnswer("");
  } catch (err) {
    console.error("CAPTCHA loading failed:", err);
    setCaptchaId("");
    setCaptchaImage("");
    setError("Unable to load CAPTCHA. Please refresh.");
  } finally {
    setCaptchaLoading(false);
  }
};

  useEffect(() => {
    refreshCaptcha();
  }, []);

  // --------------------------------------------------
  // ACCOUNT TYPE CHANGE
  // --------------------------------------------------

  const handleAccountTypeChange = (value: AccountType) => {
  setAccountType(value);
  setError("");
  setSubmitted(false);
  setTouched({});
  setPassword("");
  setCaptchaAnswer("");
  setCaptchaId("");
  setCaptchaImage("");
  setShowPassword(false);

  refreshCaptcha();
};
  // --------------------------------------------------
  // LIVE VALIDATION
  // --------------------------------------------------

  const errors = {
    email: !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
      ? "Enter a valid email address."
      : "",

    password: !password
      ? "Password is required."
      : "",

    captcha: !captchaAnswer.trim()
      ? "Please enter the CAPTCHA characters."
      : "",
  };

  const showError = (field: keyof typeof errors) =>
    (touched[field] || submitted) && errors[field];

  // --------------------------------------------------
  // LOGIN
  // --------------------------------------------------

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setSubmitted(true);
    setError("");

    if (Object.values(errors).some(Boolean)) {
      return;
    }

    if (!captchaId || !captchaImage) {
      setError("Please wait for CAPTCHA to load.");
      return;
    }

    try {
      setLoading(true);

      const loginData = {
        email: email.trim().toLowerCase(),
        password,
        captcha_id: captchaId,
        captcha_answer: captchaAnswer.trim().toUpperCase(),
        remember_me: rememberMe,
      };

      // ----------------------------------------------
      // RESTAURANT LOGIN
      // ----------------------------------------------

      if (accountType === "restaurant") {
        const response = await axios.post(
          `${API_URL}/api/restaurants/login`,
          loginData
        );

        const data = response.data;

        if (!data.access_token || !data.restaurant_id) {
          setError("Invalid restaurant login response.");
          return;
        }

        localStorage.setItem("token", data.access_token);
        localStorage.setItem("restaurantId", data.restaurant_id);

        localStorage.setItem(
          "restaurantName",
          data.restaurantName || ""
        );

        localStorage.setItem(
          "restaurantEmail",
          email.trim()
        );

        navigate("/restaurant/dashboard", { replace: true });
        return;
      }

      // ----------------------------------------------
      // CUSTOMER / ADMIN / INVENTORY LOGIN
      // ----------------------------------------------

      const response = await axios.post(
        `${API_URL}/customer/login`,
        {
          ...loginData,
          account_type: accountType,
        }
      );

      const data = response.data;

      if (!data.access_token) {
        setError("Login response did not contain an access token.");
        return;
      }

      localStorage.setItem(
        "smartfoodcourt_token",
        data.access_token
      );

      localStorage.setItem(
        "smartfoodcourt_user",
        JSON.stringify(data.user)
      );

      navigate(data.next_page || "/", { replace: true });

    }  catch (err: unknown) {
  let message = "Login failed. Please try again.";

  if (axios.isAxiosError(err)) {
    const detail = err.response?.data?.detail;

    if (typeof detail === "string") {
      message = detail;
    } else if (err.response?.status === 500) {
      message = "Server error. Please try again later.";
    } else if (!err.response) {
      message = "Unable to connect to the server.";
    }
  }

  setError(message);

  await refreshCaptcha();

  setTouched((prev) => ({
    ...prev,
    captcha: false,
  }));

  setSubmitted(false);



    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // BUTTON TEXT
  // --------------------------------------------------

  const loginButtonText = {
    customer: "Customer Login",
    admin: "Admin Login",
    restaurant: "Restaurant Login",
    inventory: "Inventory Staff Login",
  }[accountType];

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <div className="auth-page">
      <div className="auth-layout">

        {/* LEFT VISUAL SECTION */}

        <section className="auth-visual">
          <div className="food-animation-area">
            <div className="food-item burger">🍔</div>
            <div className="food-item pizza">🍕</div>
            <div className="food-item fries">🍟</div>
            <div className="food-item drink">🥤</div>
            <div className="food-item donut">🍩</div>
            <div className="food-item sandwich">🥪</div>

            <div className="food-center">
              <span>🍔</span>
            </div>

            <div className="food-orbit orbit-one"></div>
            <div className="food-orbit orbit-two"></div>
          </div>

          <div className="food-visual-text">
            <h1>Smart FoodCourt</h1>
            <h2>Your Cravings, Our Passion.</h2>

            <p>
              Discover delicious meals, explore exciting flavours,
              and make every food moment special.
            </p>

            <div className="food-tagline">
              Eat Smart <span>•</span> Live Better.
            </div>
          </div>
        </section>

        {/* RIGHT LOGIN SECTION */}

        <section className="auth-form-panel">
          <div className="auth-card">

            <div className="auth-heading">
              <span className="auth-eyebrow">
                WELCOME BACK
              </span>

              <h2>Login to your account</h2>

              <p>Enter your details to continue.</p>
            </div>

            {successMessage && (
              <div className="success-message">
                {successMessage}
              </div>
            )}

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} noValidate>

              {/* ACCOUNT TYPE */}

              <div className="account-type-group">
                <label htmlFor="accountType">
                  Login As
                </label>

                <select
                  id="accountType"
                  value={accountType}
                  onChange={(e) =>
                    handleAccountTypeChange(
                      e.target.value as AccountType
                    )
                  }
                  disabled={loading}
                >
                  <option value="customer">Customer</option>
                  <option value="admin">Admin</option>
                  <option value="restaurant">Restaurant</option>
                  <option value="inventory">Inventory Staff</option>
                </select>
              </div>

              {/* EMAIL */}

              <div className="form-group">
                <label htmlFor="email">
                  Email Address *
                </label>

                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() =>
                    setTouched((prev) => ({
                      ...prev,
                      email: true,
                    }))
                  }
                  autoComplete="email"
                  disabled={loading}
                />

                {showError("email") && (
                  <small className="field-error">
                    {errors.email}
                  </small>
                )}
              </div>

              {/* PASSWORD */}

              <div className="login-password-field">
                <label htmlFor="password">
                  Password *
                </label>

                <div className="password-input-wrapper">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() =>
                      setTouched((prev) => ({
                        ...prev,
                        password: true,
                      }))
                    }
                    className={
                      showError("password") ? "input-error" : ""
                    }
                    autoComplete="current-password"
                    disabled={loading}
                  />

                  <button
                    type="button"
                    className="password-eye-btn"
                    onClick={() =>
                      setShowPassword((prev) => !prev)
                    }
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                </div>

                {showError("password") && (
                  <small className="field-error">
                    {errors.password}
                  </small>
                )}
              </div>

              {/* IMAGE CAPTCHA */}

{/* IMAGE CAPTCHA */}

<div className="form-group captcha-group">
  <label htmlFor="captchaAnswer">CAPTCHA *</label>

  <div className="captcha-display">
    {captchaImage ? (
      <img
        src={captchaImage}
        alt="CAPTCHA verification"
        className="captcha-image"
      />
    ) : (
      <div className="captcha-placeholder">
        {captchaLoading ? "Loading CAPTCHA..." : "CAPTCHA unavailable"}
      </div>
    )}

    <button
      type="button"
      className="captcha-refresh"
      onClick={refreshCaptcha}
      disabled={captchaLoading || loading}
      title="Refresh CAPTCHA"
    >
      <RefreshCw size={18} />
    </button>
  </div>

  <input
    id="captchaAnswer"
    type="text"
    value={captchaAnswer}
    onChange={(e) =>
      setCaptchaAnswer(e.target.value.toUpperCase())
    }
    onBlur={() =>
      setTouched((prev) => ({ ...prev, captcha: true }))
    }
    placeholder="Enter CAPTCHA characters"
    maxLength={6}
    autoComplete="off"
    disabled={loading}
    className={showError("captcha") ? "input-error" : ""}
  />

  {showError("captcha") && (
    <small className="field-error">{errors.captcha}</small>
  )}
</div>

<input
  type="text"
  value={captchaAnswer}
  onChange={(e) => setCaptchaAnswer(e.target.value.toUpperCase())}
  placeholder="Enter CAPTCHA characters"
  maxLength={6}
  autoComplete="off"
/>

              {/* REMEMBER ME */}

              <div className="login-options">
                <label className="remember-me">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) =>
                      setRememberMe(e.target.checked)
                    }
                    disabled={loading}
                  />

                  <span>Remember Me</span>
                </label>
              </div>

              {/* LOGIN BUTTON */}

              <button
                type="submit"
                disabled={
                  loading ||
                  captchaLoading ||
                  !captchaId
                }
                className="auth-submit-btn"
              >
                {loading
                  ? "Logging in..."
                  : loginButtonText}
              </button>

            </form>

            {/* CUSTOMER REGISTRATION */}

            {accountType === "customer" && (
              <p className="auth-switch">
                Don't have an account?{" "}
                <Link to="/register">
                  Create Account
                </Link>
              </p>
            )}

            {/* RESTAURANT REGISTRATION */}

            {accountType === "restaurant" && (
              <p className="auth-switch">
                Don't have a restaurant account?{" "}
                <Link to="/restaurant/register">
                  Register Restaurant
                </Link>
              </p>
            )}

            {/* FORGOT PASSWORD */}

            <p className="forgot-password-bottom">
              <Link to="/forgot-password">
                Forgot Password?
              </Link>
            </p>

          </div>
        </section>
      </div>
    </div>
  );
}

export default Login;
