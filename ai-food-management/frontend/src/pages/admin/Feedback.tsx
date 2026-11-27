
import { useEffect, useMemo, useState } from "react";
import {
  MessageSquare,
  Star,
  Search,
  Filter,
  ThumbsUp,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import api from "../../services/api";
import "./Feedback.css";

interface FeedbackItem {
  id: string;
  customer: string;
  email: string;
  restaurant: string;
  order_number: string;
  comment: string;
  rating: number;
  status: "Positive" | "Needs Attention";
  date: string | null;
}

interface FeedbackResponse {
  success: boolean;
  totalFeedback: number;
  averageRating: number;
  positiveCount: number;
  attentionCount: number;
  feedback: FeedbackItem[];
}

function Feedback() {
  const [feedbackData, setFeedbackData] = useState<FeedbackItem[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get<FeedbackResponse>(
        "/api/admin/feedback/"
      );

      setFeedbackData(response.data.feedback || []);
    } catch (err: any) {
      console.error(
        "Admin feedback error:",
        err.response?.status,
        err.response?.data || err.message
      );

      setError(
        err.response?.data?.detail ||
        "Unable to load customer feedback."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  const filteredFeedback = useMemo(() => {
    return feedbackData.filter((item) => {
      const searchText = search.toLowerCase();

      const matchesSearch = [
        item.customer,
        item.email,
        item.restaurant,
        item.order_number,
        item.comment,
      ].some((value) =>
        String(value || "").toLowerCase().includes(searchText)
      );

      const matchesFilter =
        filter === "All" ||
        (filter === "Positive" && item.rating >= 4) ||
        (filter === "Needs Attention" &&
          item.rating > 0 &&
          item.rating <= 3);

      return matchesSearch && matchesFilter;
    });
  }, [feedbackData, search, filter]);

  const totalFeedback = feedbackData.length;

  const averageRating = totalFeedback
    ? (
        feedbackData.reduce(
          (sum, item) => sum + item.rating,
          0
        ) / totalFeedback
      ).toFixed(1)
    : "0.0";

  const positiveCount = feedbackData.filter(
    (item) => item.rating >= 4
  ).length;

  const attentionCount = feedbackData.filter(
    (item) => item.rating > 0 && item.rating <= 3
  ).length;

  const formatDate = (date: string | null) => {
    if (!date) return "Date unavailable";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Date unavailable";
    }

    return parsedDate.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="feedback-page">
      <div className="feedback-header">
        <div>
          <span className="feedback-eyebrow">
            CUSTOMER EXPERIENCE
          </span>

          <h1>Customer Feedback</h1>

          <p>
            Monitor customer reviews and understand customer satisfaction.
          </p>
        </div>

        <button
          className="feedback-refresh"
          onClick={fetchFeedback}
          disabled={loading}
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>

      <div className="feedback-stats">
        <div className="feedback-stat-card">
          <div className="feedback-stat-icon">
            <MessageSquare size={23} />
          </div>
          <div>
            <span>Total Feedback</span>
            <strong>{totalFeedback}</strong>
            <small>Customer reviews</small>
          </div>
        </div>

        <div className="feedback-stat-card">
          <div className="feedback-stat-icon feedback-star-icon">
            <Star size={23} />
          </div>
          <div>
            <span>Average Rating</span>
            <strong>{averageRating}</strong>
            <small>Out of 5.0</small>
          </div>
        </div>

        <div className="feedback-stat-card">
          <div className="feedback-stat-icon feedback-positive-icon">
            <ThumbsUp size={23} />
          </div>
          <div>
            <span>Positive</span>
            <strong>{positiveCount}</strong>
            <small>Ratings of 4 and 5</small>
          </div>
        </div>

        <div className="feedback-stat-card">
          <div className="feedback-stat-icon feedback-warning-icon">
            <AlertTriangle size={23} />
          </div>
          <div>
            <span>Needs Attention</span>
            <strong>{attentionCount}</strong>
            <small>Ratings of 1 to 3</small>
          </div>
        </div>
      </div>

      <div className="feedback-main-card">
        <div className="feedback-card-header">
          <div>
            <h2>All Customer Reviews</h2>
            <p>Reviews submitted by customers across restaurants</p>
          </div>
          <MessageSquare size={24} />
        </div>

        <div className="feedback-controls">
          <div className="feedback-search">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search customer, restaurant, order or comment..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="feedback-filter">
            <Filter size={17} />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="All">All Feedback</option>
              <option value="Positive">Positive</option>
              <option value="Needs Attention">Needs Attention</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="feedback-no-results">
            <RefreshCw size={28} />
            <h3>Loading customer feedback...</h3>
          </div>
        ) : error ? (
          <div className="feedback-no-results">
            <AlertTriangle size={32} />
            <h3>Unable to load feedback</h3>
            <p>{error}</p>
            <button onClick={fetchFeedback}>Try Again</button>
          </div>
        ) : (
          <div className="feedback-list">
            {filteredFeedback.length > 0 ? (
              filteredFeedback.map((item) => (
                <div className="feedback-item" key={item.id}>
                  <div className="feedback-avatar">
                    {(item.customer || "C").charAt(0).toUpperCase()}
                  </div>

                  <div className="feedback-content">
                    <div className="feedback-item-top">
                      <div>
                        <h3>{item.customer}</h3>
                        <span className="feedback-date">
                          {item.email}
                        </span>
                        <br />
                        <span className="feedback-date">
                          {formatDate(item.date)}
                        </span>
                      </div>

                      <div className="feedback-rating">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={15}
                            fill={
                              star <= item.rating
                                ? "currentColor"
                                : "none"
                            }
                          />
                        ))}
                      </div>
                    </div>

                    <p>{item.comment || "No written comment."}</p>

                    <div className="feedback-item-bottom">
                      <span className="feedback-category">
                        Restaurant: {item.restaurant}
                      </span>

                      {item.order_number && (
                        <span className="feedback-category">
                          Order: {item.order_number}
                        </span>
                      )}

                      <span
                        className={`feedback-status ${
                          item.rating >= 4
                            ? "feedback-status-positive"
                            : "feedback-status-warning"
                        }`}
                      >
                        {item.rating >= 4 ? (
                          <CheckCircle2 size={14} />
                        ) : (
                          <AlertTriangle size={14} />
                        )}
                        {item.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="feedback-no-results">
                <Search size={32} />
                <h3>No feedback found</h3>
                <p>
                  {feedbackData.length === 0
                    ? "No customer feedback has been submitted yet."
                    : "Try changing your search or filter."}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Feedback;
