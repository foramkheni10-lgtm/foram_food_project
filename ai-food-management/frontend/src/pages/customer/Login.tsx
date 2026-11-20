
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const successMessage = location.state?.message as string | undefined;

  const errors = {
    email: !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
      ? "Enter a valid email address."
      : "",
    password: !password ? "Password is required." : ""
  };

  const showError = (field: keyof typeof errors) =>
    (touched[field] || submitted) && errors[field];

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
    setError("");

    if (Object.values(errors).some(Boolean)) return;

    try {
      setLoading(true);

      const response = await axios.post(
        "https://foram-food-project.onrender.com/customer/login",
        {
          email: email.trim(),
          password
        }
      );

      localStorage.setItem(
        "smartfoodcourt_token",
        response.data.access_token
      );

      localStorage.setItem(
        "smartfoodcourt_user",
        JSON.stringify(response.data.user)
      );

     navigate("/", { replace: true });

    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.detail || "Login failed.");
      } else {
        setError("Unable to connect to the server.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-layout">

        {/* LEFT: Animated Food Section */}
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

        {/* RIGHT: Login Form */}
        <section className="auth-form-panel">
          <div className="auth-card">

            <div className="auth-heading">
              <span className="auth-eyebrow">WELCOME BACK</span>
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

              {/* EMAIL */}
              <div className="form-group">
                <label htmlFor="email">Email Address</label>

                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() =>
                    setTouched((prev) => ({ ...prev, email: true }))
                  }
                  autoComplete="email"
                />

                {showError("email") && (
                  <small className="field-error">
                    {errors.email}
                  </small>
                )}
              </div>

              {/* PASSWORD */}
              <div className="login-password-field">
  <label htmlFor="password">Password</label>

  <div className="password-input-wrapper">
    <input
      id="password"
      type={showPassword ? "text" : "password"}
      placeholder="Enter your password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      onBlur={() =>
        setTouched((prev) => ({ ...prev, password: true }))
      }
      className={showError("password") ? "input-error" : ""}
    />

    <button
      type="button"
      className="password-eye-btn"
      onClick={() => setShowPassword((prev) => !prev)}
      aria-label={showPassword ? "Hide password" : "Show password"}
    >
      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
    </button>
  </div>

  {showError("password") && (
    <span className="field-error">{errors.password}</span>
  )}
</div>

              {/* LOGIN BUTTON */}
              <button
                type="submit"
                disabled={loading}
                className="auth-submit-btn"
              >
                {loading ? "Logging in..." : "Login"}
              </button>

            </form>
            <p className="auth-switch">
              Don't have an account?{" "}
              <Link to="/register">Create Account</Link>
            </p>

          </div>
        </section>

      </div>
    </div>
  );
}

export default Login;
