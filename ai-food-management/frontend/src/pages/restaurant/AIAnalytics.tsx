
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import RestaurantSidebar from "../../pages/restaurant/RestaurantSidebar";
import "../../styles/restaurant/AIAnalytics.css";

const API = "http://127.0.0.1:8000";

function AIAnalytics() {
  const navigate = useNavigate();

  const restaurantId = localStorage.getItem("restaurantId");
  const restaurantName =
    localStorage.getItem("restaurantName") || "Restaurant";

  const [popularData, setPopularData] = useState<any>(null);
  const [salesData, setSalesData] = useState<any>(null);
  const [demandData, setDemandData] = useState<any>(null);
  const [recommendationData, setRecommendationData] = useState<any>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [assistantLoading, setAssistantLoading] = useState(false);

  // LOAD AI ANALYTICS DATA
  const loadAIData = useCallback(async () => {
    if (!restaurantId) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const endpoints = [
        `${API}/api/ai/popular-foods/${restaurantId}`,
        `${API}/api/ai/sales-prediction/${restaurantId}`,
        `${API}/api/ai/demand-prediction/${restaurantId}`,
        `${API}/api/ai/recommendations/${restaurantId}`,
      ];

      const responses = await Promise.all(
        endpoints.map(async (url) => {
          const response = await fetch(url);

          if (!response.ok) {
            const result = await response.json();
            throw new Error(result.detail || "Unable to load AI data");
          }

          return response.json();
        })
      );

      setPopularData(responses[0]);
      setSalesData(responses[1]);
      setDemandData(responses[2]);
      setRecommendationData(responses[3]);
    } catch (err: any) {
      console.error("AI data error:", err);
      setError(err.message || "Unable to load AI analytics.");
    } finally {
      setLoading(false);
    }
  }, [restaurantId, navigate]);

  useEffect(() => {
    loadAIData();
  }, [loadAIData]);

  // ASK RESTAURANT AI ASSISTANT
  const askAssistant = async () => {
    if (!question.trim()) {
      alert("Please enter your question.");
      return;
    }

    try {
      setAssistantLoading(true);
      setAnswer("");

      const response = await fetch(`${API}/api/ai/assistant`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          restaurant_id: restaurantId,
          question: question.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.detail || "Assistant request failed");
      }

      setAnswer(result.answer);
    } catch (err: any) {
      setAnswer(err.message || "Unable to contact assistant.");
    } finally {
      setAssistantLoading(false);
    }
  };

  const maxSales = Math.max(
    ...(salesData?.daily_sales || []).map((item: any) => item.sales || 0),
    1
  );

  return (
    <>
      <RestaurantSidebar />

      <div className="restaurant-content-area">
        {loading ? (
          <div className="ai-loading">
            <div className="ai-spinner"></div>
            <h3>Analyzing your restaurant data...</h3>
            <p>Please wait while we prepare your insights.</p>
          </div>
        ) : (
          <main className="ai-page">
            {/* HEADER */}
            <header className="ai-header">
              <div>
                <p className="ai-small-heading">
                  SMART RESTAURANT ECOSYSTEM
                </p>

                <h1>AI Analytics Dashboard</h1>

                <p>
                  Intelligent insights and predictions for {restaurantName}
                </p>
              </div>

              <button
                className="ai-back-btn"
                onClick={() => navigate("/dashboard")}
              >
                ← Dashboard
              </button>
            </header>

            {/* ERROR MESSAGE */}
            {error && (
              <div className="ai-error">
                <div>
                  <strong>Unable to load analytics</strong>
                  <p>{error}</p>
                </div>

                <button onClick={loadAIData}>Retry</button>
              </div>
            )}

            {!error && (
              <>
                {/* SUMMARY CARDS */}
                <section className="ai-summary-grid">
                  <div className="ai-summary-card">
                    <span>Completed Orders</span>
                    <h2>
                      {popularData?.total_completed_orders ?? 0}
                    </h2>
                    <p>Based on completed orders</p>
                  </div>

                  <div className="ai-summary-card">
                    <span>Items Sold</span>
                    <h2>{popularData?.total_items_sold ?? 0}</h2>
                    <p>Total food quantities sold</p>
                  </div>

                  <div className="ai-summary-card">
                    <span>Total Revenue</span>
                    <h2>₹{popularData?.total_revenue ?? 0}</h2>
                    <p>Completed-order revenue</p>
                  </div>

                  <div className="ai-summary-card">
                    <span>Tomorrow's Sales Estimate</span>
                    <h2>
                      ₹{salesData?.tomorrow?.predicted_sales ?? 0}
                    </h2>
                    <p>7-day average estimate</p>
                  </div>
                </section>

                {/* POPULAR FOOD */}
                <section className="ai-section">
                  <div className="ai-section-heading">
                    <div>
                      <span className="ai-section-tag">FEATURE 01</span>
                      <h2>Popular Food Analysis</h2>
                      <p>
                        Discover your best-selling and low-selling food items.
                      </p>
                    </div>
                  </div>

                  <div className="ai-two-column">
                    <div className="ai-panel">
                      <h3>🏆 Best-selling Foods</h3>

                      {popularData?.popular_foods?.length ? (
                        popularData.popular_foods.map(
                          (food: any, index: number) => (
                            <div
                              className="ai-food-row"
                              key={food.food_id}
                            >
                              <div className="ai-food-rank">
                                {index + 1}
                              </div>

                              <div className="ai-food-info">
                                <strong>{food.food_name}</strong>
                                <span>{food.category}</span>
                              </div>

                              <div className="ai-food-result">
                                <strong>{food.quantity_sold}</strong>
                                <span>sold</span>
                              </div>
                            </div>
                          )
                        )
                      ) : (
                        <p className="ai-empty">
                          No food items found.
                        </p>
                      )}
                    </div>

                    <div className="ai-panel">
                      <h3>⚠️ Low-selling Foods</h3>

                      {popularData?.low_selling_foods?.length ? (
                        popularData.low_selling_foods.map((food: any) => (
                          <div
                            className="ai-food-row"
                            key={food.food_id}
                          >
                            <div className="ai-food-dot"></div>

                            <div className="ai-food-info">
                              <strong>{food.food_name}</strong>
                              <span>{food.category}</span>
                            </div>

                            <div className="ai-food-result">
                              <strong>{food.quantity_sold}</strong>
                              <span>sold</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="ai-empty">
                          No food items found.
                        </p>
                      )}
                    </div>
                  </div>
                </section>

                {/* SALES PREDICTION */}
                <section className="ai-section">
                  <div className="ai-section-heading">
                    <div>
                      <span className="ai-section-tag">FEATURE 02</span>
                      <h2>Sales Prediction</h2>
                      <p>
                        Estimated sales using your last seven calendar days.
                      </p>
                    </div>
                  </div>

                  <div className="ai-two-column">
                    <div className="ai-panel ai-prediction-card">
                      <span>Tomorrow's Estimated Sales</span>
                      <h2>
                        ₹{salesData?.tomorrow?.predicted_sales ?? 0}
                      </h2>
                      <p>
                        {salesData?.tomorrow?.date || "Date unavailable"}
                      </p>
                    </div>

                    <div className="ai-panel ai-prediction-card">
                      <span>Next 7 Days Estimated Sales</span>
                      <h2>
                        ₹{salesData?.next_7_days?.predicted_sales ?? 0}
                      </h2>
                      <p>Based on average daily revenue</p>
                    </div>
                  </div>

                  <div className="ai-panel ai-chart-panel">
                    <h3>Last 7 Days Sales</h3>

                    {salesData?.daily_sales?.length ? (
                      salesData.daily_sales.map((day: any) => (
                        <div className="ai-chart-row" key={day.date}>
                          <span>
                            {day.date ? day.date.slice(5) : "-"}
                          </span>

                          <div className="ai-chart-track">
                            <div
                              className="ai-chart-bar"
                              style={{
                                width: `${
                                  ((day.sales || 0) / maxSales) * 100
                                }%`,
                              }}
                            ></div>
                          </div>

                          <strong>₹{day.sales ?? 0}</strong>
                        </div>
                      ))
                    ) : (
                      <p className="ai-empty">
                        No sales history available.
                      </p>
                    )}

                    <p className="ai-note">
                      Prediction method: 7-day average baseline. This is an
                      estimate, not a trained machine-learning forecast.
                    </p>
                  </div>
                </section>

                {/* DEMAND PREDICTION */}
                <section className="ai-section">
                  <div className="ai-section-heading">
                    <div>
                      <span className="ai-section-tag">FEATURE 03</span>
                      <h2>Food Demand Prediction</h2>
                      <p>
                        Estimate how many portions may be needed tomorrow.
                      </p>
                    </div>
                  </div>

                  <div className="ai-panel">
                    <div className="ai-table-wrapper">
                      <table className="ai-table">
                        <thead>
                          <tr>
                            <th>Food Name</th>
                            <th>Sold in 7 Days</th>
                            <th>Average Daily Demand</th>
                            <th>Tomorrow's Estimate</th>
                          </tr>
                        </thead>

                        <tbody>
                          {demandData?.predictions?.length ? (
                            demandData.predictions.map((food: any) => (
                              <tr key={food.food_id}>
                                <td>{food.food_name}</td>
                                <td>
                                  {food.quantity_sold_last_7_days}
                                </td>
                                <td>{food.average_daily_demand}</td>
                                <td>
                                  <strong>
                                    {food.predicted_quantity_tomorrow} portions
                                  </strong>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={4}>
                                No demand data available.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    <p className="ai-note">
                      Ingredient quantities are not calculated yet. They
                      require recipe information and ingredient quantities
                      for each food.
                    </p>
                  </div>
                </section>

                {/* RECOMMENDATIONS */}
                <section className="ai-section">
                  <div className="ai-section-heading">
                    <div>
                      <span className="ai-section-tag">FEATURE 04</span>
                      <h2>Food Recommendations</h2>
                      <p>
                        Menu suggestions based on restaurant popularity.
                      </p>
                    </div>
                  </div>

                  <div className="ai-recommendation-grid">
                    {recommendationData?.recommendations?.length ? (
                      recommendationData.recommendations.map(
                        (food: any) => (
                          <div
                            className="ai-recommendation-card"
                            key={food.food_id}
                          >
                            <span className="ai-recommendation-icon">
                              🍽️
                            </span>

                            <h3>{food.food_name}</h3>
                            <p>{food.category}</p>
                            <span>{food.reason}</span>
                          </div>
                        )
                      )
                    ) : (
                      <div className="ai-panel">
                        No recommendations available yet.
                      </div>
                    )}
                  </div>
                </section>

                {/* AI ASSISTANT */}
                <section className="ai-section">
                  <div className="ai-section-heading">
                    <div>
                      <span className="ai-section-tag">FEATURE 05</span>
                      <h2>Restaurant AI Assistant</h2>
                      <p>
                        Ask questions about your restaurant's data.
                      </p>
                    </div>
                  </div>

                  <div className="ai-panel ai-assistant">
                    <div className="ai-assistant-title">
                      <span>🤖</span>

                      <div>
                        <h3>Restaurant Assistant</h3>
                        <p>Local data-driven assistant</p>
                      </div>
                    </div>

                    <div className="ai-suggestions">
                      {[
                        "Which food is most popular?",
                        "Which food is low selling?",
                        "What is my total revenue?",
                        "How many completed orders do I have?",
                        "How many food items are in my menu?",
                      ].map((suggestion) => (
                        <button
                          key={suggestion}
                          onClick={() => setQuestion(suggestion)}
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>

                    <div className="ai-chat-input">
                      <input
                        type="text"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !assistantLoading) {
                            askAssistant();
                          }
                        }}
                        placeholder="Ask something about your restaurant..."
                      />

                      <button
                        onClick={askAssistant}
                        disabled={assistantLoading}
                      >
                        {assistantLoading ? "Thinking..." : "Ask"}
                      </button>
                    </div>

                    {answer && (
                      <div className="ai-answer">
                        <strong>Assistant</strong>
                        <p>{answer}</p>
                      </div>
                    )}
                  </div>
                </section>
              </>
            )}

            <footer className="ai-footer">
              AI Food Management Ecosystem
            </footer>
          </main>
        )}
      </div>
    </>
  );
}

export default AIAnalytics;