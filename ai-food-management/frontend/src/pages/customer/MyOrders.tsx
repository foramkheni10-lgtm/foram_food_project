
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Star, Send } from "lucide-react";
import "./MyOrders.css";
import LiveDeliveryMap from "./LiveDeliveryMap";

interface Customization {
  group?: string;
  name?: string;
  option: string;
  additional_price: number;
}

interface OrderItem {
  cart_item_id?: string;
  food_id: string;
  name: string;
  category: string;
  price: number;
  base_price?: number;
  customization_total?: number;
  quantity: number;
  subtotal: number;
  customizations?: Customization[];
  special_instructions?: string;
}

interface Order {
  order_id: string;
  order_number: string;
  items: OrderItem[];
  total_items: number;
  total_price: number;
  payment_method: string;
  payment_status: string;
  order_status: string;
  delivery_type: string;
  table_number?: string | null;
  delivery_address?: {
    house_number?: string;
    street?: string;
    area?: string;
    landmark?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  created_at: string;
}

interface FeedbackItem {
  feedback_id: string;
  order_id: string;
  order_number: string;
  rating: number;
  comment: string;
  created_at: string;
}

const trackingSteps = [
  "Placed",
  "Confirmed",
  "Preparing",
  "Ready",
  "Delivered",
];

function MyOrders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState<Order[]>([]);
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const [feedbackOrder, setFeedbackOrder] = useState<string | null>(null);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [comments, setComments] = useState<Record<string, string>>({});
  const [submittingOrder, setSubmittingOrder] = useState<string | null>(null);
  const [feedbackMessages, setFeedbackMessages] = useState<
    Record<string, string>
  >({});
  const [feedbackErrors, setFeedbackErrors] = useState<
    Record<string, string>
  >({});

  const getToken = () =>
    localStorage.getItem("smartfoodcourt_token");

  // FETCH CUSTOMER FEEDBACK
  const fetchFeedback = async (token: string) => {
    try {
      const response = await axios.get(
        "http://127.0.0.1:8000/api/feedback/my-feedback",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setFeedbackList(response.data.feedback || []);
    } catch (err) {
      console.error("Unable to load feedback:", err);
    }
  };

  // FETCH CUSTOMER ORDERS
  useEffect(() => {
    const fetchOrders = async () => {
      const token = getToken();

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await axios.get(
          "http://127.0.0.1:8000/api/orders/my-orders",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setOrders(response.data.orders || []);
        setError("");

        await fetchFeedback(token);
      } catch (err: any) {
        if (err.response?.status === 401) {
          localStorage.removeItem("smartfoodcourt_token");
          localStorage.removeItem("smartfoodcourt_user");
          navigate("/login");
        } else {
          setError(
            err.response?.data?.detail || "Unable to load your orders."
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();

    const intervalId = window.setInterval(fetchOrders, 10000);

    return () => window.clearInterval(intervalId);
  }, [navigate]);

  // FORMAT DATE
  const formatDate = (date: string) => {
    return new Date(date).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // DELIVERY TYPE LABEL
  const deliveryLabel = (type: string) => {
    if (type === "dine_in") return "Dine In";
    if (type === "take_away") return "Take Away";
    return "Delivery";
  };

  // TRACKING STATUS
  const getCurrentStep = (status: string) => {
    return trackingSteps.findIndex(
      (step) => step.toLowerCase() === status?.toLowerCase()
    );
  };

  // CHECK WHETHER ORDER IS COMPLETE
  const isOrderComplete = (status: string) => {
    const completedStatuses = ["delivered", "completed", "complete"];

    return completedStatuses.includes(
      (status || "").trim().toLowerCase()
    );
  };

  // CHECK WHETHER THIS ORDER ALREADY HAS FEEDBACK
  const getOrderFeedback = (orderId: string) => {
    return feedbackList.find(
      (feedback) => feedback.order_id === orderId
    );
  };

  // SUBMIT FEEDBACK FOR A PARTICULAR ORDER
  const handleFeedbackSubmit = async (
    order: Order,
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const orderId = order.order_id;
    const rating = ratings[orderId] || 0;
    const comment = comments[orderId] || "";
    const token = getToken();

    setFeedbackErrors((previous) => ({
      ...previous,
      [orderId]: "",
    }));

    setFeedbackMessages((previous) => ({
      ...previous,
      [orderId]: "",
    }));

    if (!token) {
      navigate("/login");
      return;
    }

    if (rating < 1 || rating > 5) {
      setFeedbackErrors((previous) => ({
        ...previous,
        [orderId]: "Please select a star rating.",
      }));
      return;
    }

    try {
      setSubmittingOrder(orderId);

      const response = await axios.post(
        "http://127.0.0.1:8000/api/feedback/submit",
        {
          order_id: orderId,
          rating,
          comment,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setFeedbackMessages((previous) => ({
        ...previous,
        [orderId]: response.data.message,
      }));

      setRatings((previous) => ({
        ...previous,
        [orderId]: 0,
      }));

      setComments((previous) => ({
        ...previous,
        [orderId]: "",
      }));

      setFeedbackOrder(null);

      await fetchFeedback(token);
    } catch (err: any) {
      setFeedbackErrors((previous) => ({
        ...previous,
        [orderId]:
          err.response?.data?.detail ||
          "Unable to submit feedback. Please try again.",
      }));
    } finally {
      setSubmittingOrder(null);
    }
  };

  if (loading) {
    return (
      <div className="orders-message">
        Loading your orders...
      </div>
    );
  }

  if (error) {
    return (
      <div className="orders-message orders-error">
        {error}
        <button onClick={() => window.location.reload()}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="my-orders-page">
      <div className="orders-container">

        {/* PAGE HEADER */}
        {/* PAGE HERO */}
<section className="orders-hero">
  <span className="orders-hero-eyebrow">
    <Star size={15} />
    SMART FOODCOURT • ORDER HISTORY
  </span>

  <h1>
    Your Orders, <span>Made Delicious</span>
  </h1>

  <p>
    Track your food orders, follow delivery progress
    and revisit your delicious experiences.
  </p>

  
</section>

        {/* ORDER COUNT */}
        <div className="orders-count">
          <strong>{orders.length}</strong>
          <span>
            {orders.length === 1 ? "Order" : "Orders"} placed
          </span>
        </div>

        {/* EMPTY ORDERS */}
        {orders.length === 0 ? (
          <div className="orders-empty">
            <div className="empty-icon">🛍️</div>
            <h2>No orders yet</h2>
            <p>Your delicious journey starts with your first order.</p>

            <button onClick={() => navigate("/menu")}>
              Browse Food
            </button>
          </div>
        ) : (

          /* ORDERS LIST */
          <div className="orders-list">
            {orders.map((order) => {
              const currentIndex = getCurrentStep(order.order_status);
              const completed = isOrderComplete(order.order_status);
              const submittedFeedback = getOrderFeedback(order.order_id);

              return (
                <div className="order-card" key={order.order_id}>

                  {/* ORDER HEADER */}
                  <div className="order-card-top">
                    <div>
                      <span className="order-label">
                        ORDER NUMBER
                      </span>

                      <h3>{order.order_number}</h3>

                      <p className="order-date">
                        {formatDate(order.created_at)}
                      </p>
                    </div>

                    <span className="order-status">
                      {order.order_status}
                    </span>
                  </div>

{/* DELIVERY NOTIFICATION */}
{completed && (
  <div className="delivery-notification">
    <div className="delivery-notification-icon">
      ✓
    </div>

    <div className="delivery-notification-content">
      <strong>
        {order.order_status.toLowerCase() === "delivered"
          ? "Your order has been delivered!"
          : "Your order is completed!"}
      </strong>

      <p>
        We hope you enjoyed your meal. Thank you for choosing
        Smart FoodCourt!
      </p>

      {submittedFeedback ? (
        <span className="delivery-feedback-done">
          ✓ Feedback already submitted
        </span>
      ) : (
        <button
          type="button"
          className="delivery-feedback-button"
          onClick={() => {
            setExpandedOrder(order.order_id);
            setFeedbackOrder(order.order_id);
          }}
        >
          <Star size={16} />
          Give Feedback
        </button>
      )}
    </div>
  </div>
)}

                  {/* ORDER TRACKING */}
                  <div className="order-tracking">
                    <h4>Order Progress</h4>

                    <div className="tracking-timeline">
                      {trackingSteps.map((step, index) => {
                        const isStepCompleted =
                          currentIndex >= index && currentIndex !== -1;

                        const active = currentIndex === index;

                        return (
                          <div
                            className={`tracking-step ${
                              isStepCompleted ? "completed" : ""
                            } ${active ? "active" : ""}`}
                            key={step}
                          >
                            <span className="tracking-circle">
                              {isStepCompleted ? "✓" : index + 1}
                            </span>

                            <span className="tracking-label">
                              {step}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {currentIndex === -1 && (
                      <p className="tracking-note">
                        Current status: {order.order_status}
                      </p>
                    )}
                  </div>
                  {order.delivery_type === "delivery" && !completed && (
 <LiveDeliveryMap
  orderNumber={order.order_number}
  orderId={order.order_id}
/>
)}

                  {/* ORDER SUMMARY */}
                  <div className="order-summary">
                    <div>
                      <span>Order Type</span>
                      <strong>
                        {deliveryLabel(order.delivery_type)}
                      </strong>
                    </div>

                    <div>
                      <span>Items</span>
                      <strong>{order.total_items}</strong>
                    </div>

                    <div>
                      <span>Payment</span>
                      <strong>{order.payment_method}</strong>
                    </div>

                    <div>
                      <span>Total Amount</span>
                      <strong className="order-price">
                        ₹{Number(order.total_price).toFixed(2)}
                      </strong>
                    </div>
                  </div>

                  {/* ORDER FOOTER */}
                  <div className="order-card-bottom">
                    <span className="payment-status">
                      Payment: {order.payment_status}
                    </span>

                    <button
                      className="view-order-button"
                      onClick={() =>
                        setExpandedOrder(
                          expandedOrder === order.order_id
                            ? null
                            : order.order_id
                        )
                      }
                    >
                      {expandedOrder === order.order_id
                        ? "Hide Details"
                        : "View Details"}

                      <span>
                        {expandedOrder === order.order_id ? "−" : "+"}
                      </span>
                    </button>
                  </div>

                  {/* EXPANDED ORDER DETAILS */}
                  {expandedOrder === order.order_id && (
                    <div className="order-details">
                      <h4>Ordered Items</h4>

                      {order.items.map((item, index) => (
  <div
    className="order-food-item"
    key={item.cart_item_id || `${item.food_id}-${index}`}
  >
    <div>
      <strong>{item.name}</strong>

      <span>
        ₹{Number(item.price).toFixed(2)} × {item.quantity}
      </span>

      {item.customizations && item.customizations.length > 0 && (
        <div className="order-customizations">
          <strong>Customizations</strong>

          {item.customizations.map((option, optionIndex) => (
            <p key={optionIndex}>
              {option.group || option.name || "Option"}: {option.option}

              {Number(option.additional_price) > 0 &&
                ` (+₹${Number(option.additional_price).toFixed(2)})`}
            </p>
          ))}
        </div>
      )}

      {item.special_instructions && (
        <div className="order-special-instructions">
          <strong>Special Instructions</strong>
          <p>{item.special_instructions}</p>
        </div>
      )}
    </div>

    <strong>
      ₹{Number(item.subtotal).toFixed(2)}
    </strong>
  </div>
))}

                      <div className="order-detail-total">
                        <span>Total</span>

                        <strong>
                          ₹{Number(order.total_price).toFixed(2)}
                        </strong>
                      </div>

                      {order.delivery_type === "dine_in" && (
                        <p className="order-extra">
                          Table Number:{" "}
                          <strong>
                            {order.table_number || "Not specified"}
                          </strong>
                        </p>
                      )}

                      {order.delivery_type === "delivery" &&
                        order.delivery_address && (
                          <div className="order-address">
                            <h4>Delivery Address</h4>

                            <p>
                              {order.delivery_address.house_number},{" "}
                              {order.delivery_address.street},{" "}
                              {order.delivery_address.area}

                              {order.delivery_address.landmark
                                ? `, ${order.delivery_address.landmark}`
                                : ""}

                              , {order.delivery_address.city},{" "}
                              {order.delivery_address.state} -{" "}
                              {order.delivery_address.pincode}
                            </p>
                          </div>
                        )}

                      {order.delivery_type === "take_away" && (
                        <p className="order-extra">
                          Order Type: <strong>Take Away</strong>
                        </p>
                      )}

                      {/* ORDER-SPECIFIC FEEDBACK */}
                      <div className="order-feedback-section">
                        <div className="order-feedback-heading">
                          <h4>Rate This Order</h4>
                          <p>
                            Share your experience with this order.
                          </p>
                        </div>

                        {!completed ? (
                          <div className="order-feedback-pending">
                            Feedback will be available after your order
                            is delivered or completed.
                          </div>
                        ) : submittedFeedback ? (
                          <div className="order-feedback-submitted">
                            <strong>✓ Feedback Submitted</strong>

                            <div className="order-feedback-stars-display">
                              {"★".repeat(submittedFeedback.rating)}
                              {"☆".repeat(5 - submittedFeedback.rating)}
                            </div>

                            <p>
                              {submittedFeedback.comment ||
                                "Thank you for sharing your experience!"}
                            </p>

                            <small>
                              Thank you for choosing Smart FoodCourt.
                            </small>
                          </div>
                        ) : (
                          <>
                            {feedbackMessages[order.order_id] && (
                              <div className="feedback-inline-success">
                                {feedbackMessages[order.order_id]}
                              </div>
                            )}

                            {feedbackErrors[order.order_id] && (
                              <div className="feedback-inline-error">
                                {feedbackErrors[order.order_id]}
                              </div>
                            )}

                            {feedbackOrder !== order.order_id ? (
                              <button
                                type="button"
                                className="order-feedback-button"
                                onClick={() =>
                                  setFeedbackOrder(order.order_id)
                                }
                              >
                                <Star size={17} />
                                Give Feedback
                              </button>
                            ) : (
                              <form
                                className="order-feedback-form"
                                onSubmit={(event) =>
                                  handleFeedbackSubmit(order, event)
                                }
                              >
                                <label>How was your experience?</label>

                                <div className="order-feedback-rating">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                      type="button"
                                      key={star}
                                      className={
                                        star <=
                                        (ratings[order.order_id] || 0)
                                          ? "selected"
                                          : ""
                                      }
                                      onClick={() =>
                                        setRatings((previous) => ({
                                          ...previous,
                                          [order.order_id]: star,
                                        }))
                                      }
                                      aria-label={`Rate ${star} stars`}
                                    >
                                      <Star
                                        size={30}
                                        fill={
                                          star <=
                                          (ratings[order.order_id] || 0)
                                            ? "currentColor"
                                            : "none"
                                        }
                                      />
                                    </button>
                                  ))}
                                </div>

                                <label
                                  htmlFor={`comment-${order.order_id}`}
                                >
                                  Your Comments
                                </label>

                                <textarea
                                  id={`comment-${order.order_id}`}
                                  rows={4}
                                  maxLength={1000}
                                  placeholder="Tell us about your food and ordering experience..."
                                  value={comments[order.order_id] || ""}
                                  onChange={(event) =>
                                    setComments((previous) => ({
                                      ...previous,
                                      [order.order_id]: event.target.value,
                                    }))
                                  }
                                />

                                <div className="order-feedback-actions">
                                  <button
                                    type="button"
                                    className="order-feedback-cancel"
                                    onClick={() =>
                                      setFeedbackOrder(null)
                                    }
                                  >
                                    Cancel
                                  </button>

                                  <button
                                    type="submit"
                                    className="order-feedback-submit"
                                    disabled={
                                      submittingOrder === order.order_id
                                    }
                                  >
                                    <Send size={15} />
                                    {submittingOrder === order.order_id
                                      ? "Submitting..."
                                      : "Submit Feedback"}
                                  </button>
                                </div>
                              </form>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyOrders;
