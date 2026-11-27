
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import RestaurantSidebar from "./RestaurantSidebar";
import "../../styles/restaurant/Feedback.css";

const API = "http://127.0.0.1:8000";

interface FeedbackItem {
  _id: string;
  order_id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  rating: number;
  comment: string;
  created_at: string;
  restaurant_name: string;
}

interface FeedbackResponse {
  success: boolean;
  restaurant_id: string;
  restaurant_name: string;
  total_reviews: number;
  average_rating: number;
  feedbacks: FeedbackItem[];
}

const getAuthConfig = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Session expired. Please login again.");
  }

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

function Feedback() {
  const navigate = useNavigate();

  const restaurantName =
    localStorage.getItem("restaurantName") || "Restaurant";

  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState("All");

  const fetchFeedback = useCallback(async () => {
    try {
      setError("");

      const config = getAuthConfig();

      const response = await axios.get<FeedbackResponse>(
        `${API}/api/restaurant-feedback/my-feedback`,
        config
      );

      setFeedbacks(response.data.feedbacks || []);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;

        if (status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }

        setError(
          err.response?.data?.detail ||
            "Unable to load customer feedback."
        );
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unable to load customer feedback.");
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login");
      return;
    }

    fetchFeedback();

    const interval = setInterval(fetchFeedback, 30000);

    return () => clearInterval(interval);
  }, [navigate, fetchFeedback]);

  const averageRating = feedbacks.length
    ? (
        feedbacks.reduce((sum, item) => sum + item.rating, 0) /
        feedbacks.length
      ).toFixed(1)
    : "0.0";

  const positiveReviews = feedbacks.filter(
    (item) => item.rating >= 4
  ).length;

  const fiveStarReviews = feedbacks.filter(
    (item) => item.rating === 5
  ).length;

  const getRatingCount = (rating: number) =>
    feedbacks.filter((item) => item.rating === rating).length;

  const filteredFeedbacks = useMemo(() => {
    return feedbacks.filter((item) => {
      const searchText = search.toLowerCase().trim();

      const matchesSearch =
        (item.customer_name || "").toLowerCase().includes(searchText) ||
        (item.customer_email || "").toLowerCase().includes(searchText) ||
        (item.comment || "").toLowerCase().includes(searchText) ||
        (item.order_number || "").toLowerCase().includes(searchText);

      const matchesRating =
        ratingFilter === "All" ||
        item.rating === Number(ratingFilter);

      return matchesSearch && matchesRating;
    });
  }, [feedbacks, search, ratingFilter]);

  const formatDate = (date: string) => {
    if (!date) return "Date unavailable";

    return new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const renderStars = (rating: number) => {
    const safeRating = Math.max(0, Math.min(5, rating));

    return (
      <span
        className="feedback-stars"
        aria-label={`${safeRating} out of 5 stars`}
      >
        {"★".repeat(safeRating)}
        <span className="feedback-empty-stars">
          {"★".repeat(5 - safeRating)}
        </span>
      </span>
    );
  };

  return (
    <>
      <RestaurantSidebar />

      <div className="restaurant-content-area">
        <main className="feedback-page">
          <header className="feedback-header">
            <div>
              <span className="feedback-eyebrow">
                CUSTOMER EXPERIENCE
              </span>

              <h1>Customer Feedback</h1>

              <p>
                Read customer reviews and ratings for {restaurantName}.
              </p>
            </div>

            <button
              className="feedback-refresh-btn"
              onClick={fetchFeedback}
              disabled={loading}
            >
              ↻ Refresh
            </button>
          </header>

          {error && (
            <div className="feedback-error">
              {error}
              <button onClick={fetchFeedback}>Try Again</button>
            </div>
          )}

          {loading ? (
            <div className="feedback-loading">
              <span>⏳</span>
              <p>Loading customer feedback...</p>
            </div>
          ) : (
            <>
              <section className="feedback-stats">
                <div className="feedback-stat-card rating-stat">
                  <div className="feedback-stat-icon">⭐</div>

                  <div>
                    <p>Average Rating</p>
                    <h2>{averageRating} / 5</h2>
                    {renderStars(Number(averageRating))}
                  </div>
                </div>

                <div className="feedback-stat-card">
                  <div className="feedback-stat-icon">💬</div>

                  <div>
                    <p>Total Reviews</p>
                    <h2>{feedbacks.length}</h2>
                    <span>Reviews received for orders</span>
                  </div>
                </div>

                <div className="feedback-stat-card">
                  <div className="feedback-stat-icon">👍</div>

                  <div>
                    <p>Positive Reviews</p>
                    <h2>{positiveReviews}</h2>
                    <span>Ratings of 4 and 5 stars</span>
                  </div>
                </div>

                <div className="feedback-stat-card">
                  <div className="feedback-stat-icon">🌟</div>

                  <div>
                    <p>5-Star Reviews</p>
                    <h2>{fiveStarReviews}</h2>
                    <span>Excellent customer ratings</span>
                  </div>
                </div>
              </section>

              <section className="feedback-content-grid">
                <div className="feedback-main-section">
                  <div className="feedback-section-heading">
                    <div>
                      <h2>Customer Reviews</h2>
                      <p>
                        One rating and comment for each completed order.
                      </p>
                    </div>

                    <span>{filteredFeedbacks.length} reviews</span>
                  </div>

                  <div className="feedback-toolbar">
                    <input
                      type="text"
                      placeholder="Search customer, order or comment..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />

                    <select
                      value={ratingFilter}
                      onChange={(e) => setRatingFilter(e.target.value)}
                    >
                      <option value="All">All Ratings</option>
                      <option value="5">5 Stars</option>
                      <option value="4">4 Stars</option>
                      <option value="3">3 Stars</option>
                      <option value="2">2 Stars</option>
                      <option value="1">1 Star</option>
                    </select>
                  </div>

                  <div className="feedback-review-list">
                    {filteredFeedbacks.length === 0 ? (
                      <div className="feedback-empty">
                        <span>💬</span>
                        <h3>No Reviews Found</h3>
                        <p>
                          Customer reviews will appear here after customers
                          submit feedback for their completed orders.
                        </p>
                      </div>
                    ) : (
                      filteredFeedbacks.map((item) => (
                        <article
                          className="feedback-review-card"
                          key={item._id}
                        >
                          <div className="feedback-review-top">
                            <div className="feedback-customer">
                              <div className="feedback-avatar">
                                {(item.customer_name || "C")
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>

                              <div>
                                <h3>
                                  {item.customer_name || "Customer"}
                                </h3>

                                <p>
                                  {item.customer_email ||
                                    "Email unavailable"}
                                </p>
                              </div>
                            </div>

                            <div className="feedback-review-rating">
                              {renderStars(item.rating)}
                              <strong>{item.rating}.0</strong>
                            </div>
                          </div>

                          <p className="feedback-comment">
                            {item.comment?.trim()
                              ? `"${item.comment}"`
                              : "Customer submitted a rating without a written comment."}
                          </p>

                          <div className="feedback-review-footer">
                            <span>
                              Order:{" "}
                              {item.order_number || item.order_id || "N/A"}
                            </span>

                            <span>{formatDate(item.created_at)}</span>
                          </div>
                        </article>
                      ))
                    )}
                  </div>
                </div>

                <aside className="feedback-sidebar">
                  <section className="feedback-rating-breakdown">
                    <h2>Rating Breakdown</h2>
                    <p>Customer rating distribution</p>

                    {[5, 4, 3, 2, 1].map((rating) => {
                      const count = getRatingCount(rating);

                      const percentage = feedbacks.length
                        ? (count / feedbacks.length) * 100
                        : 0;

                      return (
                        <div
                          className="feedback-breakdown-row"
                          key={rating}
                        >
                          <span>{rating} ★</span>

                          <div className="feedback-progress">
                            <div
                              style={{ width: `${percentage}%` }}
                            />
                          </div>

                          <strong>{count}</strong>
                        </div>
                      );
                    })}
                  </section>
                </aside>
              </section>
            </>
          )}

          <footer className="feedback-footer">
            Feedback refreshes automatically every 30 seconds.
          </footer>
        </main>
      </div>
    </>
  );
}

export default Feedback;
