
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { CalendarDays, RefreshCw, Star, MessageCircle, ThumbsUp, Trophy } from "lucide-react";

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
    localStorage.getItem("restaurantName") || "Your Restaurant";

  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState("All");

  const fetchFeedback = useCallback(async () => {
    try {
      setError("");

      const response = await axios.get<FeedbackResponse>(
        `${API}/api/restaurant-feedback/my-feedback`,
        getAuthConfig()
      );

      setFeedbacks(response.data.feedbacks || []);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
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

    const interval = window.setInterval(fetchFeedback, 30000);

    return () => window.clearInterval(interval);
  }, [navigate, fetchFeedback]);

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

  const filteredFeedbacks = useMemo(() => {
    const searchText = search.toLowerCase().trim();

    return feedbacks.filter((item) => {
      const matchesSearch = [
        item.customer_name,
        item.customer_email,
        item.comment,
        item.order_number,
        item.order_id,
        item.food_name,
        item.food_item_name,
      ].some((value) =>
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
            <div className="feedback-title-area">
              <span className="feedback-eyebrow">
                CUSTOMER EXPERIENCE
              </span>

              <h1>Customer Feedback</h1>

              <p>
                Read customer reviews and ratings for your restaurant
              </p>
            </div>

            <div className="feedback-header-actions">
              <div className="feedback-restaurant-chip">
                <span className="feedback-restaurant-icon">🍴</span>
                <span>{restaurantName}</span>
              </div>

              <button
                className="feedback-refresh-btn"
                onClick={fetchFeedback}
                disabled={loading}
                title="Refresh feedback"
              >
                <RefreshCw size={17} />
                Refresh
              </button>
            </div>
          </header>

          {error && (
            <div className="feedback-error">
              {error}
              <button onClick={fetchFeedback}>Try Again</button>
            </div>
          )}

          {loading ? (
            <div className="feedback-loading">
              <div className="feedback-loader" />
              <p>Loading customer feedback...</p>
            </div>
          ) : (
            <>
              <section className="feedback-stats">
                <article className="feedback-stat-card">
                  <div className="feedback-stat-icon">
                    <Star size={27} fill="currentColor" />
                  </div>

                  <div className="feedback-stat-content">
                    <h2>
                      {averageRating}
                      <span className="feedback-stat-star">★</span>
                    </h2>
                    <p>Average Rating</p>
                    <div className="feedback-stat-stars">
                      {renderStars(Number(averageRating))}
                    </div>
                  </div>
                </article>

                <article className="feedback-stat-card">
                  <div className="feedback-stat-icon">
                    <MessageCircle size={27} fill="currentColor" />
                  </div>

                  <div className="feedback-stat-content">
                    <h2>{feedbacks.length}</h2>
                    <p>Total Reviews</p>
                    <span>Customer feedback received</span>
                  </div>
                </article>

                <article className="feedback-stat-card">
                  <div className="feedback-stat-icon">
                    <ThumbsUp size={27} fill="currentColor" />
                  </div>

                  <div className="feedback-stat-content">
                    <h2>{positiveReviews}</h2>
                    <p>Positive Reviews</p>
                    <span>Ratings of 4 and 5 stars</span>
                  </div>
                </article>

                <article className="feedback-stat-card">
                  <div className="feedback-stat-icon">
                    <Trophy size={27} fill="currentColor" />
                  </div>

                  <div className="feedback-stat-content">
                    <h2>{fiveStarReviews}</h2>
                    <p>5-Star Reviews</p>
                    <span>Excellent ratings</span>
                  </div>
                </article>
              </section>

              <section className="feedback-reviews-section">
                <div className="feedback-reviews-toolbar">
                  <div>
                    <h2>Customer Reviews</h2>
                    <p>
                      See what customers are saying about your food
                    </p>
                  </div>

                  <div className="feedback-filters">
                    <input
                      type="text"
                      placeholder="Search customer, food, order..."
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
                </div>

                {filteredFeedbacks.length === 0 ? (
                  <div className="feedback-empty">
                    <div className="feedback-empty-icon">💬</div>
                    <h3>No Reviews Found</h3>
                    <p>
                      Customer reviews will appear here after customers
                      submit feedback for their orders.
                    </p>
                  </div>
                ) : (
                  <div className="feedback-review-grid">
                    {filteredFeedbacks.map((item) => {
                      const customerName =
                        item.customer_name || "Customer";

                      const foodName =
                        item.food_name ||
                        item.food_item_name ||
                        "Food item";

                      const reviewDate = formatDate(item.created_at);

                      const orderDate = formatDate(
                        item.order_date || item.order_created_at
                      );

                      return (
                        <article
                          className="feedback-review-card"
                          key={item._id}
                        >
                          <div className="feedback-card-top">
                            <div className="feedback-customer">
                              <div className="feedback-avatar">
                                {item.customer_profile_image ? (
                                  <img
                                    src={item.customer_profile_image}
                                    alt={customerName}
                                    onError={(e) => {
                                      e.currentTarget.style.display = "none";
                                    }}
                                  />
                                ) : (
                                  customerName.charAt(0).toUpperCase()
                                )}
                              </div>

                              <div className="feedback-customer-info">
                                <h3>{customerName}</h3>
                                <p>
                                  <CalendarDays size={13} />
                                  {reviewDate}
                                </p>
                              </div>
                            </div>

                            <div className="feedback-card-rating">
                              {renderStars(item.rating)}
                            </div>
                          </div>

                          <div className="feedback-food-row">
                            <span className="feedback-food-name">
                              {foodName}
                            </span>
                          </div>

                          <p className="feedback-comment">
                            {item.comment?.trim()
                              ? `“${item.comment}”`
                              : "Customer submitted a rating without a written comment."}
                          </p>

                          <div className="feedback-order-info">
                            <span>
                              Order:{" "}
                              <strong>
                                {item.order_number ||
                                  item.order_id ||
                                  "N/A"}
                              </strong>
                            </span>

                            <span>
                              Ordered: <strong>{orderDate}</strong>
                            </span>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </section>
            </>
          )}

          <footer className="feedback-footer">
            <span>Smart FoodCourt</span>
            <span>Feedback refreshes automatically every 30 seconds.</span>
          </footer>
        </main>
      </div>
    </>
  );
}

export default Feedback;
