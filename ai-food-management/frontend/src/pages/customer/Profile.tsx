
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Link, Navigate, useNavigate } from "react-router-dom";
import {
  UserRound, Mail, Phone, MapPin, Utensils, Pencil, LogOut,
  Heart, CreditCard, Smartphone, Banknote, ShoppingCart,
  ChevronRight, Home, ShieldCheck, Leaf, X, Camera,
  MessageSquare, Star, Trash2, Save, Upload, AlertTriangle
} from "lucide-react";
import "./Profile.css";

const API = "http://127.0.0.1:8000";

interface Customer {
  name?: string;
  email?: string;
  phone?: string;
  alternate_phone?: string;
  house_number?: string;
  street?: string;
  area?: string;
  landmark?: string;
  city?: string;
  state?: string;
  pincode?: string;
  food_preference?: string;
  profile_image?: string;
}

interface FavoriteFood {
  _id?: string;
  id?: string;
  name?: string;
  food_name?: string;
  description?: string;
  category?: string;
  price?: number;
  image?: string;
  restaurant_id?: string;
  restaurant_name?: string;
}

interface Feedback {
  feedback_id?: string;
  order_id?: string;
  order_number?: string;
  rating: number;
  comment?: string;
  created_at?: string;
}

interface Restaurant {
  _id: string;
  name?: string;
}

type Section =
  | "profile"
  | "payments"
  | "preferences"
  | "addresses"
  | "favorites"
  | "feedback"
  | "delete";

const profileFields: { field: keyof Customer; label: string }[] = [
  { field: "name", label: "Full Name" },
  { field: "email", label: "Email Address" },
  { field: "phone", label: "Phone Number" },
  { field: "alternate_phone", label: "Alternate Phone" },
  { field: "house_number", label: "House / Flat Number" },
  { field: "street", label: "Street" },
  { field: "area", label: "Area" },
  { field: "landmark", label: "Landmark (Optional)" },
  { field: "city", label: "City" },
  { field: "state", label: "State" },
  { field: "pincode", label: "Pincode" },
];

function Profile() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const token = localStorage.getItem("smartfoodcourt_token");
  const savedUser = localStorage.getItem("smartfoodcourt_user");

  let initialCustomer: Customer = {};
  let validUser = false;

  try {
    if (token && savedUser) {
      initialCustomer = JSON.parse(savedUser);
      validUser = Boolean(
        initialCustomer && typeof initialCustomer === "object"
      );
    }
  } catch {
    validUser = false;
  }

  const [customer, setCustomer] = useState<Customer>(initialCustomer);
  const [activeSection, setActiveSection] = useState<Section>("profile");

  const [favorites, setFavorites] = useState<FavoriteFood[]>([]);
  const [favoritesLoading, setFavoritesLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [addingCartId, setAddingCartId] = useState<string | null>(null);

  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [editForm, setEditForm] = useState<Customer>(initialCustomer);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleting, setDeleting] = useState(false);

  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const showMessage = (text: string, isError = false) => {
    if (isError) {
      setErrorMessage(text);
      setMessage("");
    } else {
      setMessage(text);
      setErrorMessage("");
    }
  };

  const clearMessages = () => {
    setMessage("");
    setErrorMessage("");
  };

  useEffect(() => {
    if (!token || !validUser) return;

    const loadProfile = async () => {
      try {
        const response = await axios.get(
          `${API}/customer/profile/me`,
          { headers }
        );

        const profile = response.data.profile || {};

        setCustomer(profile);
        setEditForm(profile);

        localStorage.setItem(
          "smartfoodcourt_user",
          JSON.stringify(profile)
        );
      } catch (error) {
        console.error("Unable to load profile:", error);
      }
    };

    loadProfile();
  }, [token]);

  useEffect(() => {
    if (!token || !validUser) {
      setFavoritesLoading(false);
      return;
    }

    const fetchFavorites = async () => {
      try {
        const [favoriteResponse, restaurantResponse] = await Promise.all([
          axios.get(`${API}/api/favorites/`, { headers }),
          axios.get(`${API}/api/restaurants/`).catch(() => ({ data: [] })),
        ]);

        const items: FavoriteFood[] = Array.isArray(
          favoriteResponse.data.items
        )
          ? favoriteResponse.data.items
          : [];

        const restaurantData = restaurantResponse.data;

        const restaurants: Restaurant[] = Array.isArray(restaurantData)
          ? restaurantData
          : restaurantData?.restaurants || [];

        const restaurantMap = new Map<string, string>();

        restaurants.forEach((restaurant) => {
          if (restaurant._id && restaurant.name) {
            restaurantMap.set(
              String(restaurant._id),
              restaurant.name
            );
          }
        });

        setFavorites(
          items.map((food) => ({
            ...food,
            restaurant_name:
              food.restaurant_name ||
              (food.restaurant_id
                ? restaurantMap.get(String(food.restaurant_id))
                : undefined) ||
              "Restaurant details unavailable",
          }))
        );
      } catch (error) {
        console.error("Unable to load favourites:", error);
        showMessage("Unable to load your favourites.", true);
      } finally {
        setFavoritesLoading(false);
      }
    };

    fetchFavorites();
  }, [token]);

  useEffect(() => {
    if (activeSection !== "feedback" || !token) return;

    const fetchFeedback = async () => {
      setFeedbackLoading(true);

      try {
        const response = await axios.get(
          `${API}/api/feedback/my-feedback`,
          { headers }
        );

        setFeedback(
          Array.isArray(response.data.feedback)
            ? response.data.feedback
            : []
        );
      } catch (error) {
        console.error("Unable to load feedback:", error);
        showMessage("Unable to load your feedback.", true);
      } finally {
        setFeedbackLoading(false);
      }
    };

    fetchFeedback();
  }, [activeSection, token]);

  if (!validUser) {
    return <Navigate to="/login" replace />;
  }

  const initials =
    customer.name
      ?.trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") || "U";

  const photoUrl = customer.profile_image
    ? `${API}${customer.profile_image}`
    : "";

  const address = [
    customer.house_number,
    customer.street,
    customer.area,
    customer.landmark,
    customer.city,
    customer.state,
    customer.pincode,
  ]
    .filter(Boolean)
    .join(", ");

  const updateFormField = (
    field: keyof Customer,
    value: string
  ) => {
    setEditForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    setValidationErrors((previous) => ({
      ...previous,
      [field]: "",
    }));
  };

  // PROFILE VALIDATION
  const validateProfile = () => {
    const errors: Record<string, string> = {};

    if (!editForm.name?.trim() || editForm.name.trim().length < 2) {
      errors.name = "Please enter your full name (minimum 2 characters).";
    }

    if (!editForm.email?.trim()) {
      errors.email = "Email address is required.";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.email.trim())
    ) {
      errors.email = "Please enter a valid email address.";
    }

    if (!editForm.phone?.trim()) {
      errors.phone = "Phone number is required.";
    } else if (
      !/^\+?[0-9]{10,15}$/.test(editForm.phone.trim())
    ) {
      errors.phone = "Enter a valid phone number (10–15 digits).";
    }

    if (
      editForm.alternate_phone?.trim() &&
      !/^\+?[0-9]{10,15}$/.test(editForm.alternate_phone.trim())
    ) {
      errors.alternate_phone = "Enter a valid alternate phone number.";
    }

    if (!editForm.house_number?.trim()) {
      errors.house_number = "House / flat number is required.";
    }

    if (!editForm.street?.trim()) {
      errors.street = "Street is required.";
    }

    if (!editForm.area?.trim()) {
      errors.area = "Area is required.";
    }

    if (!editForm.city?.trim()) {
      errors.city = "City is required.";
    }

    if (!editForm.state?.trim()) {
      errors.state = "State is required.";
    }

    if (!editForm.pincode?.trim()) {
      errors.pincode = "Pincode is required.";
    } else if (!/^[0-9]{6}$/.test(editForm.pincode.trim())) {
      errors.pincode = "Pincode must contain exactly 6 digits.";
    }

    if (
      !["Vegetarian", "Non-vegetarian", "Both"].includes(
        editForm.food_preference || ""
      )
    ) {
      errors.food_preference = "Please select a food preference.";
    }

    setValidationErrors(errors);

    return Object.keys(errors).length === 0;
  };

  // SAVE PROFILE
  const saveProfile = async () => {
    clearMessages();

    if (!validateProfile()) {
      alert("Please correct the highlighted fields before saving.");
      return;
    }

    setSaving(true);

    try {
      const response = await axios.put(
        `${API}/customer/profile/update`,
        {
          name: editForm.name?.trim(),
          email: editForm.email?.trim(),
          phone: editForm.phone?.trim(),
          alternate_phone: editForm.alternate_phone?.trim() || "",
          house_number: editForm.house_number?.trim() || "",
          street: editForm.street?.trim() || "",
          area: editForm.area?.trim() || "",
          landmark: editForm.landmark?.trim() || "",
          city: editForm.city?.trim() || "",
          state: editForm.state?.trim() || "",
          pincode: editForm.pincode?.trim() || "",
          food_preference: editForm.food_preference || "Both",
        },
        { headers }
      );

      const updated = response.data.profile;

      setCustomer(updated);
      setEditForm(updated);

      localStorage.setItem(
        "smartfoodcourt_user",
        JSON.stringify(updated)
      );

      setValidationErrors({});
      setEditing(false);

      alert("Profile updated successfully!");
    } catch (error: any) {
  console.error("Profile Update Error:", error);
  console.error("Backend Response:", error.response?.data);

  const message =
    error.response?.data?.detail ||
    error.response?.data?.message ||
    error.message ||
    "Unable to update your profile. Please try again.";

  alert(message);
}finally {
      setSaving(false);
    }
  };

  // PROFILE PHOTO UPLOAD
  const uploadPhoto = async (file?: File) => {
    if (!file) return;

    if (
      !["image/jpeg", "image/png", "image/webp"].includes(file.type)
    ) {
      showMessage("Please select a JPG, PNG or WEBP image.", true);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showMessage("Profile photo must be 5 MB or smaller.", true);
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setUploadingPhoto(true);
    clearMessages();

    try {
      const response = await axios.post(
        `${API}/customer/profile/photo`,
        formData,
        { headers }
      );

      const updated = {
        ...customer,
        profile_image: response.data.profile_image,
      };

      setCustomer(updated);
      setEditForm(updated);

      localStorage.setItem(
        "smartfoodcourt_user",
        JSON.stringify(updated)
      );

      alert("Profile photo updated successfully!");
    } catch (error: any) {
      showMessage(
        error.response?.data?.detail ||
        "Unable to upload profile photo.",
        true
      );
    } finally {
      setUploadingPhoto(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // REMOVE FAVOURITE
  const removeFavorite = async (foodId: string) => {
    if (removingId) return;

    setRemovingId(foodId);

    try {
      await axios.delete(
        `${API}/api/favorites/${foodId}`,
        { headers }
      );

      setFavorites((previous) =>
        previous.filter(
          (food) => (food._id || food.id) !== foodId
        )
      );

      showMessage("Food removed from your favourites.");
    } catch (error: any) {
      showMessage(
        error.response?.data?.detail ||
        "Unable to remove this favourite.",
        true
      );
    } finally {
      setRemovingId(null);
    }
  };

  // ADD TO CART
  const addToCart = async (food: FavoriteFood) => {
    const foodId = food._id || food.id;

    if (!foodId || addingCartId) return;

    setAddingCartId(foodId);

    try {
      await axios.post(
        `${API}/api/cart/items`,
        {
          food_id: foodId,
          quantity: 1,
        },
        { headers }
      );

      showMessage(
        `${food.name || food.food_name || "Food"} added to cart.`
      );
    } catch (error: any) {
      showMessage(
        error.response?.data?.detail ||
        "Unable to add item to cart.",
        true
      );
    } finally {
      setAddingCartId(null);
    }
  };

  // LOGOUT
  const handleLogout = () => {
    localStorage.removeItem("smartfoodcourt_token");
    localStorage.removeItem("smartfoodcourt_user");

    navigate("/login", { replace: true });
  };

  // DELETE ACCOUNT
  const deleteAccount = async () => {
    if (!deletePassword.trim()) {
      showMessage(
        "Enter your password to confirm account deletion.",
        true
      );
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to permanently delete your Smart FoodCourt account? This action cannot be undone."
    );

    if (!confirmed) return;

    setDeleting(true);
    clearMessages();

    try {
      await axios.delete(
        `${API}/customer/profile/account`,
        {
          headers,
          data: { password: deletePassword },
        }
      );

      localStorage.removeItem("smartfoodcourt_token");
      localStorage.removeItem("smartfoodcourt_user");

      alert("Your account has been deleted.");

      navigate("/register", { replace: true });
    } catch (error: any) {
      showMessage(
        error.response?.data?.detail ||
        "Unable to delete your account.",
        true
      );
    } finally {
      setDeleting(false);
    }
  };

  const menuItems: {
    id: Section;
    label: string;
    icon: typeof UserRound;
  }[] = [
    { id: "profile", label: "Profile", icon: UserRound },
    { id: "payments", label: "Payment Methods", icon: CreditCard },
    { id: "preferences", label: "Food Preferences", icon: Utensils },
    { id: "addresses", label: "My Addresses", icon: MapPin },
    { id: "favorites", label: "My Favourites", icon: Heart },
    { id: "feedback", label: "My Feedback", icon: MessageSquare },
    { id: "delete", label: "Delete Account", icon: Trash2 },
  ];

  const sectionTitles: Record<Section, string> = {
    profile: "My Profile",
    payments: "Payment Methods",
    preferences: "Food Preferences",
    addresses: "My Addresses",
    favorites: "My Favourites",
    feedback: "My Feedback",
    delete: "Delete Account",
  };

  return (
    <main className="account-dashboard">
      <div className="account-dashboard-container">

        {/* SIDEBAR */}
        <aside className="account-sidebar">
          <div className="account-sidebar-user">
            <div className="account-avatar account-avatar-photo">
              {photoUrl ? (
                <img src={photoUrl} alt="Profile" />
              ) : initials}
            </div>

            <div className="account-sidebar-user-info">
              <h2>{customer.name || "Customer"}</h2>
              <p>{customer.email || "Welcome to Smart FoodCourt"}</p>
            </div>
          </div>

          <div className="account-sidebar-label">MY ACCOUNT</div>

          <nav className="account-sidebar-nav">
            {menuItems.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  type="button"
                  key={item.id}
                  className={`account-nav-item ${
                    activeSection === item.id ? "active" : ""
                  } ${item.id === "delete" ? "account-delete-nav" : ""}`}
                  onClick={() => {
                    setActiveSection(item.id);
                    clearMessages();
                  }}
                >
                  <Icon size={19} />
                  <span>{item.label}</span>
                  <ChevronRight size={16} className="account-nav-arrow" />
                </button>
              );
            })}
          </nav>

          <div className="account-sidebar-bottom">
            <Link to="/" className="account-home-link">
              <Home size={18} />
              Back to Home
            </Link>

            <button
              type="button"
              className="account-logout-button account-sidebar-logout"
              onClick={handleLogout}
            >
              <LogOut size={17} />
              Logout
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <section className="account-main-panel">
          <div className="account-panel-header">
            <div>
              <div className="account-breadcrumb">
                <Link to="/">Home</Link>
                <ChevronRight size={14} />
                <span>My Account</span>
              </div>

              <h1>{sectionTitles[activeSection]}</h1>
              <p>Manage your Smart FoodCourt account and preferences.</p>
            </div>

            <div className="account-header-avatar account-avatar-photo">
              {photoUrl ? (
                <img src={photoUrl} alt="Profile" />
              ) : initials}
            </div>
          </div>

          {(message || errorMessage) && (
            <div
              className={`account-action-message ${
                errorMessage ? "error" : ""
              }`}
            >
              <span>{message || errorMessage}</span>

              <button
                type="button"
                onClick={clearMessages}
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* PROFILE */}
          {activeSection === "profile" && (
            <div className="account-section-content">
              <div className="account-content-card">
                <div className="account-card-heading">
                  <div>
                    <h2>Personal Information</h2>
                    <p>View and update your personal account details.</p>
                  </div>

                  {!editing && (
                    <button
                      type="button"
                      className="account-edit-button"
                      onClick={() => {
                        setEditForm(customer);
                        setValidationErrors({});
                        setEditing(true);
                      }}
                    >
                      <Pencil size={15} />
                      Edit Profile
                    </button>
                  )}
                </div>

                <div className="account-profile-summary">
                  <div className="account-large-avatar account-avatar-photo">
                    {photoUrl ? (
                      <img src={photoUrl} alt="Profile" />
                    ) : initials}

                    <button
                      type="button"
                      className="account-photo-edit"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingPhoto}
                      title="Change profile photo"
                    >
                      {uploadingPhoto ? (
                        <span className="account-mini-spinner" />
                      ) : (
                        <Camera size={16} />
                      )}
                    </button>
                  </div>

                  <div>
                    <h3>{customer.name || "Customer"}</h3>
                    <p>{customer.email || "Email not available"}</p>

                    <button
                      type="button"
                      className="account-photo-link"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload size={14} />
                      Change profile photo
                    </button>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      hidden
                      onChange={(event) =>
                        uploadPhoto(event.target.files?.[0])
                      }
                    />
                  </div>
                </div>

                {editing ? (
                  <div className="account-edit-form">
                    <div className="account-edit-grid">

                      {/* CORRECTED INPUT MAPPING */}
                      {profileFields.map(({ field, label }) => (
                        <div className="account-edit-field" key={field}>
                          <label>
                            <span>{label}</span>

                            <input
                              className={
                                validationErrors[field] ? "input-error" : ""
                              }
                              value={String(editForm[field] || "")}
                              onChange={(event) =>
                                updateFormField(field, event.target.value)
                              }
                              type={
                                field === "email" ? "email" : "text"
                              }
                              placeholder={`Enter ${label.toLowerCase()}`}
                            />
                          </label>

                          {validationErrors[field] && (
                            <small className="account-validation-error">
                              {validationErrors[field]}
                            </small>
                          )}
                        </div>
                      ))}

                      {/* FOOD PREFERENCE */}
                      <div className="account-edit-field">
                        <label>
                          <span>Food Preference</span>

                          <select
                            className={
                              validationErrors.food_preference
                                ? "input-error"
                                : ""
                            }
                            value={editForm.food_preference || "Both"}
                            onChange={(event) =>
                              updateFormField(
                                "food_preference",
                                event.target.value
                              )
                            }
                          >
                            <option value="Vegetarian">Vegetarian</option>
                            <option value="Non-vegetarian">
                              Non-vegetarian
                            </option>
                            <option value="Both">Both</option>
                          </select>
                        </label>

                        {validationErrors.food_preference && (
                          <small className="account-validation-error">
                            {validationErrors.food_preference}
                          </small>
                        )}
                      </div>
                    </div>

                    <div className="account-edit-actions">
                      <button
                        type="button"
                        className="account-primary-button"
                        onClick={saveProfile}
                        disabled={saving}
                      >
                        <Save size={16} />
                        {saving ? "Saving..." : "Save Changes"}
                      </button>

                      <button
                        type="button"
                        className="account-cancel-button"
                        onClick={() => {
                          setEditForm(customer);
                          setValidationErrors({});
                          setEditing(false);
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="account-details-grid">
                    <div className="account-detail-item">
                      <span><UserRound size={17} /> Full Name</span>
                      <strong>{customer.name || "Not available"}</strong>
                    </div>

                    <div className="account-detail-item">
                      <span><Mail size={17} /> Email Address</span>
                      <strong>{customer.email || "Not available"}</strong>
                    </div>

                    <div className="account-detail-item">
                      <span><Phone size={17} /> Phone Number</span>
                      <strong>{customer.phone || "Not available"}</strong>
                    </div>

                    <div className="account-detail-item">
                      <span><Phone size={17} /> Alternate Phone</span>
                      <strong>{customer.alternate_phone || "Not added"}</strong>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* PAYMENT METHODS */}
          {activeSection === "payments" && (
            <div className="account-section-content">
              <div className="account-content-card">
                <div className="account-card-heading">
                  <div>
                    <h2>Available Payment Methods</h2>
                    <p>Select your preferred payment option during checkout.</p>
                  </div>
                  <ShieldCheck size={25} className="account-heading-icon" />
                </div>

                <div className="account-payment-list">
                  <div className="account-payment-item">
                    <div className="account-payment-icon upi">
                      <Smartphone size={25} />
                    </div>
                    <div className="account-payment-info">
                      <h3>UPI</h3>
                      <p>Google Pay, PhonePe, Paytm and other UPI apps</p>
                    </div>
                    <span className="account-available-label">Available</span>
                  </div>

                  <div className="account-payment-item">
                    <div className="account-payment-icon card">
                      <CreditCard size={25} />
                    </div>
                    <div className="account-payment-info">
                      <h3>Credit / Debit Card</h3>
                      <p>Pay using your debit or credit card at checkout</p>
                    </div>
                    <span className="account-available-label">Available</span>
                  </div>

                  <div className="account-payment-item">
                    <div className="account-payment-icon cash">
                      <Banknote size={25} />
                    </div>
                    <div className="account-payment-info">
                      <h3>Cash on Delivery</h3>
                      <p>Pay in cash when your delivery arrives</p>
                    </div>
                    <span className="account-available-label">Available</span>
                  </div>
                </div>

                <div className="account-info-notice">
                  <ShieldCheck size={18} />
                  <p>
                    Payment is selected during checkout. Card numbers, CVV
                    and UPI credentials are not stored in your profile.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* FOOD PREFERENCES */}
          {activeSection === "preferences" && (
            <div className="account-section-content">
              <div className="account-content-card">
                <div className="account-card-heading">
                  <div>
                    <h2>Your Food Preference</h2>
                    <p>Your preference helps us make food discovery easier.</p>
                  </div>
                  <Utensils size={25} className="account-heading-icon" />
                </div>

                <div className="account-preference-display">
                  <div className="account-preference-icon">
                    <Leaf size={28} />
                  </div>
                  <div>
                    <span>YOUR CURRENT PREFERENCE</span>
                    <h3>{customer.food_preference || "Not selected"}</h3>
                    <p>This preference is saved in your customer profile.</p>
                  </div>
                </div>

                <button
                  type="button"
                  className="account-primary-button"
                  onClick={() => {
                    setActiveSection("profile");
                    setEditing(true);
                    setEditForm(customer);
                    setValidationErrors({});
                  }}
                >
                  <Pencil size={16} />
                  Update Food Preference
                </button>
              </div>
            </div>
          )}

          {/* ADDRESSES */}
          {activeSection === "addresses" && (
            <div className="account-section-content">
              <div className="account-content-card">
                <div className="account-card-heading">
                  <div>
                    <h2>Saved Address</h2>
                    <p>Manage the address used for food delivery.</p>
                  </div>
                  <MapPin size={25} className="account-heading-icon" />
                </div>

                {address ? (
                  <div className="account-address-card">
                    <div className="account-address-top">
                      <div className="account-address-icon">
                        <Home size={22} />
                      </div>
                      <div>
                        <h3>Home</h3>
                        <span className="account-address-tag">
                          SAVED ADDRESS
                        </span>
                      </div>
                    </div>

                    <p>{address}</p>

                    {customer.phone && (
                      <span className="account-address-phone">
                        <Phone size={15} /> {customer.phone}
                      </span>
                    )}

                    {customer.alternate_phone && (
                      <span className="account-address-phone">
                        <Phone size={15} /> {customer.alternate_phone}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="account-empty-state">
                    <MapPin size={35} />
                    <h3>No address added yet</h3>
                    <p>Add your address for a smoother delivery experience.</p>
                  </div>
                )}

                <button
                  type="button"
                  className="account-primary-button"
                  onClick={() => {
                    setActiveSection("profile");
                    setEditing(true);
                    setEditForm(customer);
                    setValidationErrors({});
                  }}
                >
                  <Pencil size={16} />
                  {address ? "Edit Address" : "Add Address"}
                </button>
              </div>
            </div>
          )}

          {/* FAVOURITES */}
          {activeSection === "favorites" && (
            <div className="account-section-content">
              <div className="account-content-card">
                <div className="account-card-heading">
                  <div>
                    <h2>Your Favourite Food</h2>
                    <p>Food items you have saved from the menu.</p>
                  </div>
                  <Heart size={25} className="account-heading-icon" />
                </div>

                {favoritesLoading ? (
                  <div className="account-empty-state">
                    <div className="account-spinner" />
                    <p>Loading your favourites...</p>
                  </div>
                ) : favorites.length === 0 ? (
                  <div className="account-empty-state">
                    <Heart size={38} />
                    <h3>Your favourites list is empty</h3>
                    <p>
                      Tap the heart on any food item in the menu to save it here.
                    </p>
                    <Link to="/menu" className="account-primary-button">
                      <ShoppingCart size={17} /> Explore Food
                    </Link>
                  </div>
                ) : (
                  <div className="account-favorites-grid">
                    {favorites.map((food) => {
                      const foodName =
                        food.name || food.food_name || "Food Item";
                      const foodId = food._id || food.id || foodName;

                      return (
                        <article
                          className="menu-card account-favorite-card"
                          key={foodId}
                        >
                          <div className="menu-image-wrapper">
                            {food.image ? (
                              <img
                                src={food.image}
                                alt={foodName}
                                className="menu-food-image"
                                loading="lazy"
                              />
                            ) : (
                              <div className="menu-image-placeholder">
                                <span>🍽️</span>
                                <small>Deliciously prepared</small>
                              </div>
                            )}

                            <span className="menu-image-category">
                              {food.category || "Food"}
                            </span>

                            <button
                              type="button"
                              className="menu-favorite-button is-favorite"
                              onClick={() => {
                                if (food._id || food.id) {
                                  removeFavorite(food._id || food.id || "");
                                }
                              }}
                              disabled={removingId === (food._id || food.id)}
                              aria-label={`Remove ${foodName} from favourites`}
                            >
                              <Heart size={20} fill="currentColor" />
                            </button>
                          </div>

                          <div className="menu-card-content">
                            <div className="menu-food-title-row">
                              <h3>{foodName}</h3>
                            </div>

                            <p className="menu-food-description">
                              {food.description ||
                                "A delicious choice, freshly prepared for you."}
                            </p>

                            <div className="menu-restaurant-name">
                              <span className="menu-restaurant-icon">⌂</span>
                              <div>
                                <span className="menu-restaurant-label">
                                  PREPARED BY
                                </span>
                                <strong>
                                  {food.restaurant_name ||
                                    "Restaurant details unavailable"}
                                </strong>
                              </div>
                            </div>

                            <div className="menu-card-bottom">
                              <div className="menu-price">
                                <span>PRICE</span>
                                <strong>
                                  ₹{Number(food.price || 0).toFixed(2)}
                                </strong>
                              </div>

                              <button
                                type="button"
                                className="menu-add-button"
                                onClick={() => addToCart(food)}
                                disabled={addingCartId === (food._id || food.id)}
                              >
                                <span>+</span>
                                {addingCartId === (food._id || food.id)
                                  ? "Adding..."
                                  : "Add to Cart"}
                              </button>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}

                <Link to="/menu" className="account-secondary-link">
                  Browse More Food <ChevronRight size={16} />
                </Link>
              </div>
            </div>
          )}

          {/* FEEDBACK */}
          {activeSection === "feedback" && (
            <div className="account-section-content">
              <div className="account-content-card">
                <div className="account-card-heading">
                  <div>
                    <h2>Your Submitted Feedback</h2>
                    <p>
                      Reviews and ratings you have shared about completed orders.
                    </p>
                  </div>
                  <MessageSquare size={25} className="account-heading-icon" />
                </div>

                {feedbackLoading ? (
                  <div className="account-empty-state">
                    <div className="account-spinner" />
                    <p>Loading your feedback...</p>
                  </div>
                ) : feedback.length === 0 ? (
                  <div className="account-empty-state">
                    <MessageSquare size={38} />
                    <h3>You haven't submitted feedback yet</h3>
                    <p>
                      Your feedback will appear here after you review a completed order.
                    </p>
                    <Link to="/my-orders" className="account-primary-button">
                      View My Orders <ChevronRight size={16} />
                    </Link>
                  </div>
                ) : (
                  <div className="account-feedback-list">
                    {feedback.map((item) => (
                      <article
                        className="account-feedback-card"
                        key={item.feedback_id || item.order_id}
                      >
                        <div className="account-feedback-top">
                          <div>
                            <strong>
                              {item.order_number
                                ? `Order ${item.order_number}`
                                : "Order Feedback"}
                            </strong>
                            <span>
                              {item.created_at
                                ? new Date(item.created_at).toLocaleDateString(
                                    "en-IN",
                                    {
                                      day: "2-digit",
                                      month: "short",
                                      year: "numeric",
                                    }
                                  )
                                : ""}
                            </span>
                          </div>

                          <div
                            className="account-feedback-rating"
                            aria-label={`${item.rating} out of 5 stars`}
                          >
                            {Array.from({ length: 5 }, (_, index) => (
                              <Star
                                key={index}
                                size={16}
                                fill={
                                  index < item.rating
                                    ? "currentColor"
                                    : "none"
                                }
                              />
                            ))}
                          </div>
                        </div>

                        <p className="account-feedback-comment">
                          {item.comment?.trim() ||
                            "No written comment was provided."}
                        </p>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* DELETE ACCOUNT */}
          {activeSection === "delete" && (
            <div className="account-section-content">
              <div className="account-content-card account-danger-card">
                <div className="account-card-heading">
                  <div>
                    <h2>Delete Your Account</h2>
                    <p>
                      Permanently remove your Smart FoodCourt customer account.
                    </p>
                  </div>
                  <AlertTriangle size={26} className="account-danger-icon" />
                </div>

                <div className="account-delete-warning">
                  <AlertTriangle size={22} />
                  <div>
                    <strong>This action cannot be undone.</strong>
                    <p>
                      Your customer profile, favourites, cart and submitted
                      feedback will be deleted. Historical order records will
                      be retained.
                    </p>
                  </div>
                </div>

                <label className="account-delete-password">
                  <span>Enter your password to confirm</span>
                  <input
                    type="password"
                    value={deletePassword}
                    onChange={(event) =>
                      setDeletePassword(event.target.value)
                    }
                    placeholder="Your account password"
                    autoComplete="current-password"
                  />
                </label>

                <button
                  type="button"
                  className="account-delete-confirm"
                  onClick={deleteAccount}
                  disabled={deleting}
                >
                  <Trash2 size={17} />
                  {deleting
                    ? "Deleting Account..."
                    : "Permanently Delete Account"}
                </button>
              </div>
            </div>
          )}

          <footer className="account-dashboard-footer">
            <strong>Smart FoodCourt</strong>
            <span>Eat Smart • Live Better.</span>
          </footer>
        </section>
      </div>
    </main>
  );
}

export default Profile;
