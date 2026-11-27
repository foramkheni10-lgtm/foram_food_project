

import React, { useCallback, useEffect, useState } from "react";

import { useNavigate, Link } from "react-router-dom";

import axios from "axios";

import "../../styles/restaurant/auth.css";



const API_URL = "https://foram-food-project.onrender.com";



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



const RestaurantRegister: React.FC = () => {

  const navigate = useNavigate();



  const [restaurantName, setRestaurantName] = useState("");

  const [ownerName, setOwnerName] = useState("");

  const [email, setEmail] = useState("");

  const [phone, setPhone] = useState("");

  const [password, setPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  const [address, setAddress] = useState("");



  const [logo, setLogo] = useState("");

  const [logoName, setLogoName] = useState("");



  const [selectedTheme, setSelectedTheme] =

    useState<ThemeName>("terracotta");



  const [captchaId, setCaptchaId] = useState("");
  const [captchaImage, setCaptchaImage] = useState("");
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [captchaLoading, setCaptchaLoading] = useState(false);



  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const [serverError, setServerError] = useState("");

  const refreshCaptcha = useCallback(async () => {
    try {
      setCaptchaLoading(true);
      setCaptchaAnswer("");
      setCaptchaId("");
      setCaptchaImage("");
      setErrors((previous) => ({ ...previous, captcha: "" }));

      const response = await axios.get(
        `${API_URL}/api/restaurants/captcha`
      );

      setCaptchaId(response.data.captcha_id);
      setCaptchaImage(response.data.captcha_image);
    } catch (error) {
      console.error("Restaurant signup CAPTCHA error:", error);
      setServerError("Unable to load CAPTCHA. Please refresh the page.");
    } finally {
      setCaptchaLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshCaptcha();
  }, [refreshCaptcha]);



  const validateField = (field: string, value: string) => {

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

        else if (value !== password)

          error = "Passwords do not match.";

        break;



      case "captcha":
        if (!value.trim()) error = "CAPTCHA answer is required.";
        else if (value.trim().length !== 6)
          error = "Enter all 6 CAPTCHA characters.";
        break;

    }



    setErrors((previous) => ({ ...previous, [field]: error }));

    return error;

  };



  const handleLogoChange = (

    event: React.ChangeEvent<HTMLInputElement>

  ) => {

    const file = event.target.files?.[0];

    if (!file) return;



    if (!file.type.startsWith("image/")) {

      setServerError("Please select a valid image file.");

      event.target.value = "";

      return;

    }



    if (file.size > 2 * 1024 * 1024) {

      setServerError("Logo size should not exceed 2MB.");

      event.target.value = "";

      return;

    }



    const reader = new FileReader();



    reader.onloadend = () => {

      if (typeof reader.result === "string") {

        setLogo(reader.result);

        setLogoName(file.name);

        setServerError("");

      }

    };



    reader.onerror = () => {

      setServerError("Unable to read the selected image.");

    };



    reader.readAsDataURL(file);

  };



  const handleRegister = async (

    event: React.FormEvent<HTMLFormElement>

  ) => {

    event.preventDefault();

    setServerError("");



    const fields = {

      restaurantName,

      ownerName,

      email,

      phone,

      address,

      password,

      confirmPassword,

      captcha: captchaAnswer,

    };



    let hasErrors = false;



    Object.entries(fields).forEach(([field, value]) => {

      if (validateField(field, value)) hasErrors = true;

    });



    if (hasErrors) return;



    setLoading(true);



    try {

      const registrationData = {

        restaurantName: restaurantName.trim(),

        ownerName: ownerName.trim(),

        email: email.trim().toLowerCase(),

        phone: phone.trim(),

        password,

        confirmPassword,

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

            email: email.trim().toLowerCase(),

            message: "A verification code has been sent to your email.",

          },

        });

      } else {

        setServerError(

          "Registration response did not request email verification. Please check the backend registration endpoint."

        );

      }

    } catch (error: any) {

      console.error("Restaurant registration error:", error);



      const detail =
        error.response?.data?.detail ||
        "Registration failed. Please try again.";

      setServerError(detail);

      // The backend consumes a valid CAPTCHA when processing registration.
      // Load a fresh one after any failed submission so the next attempt works.
      await refreshCaptcha();

    } finally {

      setLoading(false);

    }

  };



  const updateField = (

    field: string,

    value: string,

    setter: (value: string) => void

  ) => {

    setter(value);



    // Validate while the user types.

    validateField(field, value);

  };



  return (

    <div className="auth-page">

      <div className="auth-card register-card">

        <h1>Restaurant Registration</h1>



        <p className="auth-subtitle">

          Create your restaurant account

        </p>



        {serverError && (

          <div className="auth-error" role="alert">

            {serverError}

          </div>

        )}



        <form onSubmit={handleRegister} noValidate>

          <div className="form-group">

            <label>Restaurant Name</label>

            <input

              type="text"

              placeholder="Enter restaurant name"

              value={restaurantName}

              onChange={(e) =>

                updateField("restaurantName", e.target.value, setRestaurantName)

              }

            />

            {errors.restaurantName && <small className="field-error">{errors.restaurantName}</small>}

          </div>



          <div className="form-group">

            <label>Owner Name</label>

            <input

              type="text"

              placeholder="Enter owner name"

              value={ownerName}

              onChange={(e) =>

                updateField("ownerName", e.target.value, setOwnerName)

              }

            />

            {errors.ownerName && <small className="field-error">{errors.ownerName}</small>}

          </div>



          <div className="form-group">

            <label>Email Address</label>

            <input

              type="email"

              placeholder="Enter email address"

              value={email}

              onChange={(e) =>

                updateField("email", e.target.value, setEmail)

              }

            />

            {errors.email && <small className="field-error">{errors.email}</small>}

          </div>



          <div className="form-group">

            <label>Phone Number</label>

            <input

              type="tel"

              placeholder="Enter phone number"

              value={phone}

              onChange={(e) =>

                updateField("phone", e.target.value, setPhone)

              }

            />

            {errors.phone && <small className="field-error">{errors.phone}</small>}

          </div>



          <div className="form-group">

            <label>Restaurant Address</label>

            <textarea

              placeholder="Enter restaurant address"

              value={address}

              onChange={(e) =>

                updateField("address", e.target.value, setAddress)

              }

              rows={3}

            />

            {errors.address && <small className="field-error">{errors.address}</small>}

          </div>



          <div className="form-group">

            <label>Password</label>

            <input

              type="password"

              placeholder="Enter password (minimum 8 characters)"

              value={password}

              onChange={(e) => {

                setPassword(e.target.value);

                validateField("password", e.target.value);

                if (confirmPassword) {

                  validateField("confirmPassword", confirmPassword);

                }

              }}

            />

            {errors.password && <small className="field-error">{errors.password}</small>}

          </div>



          <div className="form-group">

            <label>Confirm Password</label>

            <input

              type="password"

              placeholder="Confirm password"

              value={confirmPassword}

              onChange={(e) =>

                updateField("confirmPassword", e.target.value, setConfirmPassword)

              }

            />

            {errors.confirmPassword && <small className="field-error">{errors.confirmPassword}</small>}

          </div>



          <div className="form-group">

            <label>Restaurant Logo</label>

            <label htmlFor="restaurantLogo" className="upload-label">

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

            <label>Choose Dashboard Theme</label>

            <select

              value={selectedTheme}

              onChange={(e) =>

                setSelectedTheme(e.target.value as ThemeName)

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

              This theme will be applied to your restaurant dashboard after registration.

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
                  {captchaLoading ? "Loading CAPTCHA..." : "CAPTCHA unavailable"}
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
              onChange={(e) =>
                updateField(
                  "captcha",
                  e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""),
                  setCaptchaAnswer
                )
              }
            />

            {errors.captcha && (
              <small className="field-error">{errors.captcha}</small>
            )}
          </div>



          <button

            type="submit"

            className="auth-button"

            disabled={loading || captchaLoading || !captchaId}

          >

            {loading ? "Sending verification code..." : "Register"}

          </button>

        </form>



        <p className="auth-footer">

          Already have an account?{" "}

          <Link to="/login">Login here</Link>

        </p>

      </div>

    </div>

  );

};



export default RestaurantRegister;
