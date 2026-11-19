
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Login.css";

function EyeIcon({ visible }: { visible: boolean }) {
  return visible ? (
    <svg
      viewBox="0 0 24 24"
      width="19"
      height="19"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
      <path d="m3 3 18 18" />
    </svg>
  ) : (
    <svg
      viewBox="0 0 24 24"
      width="19"
      height="19"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [consentAccepted, setConsentAccepted] = useState(false);

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const errors = {
    name:
      name.trim().length < 2
        ? "Name must contain at least 2 characters."
        : "",

    email: !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
      ? "Enter a valid email address."
      : "",

    phone: !/^\d{10,15}$/.test(phone.trim())
      ? "Enter 10–15 digits."
      : "",

    password:
      password.length < 8
        ? "Password must contain at least 8 characters."
        : new TextEncoder().encode(password).length > 72
          ? "Password is too long."
          : "",

    confirmPassword:
      password !== confirmPassword ? "Passwords do not match." : "",

    consent: !consentAccepted
      ? "Please accept the Terms & Conditions and Privacy Policy."
      : "",
  };

  const markTouched = (field: string) => {
    setTouched((previous) => ({ ...previous, [field]: true }));
  };

  const showError = (field: keyof typeof errors) =>
    (touched[field] || submitted) && errors[field];

  const handleRegister = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setSubmitted(true);
    setError("");

    if (Object.values(errors).some(Boolean)) return;

    try {
      setLoading(true);

      await axios.post(
        "http://127.0.0.1:8000/customer/register",
        {
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          password,
          confirm_password: confirmPassword,
          terms_accepted: consentAccepted,
          privacy_accepted: consentAccepted,
        }
      );

      navigate("/login", {
        state: { message: "Registration successful! Please login." },
      });
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.detail || "Registration failed.");
      } else {
        setError("Unable to connect to the server.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-layout register-auth-layout">

        {/* LEFT SIDE: REGISTER FORM */}
        <section className="auth-form-panel register-form-panel">
          <div className="auth-card register-card">

            <div className="auth-heading register-heading">
              <span className="auth-eyebrow">JOIN SMART FOODCOURT</span>
              <h2>Create your account</h2>
              <p>Sign up and make every food moment special.</p>
            </div>

            {error && <p className="auth-error">{error}</p>}

            <form onSubmit={handleRegister} noValidate>
              <label htmlFor="register-name">Full Name</label>
              <input
                id="register-name"
                type="text"
                autoComplete="name"
                className={showError("name") ? "invalid" : ""}
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => markTouched("name")}
                placeholder="Enter your full name"
              />
              {showError("name") && (
                <small className="field-error">{errors.name}</small>
              )}

              <label htmlFor="register-email">Email Address</label>
              <input
                id="register-email"
                type="email"
                autoComplete="email"
                className={showError("email") ? "invalid" : ""}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => markTouched("email")}
                placeholder="Enter your email"
              />
              {showError("email") && (
                <small className="field-error">{errors.email}</small>
              )}

              <label htmlFor="register-phone">Mobile Number</label>
              <input
                id="register-phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                className={showError("phone") ? "invalid" : ""}
                value={phone}
                onChange={(e) =>
                  setPhone(e.target.value.replace(/\D/g, "").slice(0, 15))
                }
                onBlur={() => markTouched("phone")}
                placeholder="Enter your mobile number"
              />
              {showError("phone") && (
                <small className="field-error">{errors.phone}</small>
              )}

              <label htmlFor="register-password">Password</label>
              <div className="register-password-field">
                <input
                  id="register-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  className={showError("password") ? "invalid" : ""}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => markTouched("password")}
                  placeholder="Minimum 8 characters"
                />
                <button
                  type="button"
                  className="password-toggle"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((value) => !value)}
                >
                  <EyeIcon visible={showPassword} />
                </button>
              </div>
              {showError("password") && (
                <small className="field-error">{errors.password}</small>
              )}

              <label htmlFor="confirm-password">Confirm Password</label>
              <div className="register-password-field">
                <input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  className={showError("confirmPassword") ? "invalid" : ""}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onBlur={() => markTouched("confirmPassword")}
                  placeholder="Re-enter your password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                  onClick={() =>
                    setShowConfirmPassword((value) => !value)
                  }
                >
                  <EyeIcon visible={showConfirmPassword} />
                </button>
              </div>
              {showError("confirmPassword") && (
                <small className="field-error">
                  {errors.confirmPassword}
                </small>
              )}

              <div className="register-consent">
                <label className="consent-label">
                  <input
                    type="checkbox"
                    checked={consentAccepted}
                    onChange={(e) => setConsentAccepted(e.target.checked)}
                  />
                  <span>
                    By creating an account, I accept the{" "}
                    <Link to="/terms-and-conditions">
                      Terms & Conditions
                    </Link>{" "}
                    &{" "}
                    <Link to="/privacy-policy">Privacy Policy</Link>.
                  </span>
                </label>

                {showError("consent") && (
                  <small className="field-error">{errors.consent}</small>
                )}
              </div>

              <button type="submit" disabled={loading}>
                {loading ? "Creating account..." : "Create Account"}
              </button>
            </form>

            <p className="auth-switch register-auth-switch">
              Already have an account? <Link to="/login">Login</Link>
            </p>
          </div>
        </section>

        {/* RIGHT SIDE: ANIMATED FOOD SECTION */}
        <section className="auth-visual register-visual">
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

          <div className="food-visual-text register-visual-text">
            <h1>Smart FoodCourt</h1>
            <h2>Your Cravings, Our Passion.</h2>
            <p>
              Discover delicious meals, explore exciting flavours,
              and make every food moment special.
            </p>
            <span className="food-tagline">Eat Smart • Live Better.</span>
          </div>
        </section>

      </div>
    </div>
  );
}

export default Register;
