
import { useEffect, useState } from "react";
import axios from "axios";
import { Star, MessageSquare, Send } from "lucide-react";
import "./Feedback.css";

interface Order {
  order_id: string;
  order_number: string;
  order_status: string;
  total_price: number;
  created_at?: string;
}

interface FeedbackItem {
  feedback_id: string;
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

  useEffect(() => {
    if (!token) {
      setError("Please log in to submit feedback.");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const [ordersResponse, feedbackResponse] = await Promise.all([
          axios.get("http://127.0.0.1:8000/api/orders/my-orders", {
            headers,
          }),
          axios.get("http://127.0.0.1:8000/api/feedback/my-feedback", {
            headers,
          }),
        ]);

        setOrders(ordersResponse.data.orders || []);
        setFeedbackList(feedbackResponse.data.feedback || []);
      } catch (err) {
        console.error("Feedback loading error:", err);
        setError("Unable to load your orders. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const submittedOrderIds = new Set(
    feedbackList.map((item) => item.order_number)
  );

  const eligibleOrders = orders.filter(
    (order) => !submittedOrderIds.has(order.order_number)
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
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

    try {
      setSubmitting(true);

      const response = await axios.post(
        "http://127.0.0.1:8000/api/feedback/submit",
        {
          order_id: selectedOrder,
          rating,
          comment,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage(response.data.message);
      setRating(0);
      setHoverRating(0);
      setComment("");
      setSelectedOrder("");

      const feedbackResponse = await axios.get(
        "http://127.0.0.1:8000/api/feedback/my-feedback",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setFeedbackList(feedbackResponse.data.feedback || []);
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
          "Unable to submit feedback. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="feedback-loading">Loading feedback...</div>;
  }

  return (
    <main className="feedback-page">
      <section className="feedback-heading">
        <span className="feedback-eyebrow">YOUR EXPERIENCE MATTERS</span>
        <h1>Share Your Feedback</h1>
        <p>
          Tell us about your Smart FoodCourt experience. Your feedback helps us
          serve you better.
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

          {message && <div className="feedback-success">{message}</div>}
          {error && <div className="feedback-error">{error}</div>}

          {token ? (
            <form onSubmit={handleSubmit}>
              <label htmlFor="feedback-order">Select Order</label>
              <select
                id="feedback-order"
                value={selectedOrder}
                onChange={(e) => setSelectedOrder(e.target.value)}
              >
                <option value="">Choose an order</option>
                {eligibleOrders.map((order) => (
                  <option key={order.order_id} value={order.order_id}>
                    {order.order_number} — ₹{order.total_price}
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
                      star <= (hoverRating || rating) ? "active" : ""
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
                  : ["", "Poor", "Fair", "Good", "Very Good", "Excellent"][
                      rating
                    ]}
              </p>

              <label htmlFor="feedback-comment">Your Comments</label>
              <textarea
                id="feedback-comment"
                rows={5}
                maxLength={1000}
                placeholder="Tell us what you liked or what we can improve..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />

              <div className="feedback-character-count">
                {comment.length}/1000
              </div>

              <button
                type="submit"
                className="feedback-submit-button"
                disabled={submitting || eligibleOrders.length === 0}
              >
                <Send size={17} />
                {submitting ? "Submitting..." : "Submit Feedback"}
              </button>

              {eligibleOrders.length === 0 && (
                <p className="feedback-note">
                  {orders.length === 0
                    ? "Place an order first to share your feedback."
                    : "You have already submitted feedback for all your orders."}
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
              <article className="feedback-review" key={item.feedback_id}>
                <div className="feedback-review-top">
                  <strong>{item.order_number}</strong>
                  <span>
                    {"★".repeat(item.rating)}
                    {"☆".repeat(5 - item.rating)}
                  </span>
                </div>
                <p>{item.comment || "No written comment."}</p>
                <small>
                  {item.created_at
                    ? new Date(item.created_at).toLocaleDateString()
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
