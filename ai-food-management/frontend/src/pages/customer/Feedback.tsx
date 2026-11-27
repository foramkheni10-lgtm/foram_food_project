import { useEffect, useMemo, useState, type FormEvent } from "react";
import axios from "axios";
import { Star, MessageSquare, Send } from "lucide-react";
import "./Feedback.css";

// Local FastAPI backend
const API_URL = "http://127.0.0.1:8000";

interface Order {
  order_id: string;
  order_number: string;
  order_status: string;
  total_price: number;
  created_at?: string;
}

interface FeedbackItem {
  feedback_id: string;
  order_id?: string;
  order_number: string;
  rating: number;
  comment: string;
  created_at: string;
}

function Feedback() {
  const token = localStorage.getItem("smartfoodcourt_token");

  const [orders, setOrders] = useState<Order[]>([]);
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([]);
  const [selectedOrder, setSelectedOrder] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [historyError, setHistoryError] = useState("");

  const headers = useMemo(
    () => ({
      Authorization: `Bearer ${token}`,
    }),
    [token]
  );

  // Load customer orders and feedback history separately.
  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        setError("Please log in to submit feedback.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");
      setHistoryError("");

      try {
        const ordersResponse = await axios.get(
          `${API_URL}/api/orders/my-orders`,
          { headers }
        );

        setOrders(ordersResponse.data.orders || []);
      } catch (err) {
        console.error("Orders loading error:", err);

        setError(
          axios.isAxiosError(err)
            ? err.response?.data?.detail ||
                "Unable to load your orders. Please try again."
            : "Unable to load your orders. Please try again."
        );

        setLoading(false);
        return;
      }

      // Feedback history failure should not prevent orders from loading.
      try {
        const feedbackResponse = await axios.get(
          `${API_URL}/api/feedback/my-feedback`,
          { headers }
        );

        setFeedbackList(feedbackResponse.data.feedback || []);
      } catch (err) {
        console.error("Feedback history loading error:", err);
        setHistoryError("Unable to load your previous feedback.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, headers]);

  // Identify orders that are eligible for feedback.
  const submittedOrderIds = new Set(
    feedbackList.map((item) => item.order_id).filter(Boolean)
  );

  const submittedOrderNumbers = new Set(
    feedbackList.map((item) => item.order_number).filter(Boolean)
  );

  const eligibleOrders = orders.filter((order) => {
    const status = (order.order_status || "").trim().toLowerCase();

    const isCompleted = [
      "delivered",
      "completed",
      "complete",
    ].includes(status);

    const alreadyReviewed =
      submittedOrderIds.has(order.order_id) ||
      submittedOrderNumbers.has(order.order_number);

    return isCompleted && !alreadyReviewed;
  });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!selectedOrder) {
      setError("Please select an order.");
      return;
    }

    if (rating < 1 || rating > 5) {
      setError("Please select a star rating.");
      return;
    }

    if (!token) {
      setError("Your session has expired. Please log in again.");
      return;
    }

    try {
      setSubmitting(true);

      const response = await axios.post(
        `${API_URL}/api/feedback/submit`,
        {
          order_id: selectedOrder,
          rating,
          comment: comment.trim(),
        },
        {
          headers,
        }
      );

      setMessage(
        response.data.message ||
          "Thank you! Your feedback has been submitted successfully."
      );

      setRating(0);
      setHoverRating(0);
      setComment("");
      setSelectedOrder("");

      // Refresh feedback history after successful submission.
      try {
        const feedbackResponse = await axios.get(
          `${API_URL}/api/feedback/my-feedback`,
          { headers }
        );

        setFeedbackList(feedbackResponse.data.feedback || []);
        setHistoryError("");
      } catch (historyErr) {
        console.error("Feedback refresh error:", historyErr);
        setHistoryError(
          "Your feedback was submitted, but history could not be refreshed."
        );
      }
    } catch (err) {
      console.error("Feedback submission error:", err);

      setError(
        axios.isAxiosError(err)
          ? err.response?.data?.detail ||
              "Unable to submit feedback. Please try again."
          : "Unable to submit feedback. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="feedback-loading">
        Loading feedback...
      </div>
    );
  }

  return (
    <main className="feedback-page">
      <section className="feedback-heading">
        <span className="feedback-eyebrow">
          YOUR EXPERIENCE MATTERS
        </span>

        <h1>Share Your Feedback</h1>

        <p>
          Tell us about your Smart FoodCourt experience. Your feedback
          helps us serve you better.
        </p>
      </section>

      <div className="feedback-container">
        <section className="feedback-form-card">
          <div className="feedback-card-heading">
            <MessageSquare size={23} />

            <div>
              <h2>Write a Review</h2>
              <p>Share your thoughts about your order.</p>
            </div>
          </div>

          {message && (
            <div className="feedback-success">
              {message}
            </div>
          )}

          {error && (
            <div className="feedback-error">
              {error}
            </div>
          )}

          {historyError && (
            <div className="feedback-error">
              {historyError}
            </div>
          )}

          {token ? (
            <form onSubmit={handleSubmit}>
              <label htmlFor="feedback-order">
                Select Order
              </label>

              <select
                id="feedback-order"
                value={selectedOrder}
                onChange={(event) =>
                  setSelectedOrder(event.target.value)
                }
                disabled={eligibleOrders.length === 0}
              >
                <option value="">Choose an order</option>

                {eligibleOrders.map((order) => (
                  <option
                    key={order.order_id}
                    value={order.order_id}
                  >
                    {order.order_number} — ₹
                    {Number(order.total_price || 0).toFixed(2)}
                  </option>
                ))}
              </select>

              <label>Rate Your Experience</label>

              <div className="feedback-stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    className={
                      star <= (hoverRating || rating)
                        ? "active"
                        : ""
                    }
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    aria-label={`Rate ${star} out of 5 stars`}
                  >
                    <Star
                      size={34}
                      fill={
                        star <= (hoverRating || rating)
                          ? "currentColor"
                          : "none"
                      }
                    />
                  </button>
                ))}
              </div>

              <p className="feedback-rating-text">
                {rating === 0
                  ? "Select your rating"
                  : [
                      "",
                      "Poor",
                      "Fair",
                      "Good",
                      "Very Good",
                      "Excellent",
                    ][rating]}
              </p>

              <label htmlFor="feedback-comment">
                Your Comments
              </label>

              <textarea
                id="feedback-comment"
                rows={5}
                maxLength={1000}
                placeholder="Tell us what you liked or what we can improve..."
                value={comment}
                onChange={(event) =>
                  setComment(event.target.value)
                }
              />

              <div className="feedback-character-count">
                {comment.length}/1000
              </div>

              <button
                type="submit"
                className="feedback-submit-button"
                disabled={
                  submitting || eligibleOrders.length === 0
                }
              >
                <Send size={17} />

                {submitting
                  ? "Submitting..."
                  : "Submit Feedback"}
              </button>

              {eligibleOrders.length === 0 && (
                <p className="feedback-note">
                  {orders.length === 0
                    ? "Place an order first to share your feedback."
                    : orders.every((order) =>
                        feedbackList.some(
                          (item) =>
                            item.order_id === order.order_id ||
                            item.order_number === order.order_number
                        )
                      )
                    ? "You have already submitted feedback for your orders."
                    : "You can share feedback after your order is delivered or completed."}
                </p>
              )}
            </form>
          ) : (
            <p>Please log in to share your feedback.</p>
          )}
        </section>

        <section className="feedback-history">
          <h2>Your Previous Feedback</h2>

          {feedbackList.length === 0 ? (
            <div className="feedback-empty">
              <MessageSquare size={35} />
              <p>You haven't submitted any feedback yet.</p>
            </div>
          ) : (
            feedbackList.map((item) => (
              <article
                className="feedback-review"
                key={item.feedback_id}
              >
                <div className="feedback-review-top">
                  <strong>
                    {item.order_number || "Order Review"}
                  </strong>

                  <span>
                    {"★".repeat(item.rating)}
                    {"☆".repeat(5 - item.rating)}
                  </span>
                </div>

                <p>
                  {item.comment || "No written comment."}
                </p>

                <small>
                  {item.created_at
                    ? new Date(
                        item.created_at
                      ).toLocaleDateString("en-IN")
                    : ""}
                </small>
              </article>
            ))
          )}
        </section>
      </div>
    </main>
  );
}

export default Feedback;