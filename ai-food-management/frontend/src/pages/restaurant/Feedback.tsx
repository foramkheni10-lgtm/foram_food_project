
import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";

import RestaurantSidebar from "./RestaurantSidebar";
import "../../styles/restaurant/Feedback.css";

const API = "https://foram-food-project.onrender.com";

interface FeedbackItem {
  _id: string;
  order_id: string;
  order_number?: string;
  order_date?: string;
  order_created_at?: string;
  customer_name: string;
  customer_email?: string;
  customer_profile_image?: string;
  food_name?: string;
  food_item_name?: string;
  rating: number;
  comment: string;
  created_at: string;
  restaurant_name?: string;
}

interface FeedbackResponse {
  success: boolean;
  restaurant_id: string;
  restaurant_name: string;
  total_reviews: number;
  average_rating: number;
  positive_reviews?: number;
  five_star_reviews?: number;
  feedbacks: FeedbackItem[];
}

const getRestaurantToken = () => {
  const possibleKeys = [
    "token",
    "restaurant_token",
    "restaurantToken",
    "access_token",
  ];

  for (const key of possibleKeys) {
    const value = localStorage.getItem(key);

    if (value && value.trim()) {
      return value;
    }
  }

  return null;
};

function Feedback() {
 

  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState("All");
  const [restaurantName, setRestaurantName] = useState(
    localStorage.getItem("restaurantName") || "Restaurant"
  );

  const fetchFeedback = useCallback(async () => {
    try {
      setError("");

      const token = getRestaurantToken();

      if (!token) {
        setError("Restaurant login token not found. Please login again.");
        setLoading(false);
        return;
      }

      const response = await axios.get<FeedbackResponse>(
        `${API}/api/restaurant-feedback/my-feedback`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setFeedbacks(response.data.feedbacks || []);

      if (response.data.restaurant_name) {
        setRestaurantName(response.data.restaurant_name);
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          setError(
            "Restaurant authentication failed. Please logout and login again using your restaurant account."
          );
        } else {
          setError(
            err.response?.data?.detail ||
              "Unable to load customer feedback."
          );
        }
      } else {
        setError("Unable to load customer feedback.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeedback();

    const interval = window.setInterval(fetchFeedback, 30000);

    return () => window.clearInterval(interval);
  }, [fetchFeedback]);

  const averageRating = feedbacks.length
    ? (
        feedbacks.reduce(
          (sum, item) => sum + Number(item.rating || 0),
          0
        ) / feedbacks.length
      ).toFixed(1)
    : "0.0";

  const positiveReviews = feedbacks.filter(
    (item) => Number(item.rating) >= 4
  ).length;

  const fiveStarReviews = feedbacks.filter(
    (item) => Number(item.rating) === 5
  ).length;

  const getRatingCount = (rating: number) =>
    feedbacks.filter(
      (item) => Number(item.rating) === rating
    ).length;

  const filteredFeedbacks = useMemo(() => {
    const searchText = search.toLowerCase().trim();

    return feedbacks.filter((item) => {
      const values = [
        item.customer_name,
        item.customer_email,
        item.comment,
        item.order_number,
        item.order_id,
        item.food_name,
        item.food_item_name,
      ];

      const matchesSearch =
        !searchText ||
        values.some((value) =>
          (value || "").toLowerCase().includes(searchText)
        );

      const matchesRating =
        ratingFilter === "All" ||
        Number(item.rating) === Number(ratingFilter);

      return matchesSearch && matchesRating;
    });
  }, [feedbacks, search, ratingFilter]);

  const formatDate = (date?: string) => {
    if (!date) return "Date unavailable";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Date unavailable";
    }

    return parsedDate.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const renderStars = (rating: number) => {
    const safeRating = Math.max(
      0,
      Math.min(5, Math.round(Number(rating) || 0))
    );

    return (
      <span className="feedback-stars">
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
                See what customers are saying about your food at{" "}
                {restaurantName}.
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
                <div className="feedback-stat-card">
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
                    <span>Customer reviews received</span>
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
                        See what customers are saying about your food
                      </p>
                    </div>

                    <span>
                      {filteredFeedbacks.length} reviews
                    </span>
                  </div>

                  <div className="feedback-toolbar">
                    <input
                      type="text"
                      placeholder="Search customer, food, order or comment..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />

                    <select
                      value={ratingFilter}
                      onChange={(e) =>
                        setRatingFilter(e.target.value)
                      }
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
                          Customer reviews will appear here when
                          customers submit feedback for their orders.
                        </p>
                      </div>
                    ) : (
                      filteredFeedbacks.map((item) => {
                        const customerName =
                          item.customer_name || "Customer";

                        const foodName =
                          item.food_name ||
                          item.food_item_name ||
                          "Food item";

                        const orderDate =
                          item.order_date || item.order_created_at;

                        return (
                          <article
                            className="feedback-review-card"
                            key={item._id}
                          >
                            <div className="feedback-review-top">
                              <div className="feedback-customer">
                                <div className="feedback-avatar">
                                  {item.customer_profile_image ? (
                                    <img
                                      src={item.customer_profile_image}
                                      alt={customerName}
                                      onError={(e) => {
                                        e.currentTarget.style.display =
                                          "none";
                                      }}
                                    />
                                  ) : (
                                    customerName.charAt(0).toUpperCase()
                                  )}
                                </div>

                                <div className="feedback-customer-info">
                                  <h3>{customerName}</h3>
                                  <p>
                                    {item.customer_email ||
                                      "Email unavailable"}
                                  </p>
                                </div>
                              </div>

                              <div className="feedback-review-rating">
                                {renderStars(item.rating)}
                                <strong>
                                  {Number(item.rating || 0).toFixed(1)}
                                </strong>
                              </div>
                            </div>

                            <div className="feedback-order-details">
                              <div>
                                <span>ORDER ID</span>
                                <strong>
                                  {item.order_number ||
                                    item.order_id ||
                                    "N/A"}
                                </strong>
                              </div>

                              <div>
                                <span>FOOD ITEM</span>
                                <strong>{foodName}</strong>
                              </div>

                              <div>
                                <span>ORDER DATE</span>
                                <strong>
                                  {formatDate(orderDate)}
                                </strong>
                              </div>
                            </div>

                            <div className="feedback-comment-section">
                              <span className="feedback-comment-label">
                                CUSTOMER COMMENT
                              </span>

                              <p className="feedback-comment">
                                {item.comment?.trim()
                                  ? `“${item.comment}”`
                                  : "Customer submitted a rating without a written comment."}
                              </p>
                            </div>

                            <div className="feedback-review-footer">
                              <span>
                                <strong>Review submitted:</strong>{" "}
                                {formatDate(item.created_at)}
                              </span>
                            </div>
                          </article>
                        );
                      })
                    )}
                  </div>
                </div>

                <aside className="feedback-rating-breakdown">
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
