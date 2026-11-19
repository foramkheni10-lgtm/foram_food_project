
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Checkout.css";

const API = "http://127.0.0.1:8000";

type DeliveryType = "dine_in" | "take_away" | "delivery";
type PaymentMethod = "Cash on Delivery" | "UPI" | "Debit Card";

interface Address {
  house_number: string;
  street: string;
  area: string;
  landmark: string;
  city: string;
  state: string;
  pincode: string;
}

interface Customer {
  name?: string;
  email?: string;
  phone?: string;
}

interface CartItem {
  food_id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  subtotal: number;
}

interface Cart {
  items: CartItem[];
  total_items: number;
  total_price: number;
}

interface AvailableTable {
  table_id: string;
  table_number: string;
  capacity: number;
}

const emptyAddress: Address = {
  house_number: "",
  street: "",
  area: "",
  landmark: "",
  city: "",
  state: "",
  pincode: ""
};

function Checkout() {
  const navigate = useNavigate();
  const token = localStorage.getItem("smartfoodcourt_token");

  const [customer, setCustomer] = useState<Customer | null>(null);

  const [cart, setCart] = useState<Cart>({
    items: [],
    total_items: 0,
    total_price: 0
  });

  const [deliveryType, setDeliveryType] =
    useState<DeliveryType>("delivery");

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("Cash on Delivery");

  const [address, setAddress] = useState<Address>(emptyAddress);
  const [addressSaved, setAddressSaved] = useState(false);

  const [tableNumber, setTableNumber] = useState("");
  const [availableTables, setAvailableTables] = useState<AvailableTable[]>([]);
  const [loadingTables, setLoadingTables] = useState(false);
  const [tableError, setTableError] = useState("");

  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState("");

  const [orderNumber, setOrderNumber] = useState("");
  const [orderTotal, setOrderTotal] = useState(0);

  const [confirmedPayment, setConfirmedPayment] =
    useState<PaymentMethod>("Cash on Delivery");

  const [confirmedDelivery, setConfirmedDelivery] =
    useState<DeliveryType>("delivery");

  // LOAD CUSTOMER AND CART
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const savedUser = localStorage.getItem("smartfoodcourt_user");
      setCustomer(savedUser ? JSON.parse(savedUser) : null);
    } catch {
      setCustomer(null);
    }

    const fetchCart = async () => {
      try {
        const response = await axios.get(`${API}/api/cart/`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setCart(response.data);

        if (!response.data.items?.length) {
          navigate("/cart");
        }
      } catch (err: any) {
        setError(
          err.response?.data?.detail ||
          "Unable to load your cart."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [navigate, token]);

  // FETCH AVAILABLE TABLES WHEN DINE-IN IS SELECTED
  useEffect(() => {
    if (deliveryType !== "dine_in" || !token) {
      return;
    }

    let cancelled = false;

    const fetchAvailableTables = async () => {
      setLoadingTables(true);
      setTableError("");
      setTableNumber("");

      try {
        const response = await axios.get(
          `${API}/api/orders/available-tables`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (!cancelled) {
          setAvailableTables(response.data.tables || []);

          if (!response.data.tables?.length) {
            setTableError("No tables are currently available. Please try again later.");
          }
        }
      } catch (err: any) {
        if (!cancelled) {
          setAvailableTables([]);
          setTableError(
            err.response?.data?.detail ||
            "Unable to load available tables."
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingTables(false);
        }
      }
    };

    fetchAvailableTables();

    return () => {
      cancelled = true;
    };
  }, [deliveryType, token]);

  const updateAddress = (field: keyof Address, value: string) => {
    setAddress(prev => ({
      ...prev,
      [field]: value
    }));

    setAddressSaved(false);
    setError("");
  };

  const saveAddress = () => {
    const requiredFields: (keyof Address)[] = [
      "house_number",
      "street",
      "area",
      "city",
      "state",
      "pincode"
    ];

    for (const field of requiredFields) {
      if (!address[field].trim()) {
        setError(
          `Please enter your ${field.replace("_", " ")}.`
        );
        return;
      }
    }

    if (!/^\d{6}$/.test(address.pincode.trim())) {
      setError("Please enter a valid 6-digit pincode.");
      return;
    }

    setAddressSaved(true);
    setError("");
  };

  // PLACE ORDER
  const placeOrder = async () => {
    if (!token || placingOrder) return;

    setError("");

    if (deliveryType === "dine_in" && !tableNumber.trim()) {
      setError("Please select an available table.");
      return;
    }

    if (
      deliveryType === "dine_in" &&
      !availableTables.some(
        table => table.table_number === tableNumber
      )
    ) {
      setError("Please select a valid available table.");
      return;
    }

    if (deliveryType === "delivery" && !addressSaved) {
      setError("Please save your delivery address before placing the order.");
      return;
    }

    setPlacingOrder(true);

    try {
      const response = await axios.post(
        `${API}/api/orders/place`,
        {
          payment_method: paymentMethod,
          delivery_type: deliveryType,
          table_number:
            deliveryType === "dine_in" ? tableNumber : null,
          delivery_address:
            deliveryType === "delivery" ? address : null
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setOrderNumber(response.data.order_number);
      setOrderTotal(response.data.total_price);
      setConfirmedPayment(paymentMethod);
      setConfirmedDelivery(deliveryType);
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
        "Unable to place your order. Please try again."
      );

      // Refresh available tables if another customer reserved one.
      if (err.response?.status === 409 && deliveryType === "dine_in") {
        setTableNumber("");

        try {
          const tableResponse = await axios.get(
            `${API}/api/orders/available-tables`,
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          );

          setAvailableTables(tableResponse.data.tables || []);
        } catch {
          setAvailableTables([]);
        }
      }
    } finally {
      setPlacingOrder(false);
    }
  };

  const deliveryLabel = (type: DeliveryType) => {
    switch (type) {
      case "dine_in":
        return "Dine In";
      case "take_away":
        return "Take Away";
      default:
        return "Delivery";
    }
  };

  if (loading) {
    return <div className="checkout-status">Loading checkout...</div>;
  }

  // ORDER SUCCESS
  if (orderNumber) {
    return (
      <main className="checkout-page">
        <section className="order-success">
          <div className="success-icon">✓</div>
          <h1>Order Placed Successfully!</h1>
          <p>Thank you for ordering with Smart FoodCourt.</p>

          <div className="success-details">
            <div>
              <span>Order Number</span>
              <strong>{orderNumber}</strong>
            </div>

            <div>
              <span>Total Amount</span>
              <strong>₹{orderTotal.toFixed(2)}</strong>
            </div>

            <div>
              <span>Payment Method</span>
              <strong>{confirmedPayment}</strong>
            </div>

            <div>
              <span>Order Type</span>
              <strong>{deliveryLabel(confirmedDelivery)}</strong>
            </div>

            {confirmedDelivery === "delivery" && (
              <div>
                <span>Delivery Address</span>
                <strong>
                  {address.house_number}, {address.street},{" "}
                  {address.area}, {address.city}, {address.state} - {address.pincode}
                </strong>
              </div>
            )}

            {confirmedDelivery === "dine_in" && (
              <div>
                <span>Table Number</span>
                <strong>{tableNumber}</strong>
              </div>
            )}
          </div>

          <p className="checkout-note">
            This is a demo payment flow. No actual payment has been processed.
          </p>

          <button onClick={() => navigate("/my-orders")}>
            View My Orders
          </button>

          <button
            className="continue-shopping"
            onClick={() => navigate("/menu")}
          >
            Continue Shopping
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="checkout-page">
      <header className="checkout-heading">
        <span>SMART FOODCOURT</span>
        <h1>Checkout</h1>
        <p>Select your order type, address and payment method.</p>
      </header>

      {error && <div className="checkout-error">{error}</div>}

      <div className="checkout-layout">
        <section className="checkout-left">

          <div className="checkout-card">
            <h2>Customer Information</h2>

            <div className="checkout-detail">
              <span>Customer Name</span>
              <strong>{customer?.name || "Customer"}</strong>
            </div>

            <div className="checkout-detail">
              <span>Phone Number</span>
              <strong>{customer?.phone || "Not provided"}</strong>
            </div>

            <div className="checkout-detail">
              <span>Email</span>
              <strong>{customer?.email || "Not provided"}</strong>
            </div>
          </div>

          <div className="checkout-card">
            <h2>Choose Order Type</h2>

            <p className="checkout-section-description">
              How would you like to receive your order?
            </p>

            <div className="selection-grid">
              <button
                type="button"
                className={`selection-option ${
                  deliveryType === "dine_in" ? "selected" : ""
                }`}
                onClick={() => {
                  setDeliveryType("dine_in");
                  setTableNumber("");
                  setError("");
                }}
              >
                <span className="selection-icon">🍽️</span>
                <strong>Dine In</strong>
                <small>Enjoy your meal at the restaurant</small>
                <span className="selection-check">
                  {deliveryType === "dine_in" ? "✓" : ""}
                </span>
              </button>

              <button
                type="button"
                className={`selection-option ${
                  deliveryType === "take_away" ? "selected" : ""
                }`}
                onClick={() => {
                  setDeliveryType("take_away");
                  setTableNumber("");
                  setError("");
                }}
              >
                <span className="selection-icon">🥡</span>
                <strong>Take Away</strong>
                <small>Collect your order yourself</small>
                <span className="selection-check">
                  {deliveryType === "take_away" ? "✓" : ""}
                </span>
              </button>

              <button
                type="button"
                className={`selection-option ${
                  deliveryType === "delivery" ? "selected" : ""
                }`}
                onClick={() => {
                  setDeliveryType("delivery");
                  setTableNumber("");
                  setError("");
                }}
              >
                <span className="selection-icon">🛵</span>
                <strong>Delivery</strong>
                <small>Get food at your doorstep</small>
                <span className="selection-check">
                  {deliveryType === "delivery" ? "✓" : ""}
                </span>
              </button>
            </div>

            {/* AVAILABLE TABLE DROPDOWN */}
            {deliveryType === "dine_in" && (
              <div className="table-number-field">
                <label htmlFor="tableNumber">
                  Select Available Table *
                </label>

                {loadingTables ? (
                  <p>Loading available tables...</p>
                ) : (
                  <select
                    id="tableNumber"
                    value={tableNumber}
                    onChange={e => {
                      setTableNumber(e.target.value);
                      setError("");
                    }}
                    disabled={availableTables.length === 0}
                  >
                    <option value="">
                      -- Select a table --
                    </option>

                    {availableTables.map(table => (
                      <option
                        key={table.table_id}
                        value={table.table_number}
                      >
                        Table {table.table_number} ({table.capacity} seats)
                      </option>
                    ))}
                  </select>
                )}

                {tableError && (
                  <p className="checkout-error">
                    {tableError}
                  </p>
                )}

                {tableNumber && (
                  <p className="address-saved-message">
                    ✓ Table {tableNumber} selected
                  </p>
                )}
              </div>
            )}

            {/* DELIVERY ADDRESS */}
            {deliveryType === "delivery" && (
              <div className="checkout-address">
                <h3>Delivery Address</h3>
                <p className="checkout-section-description">
                  Enter the address where you want your food delivered.
                </p>

                <div className="address-form-grid">
                  <div className="address-field">
                    <label htmlFor="houseNumber">House / Flat Number *</label>
                    <input
                      id="houseNumber"
                      value={address.house_number}
                      onChange={e => updateAddress("house_number", e.target.value)}
                      placeholder="e.g. A-102"
                      disabled={addressSaved}
                    />
                  </div>

                  <div className="address-field">
                    <label htmlFor="street">Street *</label>
                    <input
                      id="street"
                      value={address.street}
                      onChange={e => updateAddress("street", e.target.value)}
                      placeholder="Enter street"
                      disabled={addressSaved}
                    />
                  </div>

                  <div className="address-field address-full">
                    <label htmlFor="area">Area / Locality *</label>
                    <input
                      id="area"
                      value={address.area}
                      onChange={e => updateAddress("area", e.target.value)}
                      placeholder="Enter area or locality"
                      disabled={addressSaved}
                    />
                  </div>

                  <div className="address-field address-full">
                    <label htmlFor="landmark">Landmark (Optional)</label>
                    <input
                      id="landmark"
                      value={address.landmark}
                      onChange={e => updateAddress("landmark", e.target.value)}
                      placeholder="Nearby landmark"
                      disabled={addressSaved}
                    />
                  </div>

                  <div className="address-field">
                    <label htmlFor="city">City *</label>
                    <input
                      id="city"
                      value={address.city}
                      onChange={e => updateAddress("city", e.target.value)}
                      placeholder="Enter city"
                      disabled={addressSaved}
                    />
                  </div>

                  <div className="address-field">
                    <label htmlFor="state">State *</label>
                    <input
                      id="state"
                      value={address.state}
                      onChange={e => updateAddress("state", e.target.value)}
                      placeholder="Enter state"
                      disabled={addressSaved}
                    />
                  </div>

                  <div className="address-field address-full">
                    <label htmlFor="pincode">6-Digit Pincode *</label>
                    <input
                      id="pincode"
                      value={address.pincode}
                      onChange={e =>
                        updateAddress(
                          "pincode",
                          e.target.value.replace(/\D/g, "").slice(0, 6)
                        )
                      }
                      placeholder="Enter pincode"
                      inputMode="numeric"
                      maxLength={6}
                      disabled={addressSaved}
                    />
                  </div>
                </div>

                {addressSaved && (
                  <p className="address-saved-message">
                    ✓ Delivery address saved. You can edit it if needed.
                  </p>
                )}

                <button
                  type="button"
                  className="edit-address-button"
                  onClick={() => {
                    if (addressSaved) {
                      setAddressSaved(false);
                    } else {
                      saveAddress();
                    }
                  }}
                >
                  {addressSaved ? "Edit Address" : "Save Address"}
                </button>
              </div>
            )}
          </div>

          {/* PAYMENT METHODS */}
          <div className="checkout-card">
            <h2>Choose Payment Method</h2>

            <p className="checkout-section-description">
              Select how you want to pay for your order.
            </p>

            <div className="payment-list">
              <button
                type="button"
                className={`payment-selection ${
                  paymentMethod === "Cash on Delivery" ? "selected" : ""
                }`}
                onClick={() => setPaymentMethod("Cash on Delivery")}
              >
                <span className="payment-icon">💵</span>
                <span className="payment-text">
                  <strong>Cash on Delivery</strong>
                  <small>Pay when you receive your order</small>
                </span>
                <span className="payment-radio">
                  {paymentMethod === "Cash on Delivery" ? "✓" : ""}
                </span>
              </button>

              <button
                type="button"
                className={`payment-selection ${
                  paymentMethod === "UPI" ? "selected" : ""
                }`}
                onClick={() => setPaymentMethod("UPI")}
              >
                <span className="payment-icon">📱</span>
                <span className="payment-text">
                  <strong>UPI</strong>
                  <small>Google Pay, PhonePe, Paytm etc.</small>
                </span>
                <span className="payment-radio">
                  {paymentMethod === "UPI" ? "✓" : ""}
                </span>
              </button>

              <button
                type="button"
                className={`payment-selection ${
                  paymentMethod === "Debit Card" ? "selected" : ""
                }`}
                onClick={() => setPaymentMethod("Debit Card")}
              >
                <span className="payment-icon">💳</span>
                <span className="payment-text">
                  <strong>Debit Card</strong>
                  <small>Pay using your debit card</small>
                </span>
                <span className="payment-radio">
                  {paymentMethod === "Debit Card" ? "✓" : ""}
                </span>
              </button>
            </div>

            <p className="demo-payment-note">
              Demo mode: UPI and Debit Card selections will not process actual payments.
            </p>
          </div>
        </section>

        {/* ORDER SUMMARY */}
        <aside className="checkout-card checkout-summary">
          <h2>Your Order</h2>

          {cart.items.map(item => (
            <div className="checkout-food" key={item.food_id}>
              <div>
                <strong>{item.name}</strong>
                <span>Quantity: {item.quantity}</span>
              </div>
              <strong>₹{item.subtotal.toFixed(2)}</strong>
            </div>
          ))}

          <div className="checkout-total-row">
            <span>Total Items</span>
            <strong>{cart.total_items}</strong>
          </div>

          <div className="checkout-total-row">
            <span>Subtotal</span>
            <strong>₹{cart.total_price.toFixed(2)}</strong>
          </div>

          <div className="checkout-grand-total">
            <span>Total Amount</span>
            <strong>₹{cart.total_price.toFixed(2)}</strong>
          </div>

          <div className="checkout-selected-details">
            <p>
              <span>Order Type</span>
              <strong>{deliveryLabel(deliveryType)}</strong>
            </p>
            <p>
              <span>Payment</span>
              <strong>{paymentMethod}</strong>
            </p>

            {deliveryType === "dine_in" && tableNumber && (
              <p>
                <span>Selected Table</span>
                <strong>Table {tableNumber}</strong>
              </p>
            )}
          </div>

          <button
            className="place-order-button"
            onClick={placeOrder}
            disabled={
              placingOrder ||
              cart.items.length === 0 ||
              (deliveryType === "dine_in" &&
                (!tableNumber || loadingTables)) ||
              (deliveryType === "delivery" && !addressSaved)
            }
          >
            {placingOrder ? "Placing Order..." : "Place Order"}
          </button>

          <p className="checkout-note">
            Please review your order details before placing your order.
          </p>
        </aside>
      </div>
    </main>
  );
}

export default Checkout;
