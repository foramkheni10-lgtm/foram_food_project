
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  RefreshCw,
  Package,
  AlertTriangle,
  Flame,
  BarChart3,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import "./AIAnalysis.css";

const API_URL = "https://foram-food-project.onrender.com";

interface InventoryItem {
  ingredient_name: string;
  current_stock: number;
  minimum_stock: number;
  unit: string;
  total_used: number;
  stock_status: "low_stock" | "normal";
  demand: "high" | "medium" | "low" | "no_usage_data";
  recommended_purchase: number;
}

interface AnalysisResponse {
  status: string;
  count: number;
  analysis: InventoryItem[];
}

function AIAnalysis() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState("");

  const fetchAnalysis = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/ai/inventory-analysis`);

      if (!response.ok) {
        throw new Error(`Unable to load analysis. Status: ${response.status}`);
      }

      const data: AnalysisResponse = await response.json();

      if (data.status !== "success") {
        throw new Error("Inventory analysis was unsuccessful.");
      }

      setItems(data.analysis || []);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalysis();
  }, [fetchAnalysis]);

  const stats = useMemo(() => {
    const lowStock = items.filter(
      (item) => item.stock_status === "low_stock"
    );

    const highDemand = items.filter(
      (item) => item.demand === "high"
    );

    const usageRecorded = items.filter(
      (item) => item.total_used > 0
    );

    const mediumDemand = items.filter(
      (item) => item.demand === "medium"
    );

    const noUsage = items.filter(
      (item) => item.demand === "no_usage_data"
    );

    const purchaseItems = items.filter(
      (item) => item.recommended_purchase > 0
    );

    return {
      total: items.length,
      lowStock,
      highDemand,
      usageRecorded,
      mediumDemand,
      noUsage,
      purchaseItems,
    };
  }, [items]);

  const formatNumber = (value: number) =>
    Number(value || 0).toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    });

  const formatDemand = (demand: string) => {
    switch (demand) {
      case "high":
        return "High";
      case "medium":
        return "Medium";
      case "low":
        return "Low";
      default:
        return "No Usage Data";
    }
  };

  if (loading) {
    return (
      <div className="ai-analysis-page">
        <div className="ai-loading">
          <RefreshCw className="ai-spin" size={28} />
          <h2>Analyzing Inventory...</h2>
          <p>Checking ingredient stock and demand.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ai-analysis-page">
      {/* PAGE HEADER */}
      <div className="ai-analysis-header">
        <div>
          <span className="ai-eyebrow">ARTIFICIAL INTELLIGENCE</span>

          <h1>
            AI Inventory Analysis <span>🤖</span>
          </h1>

          <p>
            Analyze inventory stock levels, ingredient usage and demand.
          </p>
        </div>

        <button
          className="ai-refresh-button"
          onClick={fetchAnalysis}
          disabled={loading}
        >
          <RefreshCw size={14} />
          Refresh Analysis
        </button>
      </div>

      {error && (
        <div className="ai-error-message">
          <AlertTriangle size={18} />
          {error}
          <button onClick={fetchAnalysis}>Retry</button>
        </div>
      )}

      {!error && (
        <>
          {/* SUMMARY CARDS */}
          <div className="ai-stat-grid">
            <div className="ai-stat-card">
              <div className="ai-stat-icon box-icon">
                <Package size={20} />
              </div>
              <div>
                <span>Total Ingredients</span>
                <strong>{stats.total}</strong>
              </div>
            </div>

            <div className="ai-stat-card">
              <div className="ai-stat-icon warning-icon">
                <AlertTriangle size={20} />
              </div>
              <div>
                <span>Low Stock</span>
                <strong>{stats.lowStock.length}</strong>
              </div>
            </div>

            <div className="ai-stat-card">
              <div className="ai-stat-icon fire-icon">
                <Flame size={20} />
              </div>
              <div>
                <span>High Demand</span>
                <strong>{stats.highDemand.length}</strong>
              </div>
            </div>

            <div className="ai-stat-card">
              <div className="ai-stat-icon chart-icon">
                <BarChart3 size={20} />
              </div>
              <div>
                <span>Usage Recorded</span>
                <strong>{stats.usageRecorded.length}</strong>
              </div>
            </div>
          </div>

          {/* SMART RECOMMENDATIONS */}
          <section className="ai-recommendations-panel">
            <div className="ai-section-heading">
              <span>SMART RECOMMENDATIONS</span>
              <h2>
                AI Inventory Insights <span>🤖</span>
              </h2>
              <p>
                Recommendations based on current stock, ingredient usage
                and demand analysis.
              </p>
            </div>

            <div className="ai-insights-grid">
              {/* LOW STOCK */}
              <div className="ai-insight-card low-stock-insight">
                <div className="ai-insight-icon yellow">
                  <AlertTriangle size={20} />
                </div>

                <div className="ai-insight-details">
                  <h3>Low Stock Alert</h3>
                  <p>
                    {stats.lowStock.length > 0
                      ? `${stats.lowStock.length} ingredients are at or below the minimum stock level.`
                      : "No ingredients are currently below minimum stock."}
                  </p>

                  <div className="ai-ingredient-tags">
                    {stats.lowStock.map((item) => (
                      <span key={item.ingredient_name}>
                        {item.ingredient_name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* HIGH DEMAND */}
              <div className="ai-insight-card high-demand-insight">
                <div className="ai-insight-icon red">
                  <Flame size={20} />
                </div>

                <div className="ai-insight-details">
                  <h3>High Demand</h3>
                  <p>
                    {stats.highDemand.length > 0
                      ? "These ingredients have high usage and may require additional stock."
                      : "No high-demand ingredients detected."}
                  </p>

                  <div className="ai-ingredient-tags">
                    {stats.highDemand.map((item) => (
                      <span key={item.ingredient_name}>
                        {item.ingredient_name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* PURCHASE RECOMMENDATION */}
              <div className="ai-insight-card purchase-insight">
                <div className="ai-insight-icon blue">
                  <Package size={20} />
                </div>

                <div className="ai-insight-details">
                  <h3>Purchase Recommendation</h3>
                  <p>
                    {stats.purchaseItems.length > 0
                      ? "Consider creating purchase orders for the following ingredients:"
                      : "No additional purchases are currently recommended."}
                  </p>

                  <div className="ai-ingredient-tags">
                    {stats.purchaseItems.map((item) => (
                      <span
                        key={item.ingredient_name}
                        title={`Purchase ${formatNumber(
                          item.recommended_purchase
                        )} ${item.unit}`}
                      >
                        {item.ingredient_name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* DEMAND INFORMATION */}
              <div className="ai-insight-card demand-insight">
                <div className="ai-insight-icon purple">
                  <BarChart3 size={20} />
                </div>

                <div className="ai-insight-details">
                  <h3>Demand Information</h3>

                  <p>
                    {stats.mediumDemand.length > 0
                      ? `${stats.mediumDemand.length} medium-demand ingredients detected.`
                      : "No medium-demand ingredients detected."}
                  </p>

                  <p className="ai-secondary-info">
                    {stats.noUsage.length} ingredients have no recorded
                    usage data.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* INVENTORY TABLE */}
          <section className="ai-inventory-table-section">
            <div className="ai-table-title">
              <div>
                <h2>Inventory Analysis</h2>
                <p>AI-generated inventory insights</p>
              </div>

              <span className="ai-item-count">
                {items.length} items
              </span>
            </div>

            {items.length === 0 ? (
              <div className="ai-empty-state">
                No inventory records found.
              </div>
            ) : (
              <div className="ai-table-scroll">
                <table className="ai-inventory-table">
                  <thead>
                    <tr>
                      <th>INGREDIENT</th>
                      <th>CURRENT STOCK</th>
                      <th>MINIMUM STOCK</th>
                      <th>TOTAL USED</th>
                      <th>STOCK STATUS</th>
                      <th>DEMAND</th>
                    </tr>
                  </thead>

                  <tbody>
                    {items.map((item, index) => (
                      <tr key={`${item.ingredient_name}-${index}`}>
                        <td>
                          <div className="ai-ingredient-name">
                            <span className="ai-food-icon">🥗</span>
                            <strong>{item.ingredient_name}</strong>
                          </div>
                        </td>

                        <td>
                          <strong>
                            {formatNumber(item.current_stock)} {item.unit}
                          </strong>
                        </td>

                        <td>
                          {formatNumber(item.minimum_stock)} {item.unit}
                        </td>

                        <td>
                          {formatNumber(item.total_used)} {item.unit}
                        </td>

                        <td>
                          <span
                            className={`ai-stock-badge ${
                              item.stock_status === "low_stock"
                                ? "stock-low"
                                : "stock-normal"
                            }`}
                          >
                            {item.stock_status === "low_stock" ? (
                              <>
                                <AlertTriangle size={11} />
                                Low Stock
                              </>
                            ) : (
                              <>
                                <CheckCircle2 size={11} />
                                Normal
                              </>
                            )}
                          </span>
                        </td>

                        <td>
                          <span
                            className={`ai-demand-badge demand-${item.demand}`}
                          >
                            <span className="ai-demand-dot" />
                            {formatDemand(item.demand)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* PURCHASE QUANTITIES */}
          {stats.purchaseItems.length > 0 && (
            <section className="ai-purchase-details">
              <h2>
                <TrendingUp size={19} />
                Recommended Purchase Quantities
              </h2>

              <div className="ai-purchase-grid">
                {stats.purchaseItems.map((item) => (
                  <div
                    className="ai-purchase-item"
                    key={item.ingredient_name}
                  >
                    <strong>{item.ingredient_name}</strong>
                    <span>
                      Recommended:{" "}
                      <b>
                        {formatNumber(item.recommended_purchase)} {item.unit}
                      </b>
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          <div className="ai-updated-time">
            {lastUpdated && `Last updated: ${lastUpdated}`}
          </div>
        </>
      )}
    </div>
  );
}

export default AIAnalysis;
