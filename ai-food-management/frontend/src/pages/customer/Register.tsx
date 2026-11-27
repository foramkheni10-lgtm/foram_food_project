
import React, { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Login.css";

const API_URL = "http://127.0.0.1:8000";

type AccountRole = "customer" | "restaurant";

const themes = {
  terracotta: {
    themeName: "terracotta",
    primaryColor: "#c65d3a",
    secondaryColor: "#e7a66a",
    backgroundColor: "#faf7f2",
    cardColor: "#ffffff",
    textColor: "#292524",
  },
  ocean: {
    themeName: "ocean",
    primaryColor: "#176b87",
    secondaryColor: "#64ccc5",
    backgroundColor: "#f0f8fa",
    cardColor: "#ffffff",
    textColor: "#18323b",
  },
  forest: {
    themeName: "forest",
    primaryColor: "#28745b",
    secondaryColor: "#9bcb9a",
    backgroundColor: "#f2f8f1",
    cardColor: "#ffffff",
    textColor: "#25372a",
  },
  royal: {
    themeName: "royal",
    primaryColor: "#7041a6",
    secondaryColor: "#b99ae0",
    backgroundColor: "#f7f3fc",
    cardColor: "#ffffff",
    textColor: "#30263a",
  },
  rose: {
    themeName: "rose",
    primaryColor: "#c05270",
    secondaryColor: "#e9a2b1",
    backgroundColor: "#fff4f6",
    cardColor: "#ffffff",
    textColor: "#3e2930",
  },
  dark: {
    themeName: "dark",
    primaryColor: "#e0a84b",
    secondaryColor: "#d9b77e",
    backgroundColor: "#20242b",
    cardColor: "#303640",
    textColor: "#ffffff",
  },
};

type ThemeName = keyof typeof themes;

function EyeIcon({ visible }: { visible: boolean }) {
  return (
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
      {!visible && <path d="m3 3 18 18" />}
    </svg>
  );
}

function Register() {
  const navigate = useNavigate();

  // Account role
  const [role, setRole] = useState<AccountRole>("customer");

  // Customer fields
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
  const [customerError, setCustomerError] = useState("");
  const [customerLoading, setCustomerLoading] = useState(false);

  // Restaurant fields
  const [restaurantName, setRestaurantName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [restaurantEmail, setRestaurantEmail] = useState("");
  const [restaurantPhone, setRestaurantPhone] = useState("");
  const [address, setAddress] = useState("");
  const [restaurantPassword, setRestaurantPassword] = useState("");
  const [restaurantConfirmPassword, setRestaurantConfirmPassword] =
    useState("");

  const [logo, setLogo] = useState("");
  const [logoName, setLogoName] = useState("");
  const [selectedTheme, setSelectedTheme] =
    useState<ThemeName>("terracotta");

  const [captchaId, setCaptchaId] = useState("");
  const [captchaImage, setCaptchaImage] = useState("");
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [captchaLoading, setCaptchaLoading] = useState(false);

  const [restaurantLoading, setRestaurantLoading] = useState(false);
  const [restaurantErrors, setRestaurantErrors] = useState<
    Record<string, string>
  >({});
  const [restaurantServerError, setRestaurantServerError] = useState("");

  // Customer validation
  const customerErrors = {
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

  const showCustomerError = (field: keyof typeof customerErrors) =>
    (touched[field] || submitted) && customerErrors[field];

  // Customer registration
  const handleCustomerRegister = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setSubmitted(true);
    setCustomerError("");

    if (Object.values(customerErrors).some(Boolean)) return;

    try {
      setCustomerLoading(true);

      const response = await axios.post(`${API_URL}/customer/register`, {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password,
        confirm_password: confirmPassword,
        terms_accepted: consentAccepted,
        privacy_accepted: consentAccepted,
      });

      if (response.data.verification_required) {
        navigate("/verify-email", {
          state: {
            email: email.trim().toLowerCase(),
            message: "OTP sent successfully. Please verify your email.",
          },
        });
      } else {
        navigate("/login", {
          state: {
            message: "Registration successful. Please login.",
          },
        });
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const detail = error.response?.data?.detail;
        setCustomerError(
          typeof detail === "string"
            ? detail
            : "Registration failed. Please try again."
        );
      } else {
        setCustomerError("Unable to connect to the server.");
      }
    } finally {
      setCustomerLoading(false);
    }
  };

  // Restaurant CAPTCHA
  const refreshCaptcha = useCallback(async () => {
    try {
      setCaptchaLoading(true);
      setCaptchaAnswer("");
      setCaptchaId("");
      setCaptchaImage("");
      setRestaurantErrors((previous) => ({
        ...previous,
        captcha: "",
      }));

      const response = await axios.get(
        `${API_URL}/api/restaurants/captcha`
      );

      setCaptchaId(response.data.captcha_id);
      setCaptchaImage(response.data.captcha_image);
    } catch (error) {
      console.error("Restaurant signup CAPTCHA error:", error);
      setRestaurantServerError(
        "Unable to load CAPTCHA. Please refresh the page."
      );
    } finally {
      setCaptchaLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshCaptcha();
  }, [refreshCaptcha]);

  // Restaurant live validation
  const validateRestaurantField = (field: string, value: string) => {
    let error = "";

    switch (field) {
      case "restaurantName":
        if (!value.trim()) error = "Restaurant name is required.";
        else if (value.trim().length < 2)
          error = "Enter at least 2 characters.";
        break;

      case "ownerName":
        if (!value.trim()) error = "Owner name is required.";
        else if (value.trim().length < 2)
          error = "Enter at least 2 characters.";
        break;

      case "email":
        if (!value.trim()) error = "Email address is required.";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()))
          error = "Enter a valid email address.";
        break;

      case "phone": {
        const digits = value.replace(/\D/g, "");
        if (!value.trim()) error = "Phone number is required.";
        else if (digits.length < 10 || digits.length > 15)
          error = "Enter a valid phone number (10–15 digits).";
        break;
      }

      case "address":
        if (!value.trim()) error = "Restaurant address is required.";
        else if (value.trim().length < 5)
          error = "Please enter a complete address.";
        break;

      case "password":
        if (!value) error = "Password is required.";
        else if (value.length < 8)
          error = "Password must contain at least 8 characters.";
        else if (new TextEncoder().encode(value).length > 72)
          error = "Password must not exceed 72 bytes.";
        break;

      case "confirmPassword":
        if (!value) error = "Please confirm your password.";
        else if (value !== restaurantPassword)
          error = "Passwords do not match.";
        break;

      case "captcha":
        if (!value.trim()) error = "CAPTCHA answer is required.";
        else if (value.trim().length !== 6)
          error = "Enter all 6 CAPTCHA characters.";
        break;
    }

    setRestaurantErrors((previous) => ({
      ...previous,
      [field]: error,
    }));

    return error;
  };

  const updateRestaurantField = (
    field: string,
    value: string,
    setter: (value: string) => void
  ) => {
    setter(value);
    validateRestaurantField(field, value);
  };

  // Restaurant logo
  const handleLogoChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setRestaurantServerError("Please select a valid image file.");
      event.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setRestaurantServerError("Logo size should not exceed 2MB.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        setLogo(reader.result);
        setLogoName(file.name);
        setRestaurantServerError("");
      }
    };

    reader.onerror = () => {
      setRestaurantServerError("Unable to read the selected image.");
    };

    reader.readAsDataURL(file);
  };

  // Restaurant registration
  const handleRestaurantRegister = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setRestaurantServerError("");

    const fields = {
      restaurantName,
      ownerName,
      email: restaurantEmail,
      phone: restaurantPhone,
      address,
      password: restaurantPassword,
      confirmPassword: restaurantConfirmPassword,
      captcha: captchaAnswer,
    };

    let hasErrors = false;

    Object.entries(fields).forEach(([field, value]) => {
      if (validateRestaurantField(field, value)) {
        hasErrors = true;
      }
    });

    if (hasErrors) return;

    try {
      setRestaurantLoading(true);

      const registrationData = {
        restaurantName: restaurantName.trim(),
        ownerName: ownerName.trim(),
        email: restaurantEmail.trim().toLowerCase(),
        phone: restaurantPhone.trim(),
        password: restaurantPassword,
        confirmPassword: restaurantConfirmPassword,
        address: address.trim(),
        logo,
        theme: {
          ...themes[selectedTheme],
          themeName: selectedTheme,
        },
        captcha_id: captchaId,
        captcha_answer: captchaAnswer.trim().toUpperCase(),
      };

      const response = await axios.post(
        `${API_URL}/api/restaurants/register`,
        registrationData
      );

      if (response.data?.verification_required) {
        navigate("/restaurant/verify-email", {
          replace: true,
          state: {
            email: restaurantEmail.trim().toLowerCase(),
            message: "A verification code has been sent to your email.",
          },
        });
      } else {
        setRestaurantServerError(
          "Registration response did not request email verification. Please check the backend registration endpoint."
        );
      }
    } catch (error: unknown) {
      console.error("Restaurant registration error:", error);

      if (axios.isAxiosError(error)) {
        const detail = error.response?.data?.detail;
        setRestaurantServerError(
          typeof detail === "string"
            ? detail
            : "Registration failed. Please try again."
        );
      } else {
        setRestaurantServerError("Unable to connect to the server.");
      }

      await refreshCaptcha();
    } finally {
      setRestaurantLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-layout register-auth-layout">
        <section className="auth-form-panel register-form-panel">
          <div className="auth-card register-card">
            <div className="auth-heading register-heading">
              <span className="auth-eyebrow">JOIN SMART FOODCOURT</span>
              <h2>Create your account</h2>
              <p>Sign up and make every food moment special.</p>
            </div>

            {/* RADIO BUTTON ROLE SELECTION */}
            <div className="register-role-section">
              <p className="register-role-title">
                Choose your account type
              </p>

              <div className="register-role-options">
                <label
                  className={`register-role-option ${
                    role === "customer" ? "active" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="accountRole"
                    value="customer"
                    checked={role === "customer"}
                    onChange={() => setRole("customer")}
                  />

                  <span className="register-role-icon">👤</span>

                  <span className="register-role-copy">
                    <strong>Customer</strong>
                    <small>Order food and track your orders</small>
                  </span>
                </label>

                <label
                  className={`register-role-option ${
                    role === "restaurant" ? "active" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="accountRole"
                    value="restaurant"
                    checked={role === "restaurant"}
                    onChange={() => setRole("restaurant")}
                  />

                  <span className="register-role-icon">🏪</span>

                  <span className="register-role-copy">
                    <strong>Restaurant</strong>
                    <small>Register and manage your restaurant</small>
                  </span>
                </label>
              </div>
            </div>

            {/* CUSTOMER REGISTRATION FORM */}
            {role === "customer" && (
              <>
                {customerError && (
                  <p className="auth-error" role="alert">
                    {customerError}
                  </p>
                )}

                <form onSubmit={handleCustomerRegister} noValidate>
                  <label htmlFor="register-name">Full Name</label>
                  <input
                    id="register-name"
                    type="text"
                    autoComplete="name"
                    className={showCustomerError("name") ? "invalid" : ""}
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    onBlur={() => markTouched("name")}
                    placeholder="Enter your full name"
                  />
                  {showCustomerError("name") && (
                    <small className="field-error">
                      {customerErrors.name}
                    </small>
                  )}

                  <label htmlFor="register-email">Email Address</label>
                  <input
                    id="register-email"
                    type="email"
                    autoComplete="email"
                    className={showCustomerError("email") ? "invalid" : ""}
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    onBlur={() => markTouched("email")}
                    placeholder="Enter your email"
                  />
                  {showCustomerError("email") && (
                    <small className="field-error">
                      {customerErrors.email}
                    </small>
                  )}

                  <label htmlFor="register-phone">Mobile Number</label>
                  <input
                    id="register-phone"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    className={showCustomerError("phone") ? "invalid" : ""}
                    value={phone}
                    onChange={(event) =>
                      setPhone(
                        event.target.value.replace(/\D/g, "").slice(0, 15)
                      )
                    }
                    onBlur={() => markTouched("phone")}
                    placeholder="Enter your mobile number"
                  />
                  {showCustomerError("phone") && (
                    <small className="field-error">
                      {customerErrors.phone}
                    </small>
                  )}

                  <label htmlFor="register-password">Password</label>
                  <div className="register-password-field">
                    <input
                      id="register-password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      className={
                        showCustomerError("password") ? "invalid" : ""
                      }
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
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
                  {showCustomerError("password") && (
                    <small className="field-error">
                      {customerErrors.password}
                    </small>
                  )}

                  <label htmlFor="confirm-password">Confirm Password</label>
                  <div className="register-password-field">
                    <input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      className={
                        showCustomerError("confirmPassword") ? "invalid" : ""
                      }
                      value={confirmPassword}
                      onChange={(event) =>
                        setConfirmPassword(event.target.value)
                      }
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
                  {showCustomerError("confirmPassword") && (
                    <small className="field-error">
                      {customerErrors.confirmPassword}
                    </small>
                  )}

                  <div className="register-consent">
                    <label className="consent-label">
                      <input
                        type="checkbox"
                        checked={consentAccepted}
                        onChange={(event) =>
                          setConsentAccepted(event.target.checked)
                        }
                      />
                      <span>
                        By creating an account, I accept the{" "}
                        <Link to="/terms-and-conditions">
                          Terms & Conditions
                        </Link>{" "}
                        & <Link to="/privacy-policy">Privacy Policy</Link>.
                      </span>
                    </label>

                    {showCustomerError("consent") && (
                      <small className="field-error">
                        {customerErrors.consent}
                      </small>
                    )}
                  </div>

                  <button type="submit" disabled={customerLoading}>
                    {customerLoading
                      ? "Sending verification OTP..."
                      : "Create Customer Account"}
                  </button>
                </form>
              </>
            )}

            {/* RESTAURANT REGISTRATION FORM */}
            {role === "restaurant" && (
              <>
                {restaurantServerError && (
                  <div className="auth-error" role="alert">
                    {restaurantServerError}
                  </div>
                )}

                <form onSubmit={handleRestaurantRegister} noValidate>
                  <div className="form-group">
                    <label htmlFor="restaurant-name">Restaurant Name</label>
                    <input
                      id="restaurant-name"
                      type="text"
                      placeholder="Enter restaurant name"
                      value={restaurantName}
                      onChange={(event) =>
                        updateRestaurantField(
                          "restaurantName",
                          event.target.value,
                          setRestaurantName
                        )
                      }
                    />
                    {restaurantErrors.restaurantName && (
                      <small className="field-error">
                        {restaurantErrors.restaurantName}
                      </small>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="owner-name">Owner Name</label>
                    <input
                      id="owner-name"
                      type="text"
                      placeholder="Enter owner name"
                      value={ownerName}
                      onChange={(event) =>
                        updateRestaurantField(
                          "ownerName",
                          event.target.value,
                          setOwnerName
                        )
                      }
                    />
                    {restaurantErrors.ownerName && (
                      <small className="field-error">
                        {restaurantErrors.ownerName}
                      </small>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="restaurant-email">Email Address</label>
                    <input
                      id="restaurant-email"
                      type="email"
                      placeholder="Enter email address"
                      value={restaurantEmail}
                      onChange={(event) =>
                        updateRestaurantField(
                          "email",
                          event.target.value,
                          setRestaurantEmail
                        )
                      }
                    />
                    {restaurantErrors.email && (
                      <small className="field-error">
                        {restaurantErrors.email}
                      </small>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="restaurant-phone">Phone Number</label>
                    <input
                      id="restaurant-phone"
                      type="tel"
                      placeholder="Enter phone number"
                      value={restaurantPhone}
                      onChange={(event) =>
                        updateRestaurantField(
                          "phone",
                          event.target.value,
                          setRestaurantPhone
                        )
                      }
                    />
                    {restaurantErrors.phone && (
                      <small className="field-error">
                        {restaurantErrors.phone}
                      </small>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="restaurant-address">
                      Restaurant Address
                    </label>
                    <textarea
                      id="restaurant-address"
                      placeholder="Enter restaurant address"
                      value={address}
                      onChange={(event) =>
                        updateRestaurantField(
                          "address",
                          event.target.value,
                          setAddress
                        )
                      }
                      rows={3}
                    />
                    {restaurantErrors.address && (
                      <small className="field-error">
                        {restaurantErrors.address}
                      </small>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="restaurant-password">Password</label>
                    <input
                      id="restaurant-password"
                      type="password"
                      placeholder="Enter password (minimum 8 characters)"
                      value={restaurantPassword}
                      onChange={(event) => {
                        setRestaurantPassword(event.target.value);
                        validateRestaurantField(
                          "password",
                          event.target.value
                        );
                        if (restaurantConfirmPassword) {
                          validateRestaurantField(
                            "confirmPassword",
                            restaurantConfirmPassword
                          );
                        }
                      }}
                    />
                    {restaurantErrors.password && (
                      <small className="field-error">
                        {restaurantErrors.password}
                      </small>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="restaurant-confirm-password">
                      Confirm Password
                    </label>
                    <input
                      id="restaurant-confirm-password"
                      type="password"
                      placeholder="Confirm password"
                      value={restaurantConfirmPassword}
                      onChange={(event) =>
                        updateRestaurantField(
                          "confirmPassword",
                          event.target.value,
                          setRestaurantConfirmPassword
                        )
                      }
                    />
                    {restaurantErrors.confirmPassword && (
                      <small className="field-error">
                        {restaurantErrors.confirmPassword}
                      </small>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="restaurantLogo">Restaurant Logo</label>
                    <label
                      htmlFor="restaurantLogo"
                      className="upload-label"
                    >
                      Choose Logo
                    </label>
                    <input
                      id="restaurantLogo"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      style={{ display: "none" }}
                    />

                    {logo && (
                      <div className="logo-preview">
                        <img
                          src={logo}
                          alt="Restaurant Logo Preview"
                          style={{
                            width: "100px",
                            height: "100px",
                            objectFit: "contain",
                            marginTop: "10px",
                            borderRadius: "10px",
                          }}
                        />
                        <p>{logoName}</p>
                        <button
                          type="button"
                          onClick={() => {
                            setLogo("");
                            setLogoName("");
                            const fileInput = document.getElementById(
                              "restaurantLogo"
                            ) as HTMLInputElement;
                            if (fileInput) fileInput.value = "";
                          }}
                        >
                          Remove Logo
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="restaurant-theme">
                      Choose Dashboard Theme
                    </label>
                    <select
                      id="restaurant-theme"
                      value={selectedTheme}
                      onChange={(event) =>
                        setSelectedTheme(event.target.value as ThemeName)
                      }
                    >
                      <option value="terracotta">Terracotta</option>
                      <option value="ocean">Ocean Blue</option>
                      <option value="forest">Forest Green</option>
                      <option value="royal">Royal Purple</option>
                      <option value="rose">Rose Pink</option>
                      <option value="dark">Dark Theme</option>
                    </select>
                    <small>
                      This theme will be applied to your restaurant dashboard
                      after registration.
                    </small>
                  </div>

                  <div className="form-group">
                    <label>Security Verification</label>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        marginBottom: "12px",
                        flexWrap: "wrap",
                      }}
                    >
                      {captchaImage ? (
                        <img
                          src={captchaImage}
                          alt="CAPTCHA verification"
                          style={{
                            width: "230px",
                            height: "75px",
                            borderRadius: "8px",
                            border: "1px solid #d6c8d2",
                            objectFit: "contain",
                          }}
                        />
                      ) : (
                        <span>
                          {captchaLoading
                            ? "Loading CAPTCHA..."
                            : "CAPTCHA unavailable"}
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => void refreshCaptcha()}
                        disabled={captchaLoading}
                        className="auth-button"
                      >
                        {captchaLoading ? "Loading..." : "↻ Refresh"}
                      </button>
                    </div>

                    <input
                      type="text"
                      placeholder="Enter the 6 characters shown"
                      value={captchaAnswer}
                      maxLength={6}
                      autoComplete="off"
                      onChange={(event) =>
                        updateRestaurantField(
                          "captcha",
                          event.target.value
                            .toUpperCase()
                            .replace(/[^A-Z0-9]/g, ""),
                          setCaptchaAnswer
                        )
                      }
                    />

                    {restaurantErrors.captcha && (
                      <small className="field-error">
                        {restaurantErrors.captcha}
                      </small>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="auth-button"
                    disabled={
                      restaurantLoading || captchaLoading || !captchaId
                    }
                  >
                    {restaurantLoading
                      ? "Sending verification code..."
                      : "Register Restaurant"}
                  </button>
                </form>
              </>
            )}

            <p className="auth-switch register-auth-switch">
              Already have an account? <Link to="/login">Login</Link>
            </p>
          </div>
        </section>

        {/* RIGHT SIDE FOOD VISUAL */}
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
              Discover delicious meals, explore exciting flavours, and make
              every food moment special.
            </p>
            <span className="food-tagline">Eat Smart • Live Better.</span>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Register;
