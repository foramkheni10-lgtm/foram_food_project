import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import "./Kitchen.css";

const API_URL = "https://foram-food-project.onrender.com";

interface KitchenIngredient {
  ingredient_name: string;
  quantity_required: number;
  unit: string;
}

interface KitchenOrder {
  _id: string;
  order_id: string;
  food_name: string;
  quantity: number;
  status: string;
  estimated_time: number;
  ingredients: KitchenIngredient[];
}

interface KitchenResponse {
  status: string;
  count: number;
  kitchen_orders: KitchenOrder[];
}

interface ApiResponse {
  status?: string;
  message?: string;
  detail?: string;
  insufficient_items?: {
    ingredient_name: string;
    required_quantity: number;
    available_quantity: number;
    unit: string;
    reason: string;
  }[];
}

interface NewOrderForm {
  order_id: string;
  food_name: string;
  quantity: number;
  estimated_time: number;
}

function Kitchen() {
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeAction, setActiveAction] = useState<string | null>(null);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");

  const [orderWarnings, setOrderWarnings] = useState<Record<string, string>>({});

  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [form, setForm] = useState<NewOrderForm>({
    order_id: "",
    food_name: "",
    quantity: 1,
    estimated_time: 15,
  });

  const [formIngredients, setFormIngredients] = useState<KitchenIngredient[]>([
    {
      ingredient_name: "",
      quantity_required: 1,
      unit: "kg",
    },
  ]);

  const showMessage = (
    text: string,
    type: "success" | "error"
  ) => {
    setMessage(text);
    setMessageType(type);
  };

  const fetchKitchenOrders = async () => {
    try {
      const response = await fetch(`${API_URL}/kitchen/`);

      if (!response.ok) {
        throw new Error("Failed to fetch kitchen orders");
      }

      const data: KitchenResponse = await response.json();
      setOrders(data.kitchen_orders || []);
    } catch (error) {
      console.error("Kitchen API Error:", error);
      showMessage("Failed to load kitchen orders. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKitchenOrders();
  }, []);

  const updateIngredient = (
    index: number,
    field: keyof KitchenIngredient,
    value: string | number
  ) => {
    setFormIngredients((previous) =>
      previous.map((ingredient, i) =>
        i === index ? { ...ingredient, [field]: value } : ingredient
      )
    );
  };

  const addIngredient = () => {
    setFormIngredients((previous) => [
      ...previous,
      {
        ingredient_name: "",
        quantity_required: 1,
        unit: "kg",
      },
    ]);
  };

  const removeIngredient = (index: number) => {
    setFormIngredients((previous) =>
      previous.filter((_, i) => i !== index)
    );
  };

  const createOrder = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validIngredients = formIngredients.every(
      (ingredient) =>
        ingredient.ingredient_name.trim() &&
        ingredient.quantity_required > 0 &&
        ingredient.unit.trim()
    );

    if (!validIngredients) {
      showMessage("Please enter valid details for every ingredient.", "error");
      return;
    }

    try {
      setSaving(true);
      setMessage("");

      const response = await fetch(`${API_URL}/kitchen/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          status: "pending",
          ingredients: formIngredients,
        }),
      });

      const data: ApiResponse = await response.json();

      if (!response.ok || data.status !== "success") {
        throw new Error(data.detail || data.message || "Unable to create order");
      }

      showMessage("Kitchen order created successfully.", "success");

      setForm({
        order_id: "",
        food_name: "",
        quantity: 1,
        estimated_time: 15,
      });

      setFormIngredients([
        {
          ingredient_name: "",
          quantity_required: 1,
          unit: "kg",
        },
      ]);

      setShowForm(false);
      await fetchKitchenOrders();
    } catch (error) {
      showMessage(
        error instanceof Error ? error.message : "Something went wrong",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  const startOrder = async (id: string) => {
    try {
      setActiveAction(id);

      setOrderWarnings((previous) => {
        const updated = { ...previous };
        delete updated[id];
        return updated;
      });

      const response = await fetch(`${API_URL}/kitchen/${id}/start`, {
        method: "POST",
      });

      const data: ApiResponse = await response.json();

      if (data.status === "insufficient_items") {
        const details = (data.insufficient_items || [])
          .map(
            (item) =>
              `${item.ingredient_name}: Required ${item.required_quantity} ${item.unit}, Available ${item.available_quantity} ${item.unit}, Missing ${Math.max(
                0,
                item.required_quantity - item.available_quantity
              )} ${item.unit}`
          )
          .join("\n");

        setOrderWarnings((previous) => ({
          ...previous,
          [id]: `${data.message || "Kitchen order cannot be started"}${
            details ? `\n${details}` : ""
          }`,
        }));

        await fetchKitchenOrders();
        return;
      }

      if (!response.ok || data.status !== "success") {
        throw new Error(data.detail || data.message || "Unable to start order");
      }

      showMessage("Order started successfully.", "success");
      await fetchKitchenOrders();
    } catch (error) {
      setOrderWarnings((previous) => ({
        ...previous,
        [id]:
          error instanceof Error
            ? error.message
            : "Something went wrong",
      }));
    } finally {
      setActiveAction(null);
    }
  };

  const markReady = async (id: string) => {
    try {
      setActiveAction(id);

      const response = await fetch(`${API_URL}/kitchen/${id}/ready`, {
        method: "POST",
      });

      const data: ApiResponse = await response.json();

      if (!response.ok || data.status !== "success") {
        throw new Error(
          data.detail || data.message || "Unable to mark order ready"
        );
      }

      showMessage("Kitchen order marked as ready.", "success");
      await fetchKitchenOrders();
    } catch (error) {
      showMessage(
        error instanceof Error ? error.message : "Something went wrong",
        "error"
      );
    } finally {
      setActiveAction(null);
    }
  };

  // Complete an order after its food is ready.
  const completeOrder = async (id: string) => {
    try {
      setActiveAction(id);

      const response = await fetch(`${API_URL}/kitchen/${id}/complete`, {
        method: "POST",
      });

      const data: ApiResponse = await response.json();

      if (!response.ok || data.status !== "success") {
        throw new Error(
          data.detail || data.message || "Unable to complete order"
        );
      }

      showMessage("Kitchen order completed successfully.", "success");
      await fetchKitchenOrders();
    } catch (error) {
      showMessage(
        error instanceof Error ? error.message : "Something went wrong",
        "error"
      );
    } finally {
      setActiveAction(null);
    }
  };

  const counts = useMemo(
    () => ({
      total: orders.length,
      pending: orders.filter(
        (order) => order.status.toLowerCase() === "pending"
      ).length,
      preparing: orders.filter(
        (order) => order.status.toLowerCase() === "preparing"
      ).length,
      ready: orders.filter(
        (order) => order.status.toLowerCase() === "ready"
      ).length,
      completed: orders.filter(
        (order) => order.status.toLowerCase() === "completed"
      ).length,
    }),
    [orders]
  );

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        order.order_id.toLowerCase().includes(search.toLowerCase()) ||
        order.food_name.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        order.status.toLowerCase() === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  if (loading) {
    return (
      <main className="kitchen-page">
        <h1>Kitchen Orders</h1>
        <p>Loading kitchen orders...</p>
      </main>
    );
  }

  return (
    <main className="kitchen-page">
      <div className="kitchen-header">
        <div>
          <p className="page-label">Kitchen Management</p>
          <h1>Kitchen Orders 👨‍🍳</h1>
          <p>Manage incoming orders, prepare food and update order status.</p>
        </div>
      </div>

      <div className="kitchen-add-section">
        <button
          className="add-order-btn"
          onClick={() => setShowForm((previous) => !previous)}
        >
          {showForm ? "✕ Close Form" : "+ Add Kitchen Order"}
        </button>
      </div>

      {message && (
        <div className={`kitchen-message ${messageType}`} role="alert">
          <span>{messageType === "success" ? "✓ " : "⚠ "}</span>
          {message}
          <button
            className="message-close"
            onClick={() => setMessage("")}
            aria-label="Close message"
          >
            ×
          </button>
        </div>
      )}

      {showForm && (
        <form className="kitchen-form" onSubmit={createOrder}>
          <h2>Create Kitchen Order</h2>

          <div className="form-grid">
            <label>
              Order ID
              <input
                required
                value={form.order_id}
                onChange={(e) =>
                  setForm({ ...form, order_id: e.target.value })
                }
                placeholder="Example: ORDER503"
              />
            </label>

            <label>
              Food Name
              <input
                required
                value={form.food_name}
                onChange={(e) =>
                  setForm({ ...form, food_name: e.target.value })
                }
                placeholder="Enter food name"
              />
            </label>

            <label>
              Quantity
              <input
                type="number"
                min="1"
                required
                value={form.quantity}
                onChange={(e) =>
                  setForm({ ...form, quantity: Number(e.target.value) })
                }
              />
            </label>

            <label>
              Estimated Time (minutes)
              <input
                type="number"
                min="1"
                required
                value={form.estimated_time}
                onChange={(e) =>
                  setForm({
                    ...form,
                    estimated_time: Number(e.target.value),
                  })
                }
              />
            </label>
          </div>

          <div className="form-ingredients">
            <h3>Required Ingredients</h3>

            {formIngredients.map((ingredient, index) => (
              <div className="ingredient-input-row" key={index}>
                <input
                  required
                  placeholder="Ingredient name"
                  value={ingredient.ingredient_name}
                  onChange={(e) =>
                    updateIngredient(index, "ingredient_name", e.target.value)
                  }
                />

                <input
                  required
                  type="number"
                  min="0.01"
                  step="any"
                  placeholder="Quantity"
                  value={ingredient.quantity_required}
                  onChange={(e) =>
                    updateIngredient(
                      index,
                      "quantity_required",
                      Number(e.target.value)
                    )
                  }
                />

                <input
                  required
                  placeholder="Unit"
                  value={ingredient.unit}
                  onChange={(e) =>
                    updateIngredient(index, "unit", e.target.value)
                  }
                />

                {formIngredients.length > 1 && (
                  <button
                    type="button"
                    className="remove-ingredient-btn"
                    onClick={() => removeIngredient(index)}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}

            <button
              type="button"
              className="add-ingredient-btn"
              onClick={addIngredient}
            >
              + Add Ingredient
            </button>
          </div>

          <button
            className="submit-order-btn"
            type="submit"
            disabled={saving}
          >
            {saving ? "Creating..." : "Create Kitchen Order"}
          </button>
        </form>
      )}

      <div className="kitchen-summary">
        <div className="summary-card">
          <span>Total Orders</span>
          <strong>{counts.total}</strong>
        </div>

        <div className="summary-card pending-summary">
          <span>Pending</span>
          <strong>{counts.pending}</strong>
        </div>

        <div className="summary-card preparing-summary">
          <span>Preparing</span>
          <strong>{counts.preparing}</strong>
        </div>

        <div className="summary-card ready-summary">
          <span>Ready</span>
          <strong>{counts.ready}</strong>
        </div>

        <div className="summary-card completed-summary">
          <span>Completed</span>
          <strong>{counts.completed}</strong>
        </div>
      </div>

      <div className="kitchen-toolbar">
        <input
          type="search"
          placeholder="Search by Order ID or food name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="preparing">Preparing</option>
          <option value="ready">Ready</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="empty-kitchen">
          <div>🍽️</div>
          <h2>No Kitchen Orders Found</h2>
          <p>Try another search or status filter.</p>
        </div>
      ) : (
        <div className="kitchen-grid">
          {filteredOrders.map((order) => {
            const status = order.status.toLowerCase();
            const isBusy = activeAction === order._id;

            return (
              <div className="kitchen-card" key={order._id}>
                <div className="kitchen-card-top">
                  <div>
                    <span className="order-label">Order ID</span>
                    <h3>{order.order_id}</h3>
                  </div>

                  <span className={`status-badge ${status}`}>
                    {order.status}
                  </span>
                </div>

                <div className="food-section">
                  <span className="food-icon">🍕</span>
                  <div>
                    <span className="food-label">Food</span>
                    <h2>{order.food_name}</h2>
                  </div>
                </div>

                <div className="order-details">
                  <div>
                    <span>Quantity</span>
                    <strong>{order.quantity}</strong>
                  </div>

                  <div>
                    <span>Estimated Time</span>
                    <strong>{order.estimated_time} min</strong>
                  </div>
                </div>

                <div className="ingredients-section">
                  <h4>Required Ingredients</h4>

                  {order.ingredients?.map((ingredient, index) => (
                    <div className="ingredient-row" key={index}>
                      <span>{ingredient.ingredient_name}</span>
                      <strong>
                        {ingredient.quantity_required} {ingredient.unit}
                      </strong>
                    </div>
                  ))}
                </div>

                <div className="kitchen-actions">
                  {status === "pending" && (
                    <button
                      className="start-btn"
                      disabled={isBusy}
                      onClick={() => startOrder(order._id)}
                    >
                      {isBusy ? "Checking Inventory..." : "▶ Start Order"}
                    </button>
                  )}

                  {orderWarnings[order._id] && (
                    <div className="order-warning">
                      <strong>⚠ Insufficient Inventory</strong>
                      <p>{orderWarnings[order._id]}</p>
                    </div>
                  )}

                  {status === "preparing" && (
                    <button
                      className="ready-btn"
                      disabled={isBusy}
                      onClick={() => markReady(order._id)}
                    >
                      {isBusy ? "Updating..." : "✓ Mark Ready"}
                    </button>
                  )}

                  {status === "ready" && (
                    <button
                      className="ready-btn"
                      disabled={isBusy}
                      onClick={() => completeOrder(order._id)}
                    >
                      {isBusy ? "Completing..." : "✓ Complete Order"}
                    </button>
                  )}

                  {status === "completed" && (
                    <div className="completed-text">✓ Order Completed</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}

export default Kitchen;
  