
import { useEffect, useState } from "react";
import {
  Package,
  Carrot,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
} from "lucide-react";

import api from "../../services/api";
import "./Inventory.css";

interface InventoryData {
  totalInventoryItems: number;
  totalIngredients: number;
  lowStockCount: number;
  lowStockItems: string[];
}

interface Ingredient {
  _id: string;
  name: string;
  category: string;
  unit: string;
}

interface InventoryItem {
  _id: string;
  ingredient_id: string;
  ingredient_name?: string;
  quantity: number;
  unit: string;
  minimum_stock: number;
  supplier_id?: string;
}

interface InventoryForm {
  ingredient_id: string;
  quantity: string;
  unit: string;
  minimum_stock: string;
}

const emptyForm: InventoryForm = {
  ingredient_id: "",
  quantity: "",
  unit: "",
  minimum_stock: "",
};

function Inventory() {
  const [inventory, setInventory] = useState<InventoryData | null>(null);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<InventoryForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      setError("");

      const [overviewResponse, inventoryResponse, ingredientsResponse] =
        await Promise.all([
          api.get("/api/admin/inventory-overview"),
          api.get("/inventory/"),
          api.get("/ingredients/"),
        ]);

      setInventory(overviewResponse.data);

      const inventoryResult = inventoryResponse.data;
      const ingredientResult = ingredientsResponse.data;

      setItems(
        Array.isArray(inventoryResult)
          ? inventoryResult
          : inventoryResult.inventory ||
            inventoryResult.items ||
            inventoryResult.data ||
            []
      );

      setIngredients(
        Array.isArray(ingredientResult)
          ? ingredientResult
          : ingredientResult.ingredients ||
            ingredientResult.data ||
            []
      );
    } catch (err) {
      console.error(err);
      setError("Failed to load inventory. Please check the backend API.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleIngredientChange = (ingredientId: string) => {
    const selected = ingredients.find(
      (ingredient) => ingredient._id === ingredientId
    );

    setForm((previous) => ({
      ...previous,
      ingredient_id: ingredientId,
      unit: selected?.unit || previous.unit,
    }));
  };

  const openAddForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
    setMessage("");
  };

  const openEditForm = (item: InventoryItem) => {
    setEditingId(item._id);

    setForm({
      ingredient_id: item.ingredient_id,
      quantity: String(item.quantity),
      unit: item.unit,
      minimum_stock: String(item.minimum_stock),
    });

    setShowForm(true);
    setMessage("");
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setSaving(true);
      setMessage("");

      const payload = {
        ingredient_id: form.ingredient_id,
        quantity: Number(form.quantity),
        unit: form.unit,
        minimum_stock: Number(form.minimum_stock),
      };

      if (editingId) {
        await api.put(`/inventory/${editingId}`, payload);
        setMessage("Inventory updated successfully.");
      } else {
        await api.post("/inventory/", payload);
        setMessage("Inventory item added successfully.");
      }

      setShowForm(false);
      setForm(emptyForm);
      setEditingId(null);

      await fetchInventory();
    } catch (err: any) {
      console.error(err);
      setMessage(
        err.response?.data?.detail || "Failed to save inventory item."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this inventory item?")) {
      return;
    }

    try {
      await api.delete(`/inventory/${id}`);
      setMessage("Inventory item deleted successfully.");
      await fetchInventory();
    } catch (err: any) {
      console.error(err);
      setMessage(
        err.response?.data?.detail || "Failed to delete inventory item."
      );
    }
  };

  if (loading) {
    return (
      <div className="inventory-page">
        <div className="inventory-loading">
          <RefreshCw className="inventory-loading-icon" size={32} />
          <p>Loading inventory...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="inventory-page">
        <div className="inventory-error">
          <AlertTriangle size={28} />
          <p>{error}</p>
          <button onClick={fetchInventory}>
            <RefreshCw size={17} />
            Retry
          </button>
        </div>
      </div>
    );
  }

  const isHealthy = (inventory?.lowStockCount ?? 0) === 0;

  return (
    <div className="inventory-page">
      {/* Header */}
      <div className="inventory-header">
        <div>
          <span className="inventory-eyebrow">STOCK MANAGEMENT</span>
          <h1>Inventory</h1>
          <p>Manage stock quantities and ingredient availability.</p>
        </div>

        <div className="inventory-header-actions">
          <button className="inventory-refresh" onClick={fetchInventory}>
            <RefreshCw size={18} />
            Refresh
          </button>

          <button className="inventory-add-button" onClick={openAddForm}>
            <Plus size={18} />
            Add Inventory
          </button>
        </div>
      </div>

      {message && (
        <div className="inventory-message">
          <span>{message}</span>
          <button onClick={() => setMessage("")} aria-label="Close message">
            <X size={17} />
          </button>
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <div className="inventory-form-card">
          <div className="inventory-form-heading">
            <h2>{editingId ? "Edit Inventory" : "Add Inventory"}</h2>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              aria-label="Close form"
            >
              <X size={20} />
            </button>
          </div>

          {ingredients.length === 0 ? (
            <p>
              No ingredients are available. Add an ingredient in the
              Ingredients section first.
            </p>
          ) : (
            <form onSubmit={handleSave}>
              <div className="inventory-form-grid">
                <label>
                  Select Ingredient *
                  <select
                    required
                    value={form.ingredient_id}
                    disabled={!!editingId}
                    onChange={(e) => handleIngredientChange(e.target.value)}
                  >
                    <option value="">Choose ingredient</option>
                    {ingredients.map((ingredient) => (
                      <option key={ingredient._id} value={ingredient._id}>
                        {ingredient.name} ({ingredient.category})
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Available Quantity *
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={form.quantity}
                    onChange={(e) =>
                      setForm({ ...form, quantity: e.target.value })
                    }
                    placeholder="Enter quantity"
                  />
                </label>

                <label>
                  Unit *
                  <input
                    required
                    value={form.unit}
                    onChange={(e) =>
                      setForm({ ...form, unit: e.target.value })
                    }
                    placeholder="kg, litre, pieces"
                  />
                </label>

                <label>
                  Minimum Stock *
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={form.minimum_stock}
                    onChange={(e) =>
                      setForm({ ...form, minimum_stock: e.target.value })
                    }
                    placeholder="Enter minimum stock"
                  />
                </label>
              </div>

              <div className="inventory-form-actions">
                <button
                  type="button"
                  className="inventory-cancel-button"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="inventory-add-button"
                  disabled={saving}
                >
                  <Save size={17} />
                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Update Inventory"
                      : "Save Inventory"}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Statistics */}
      <div className="inventory-stats">
        <div className="inventory-stat-card">
          <div className="inventory-stat-icon">
            <Package size={23} />
          </div>
          <div>
            <span>Total Inventory</span>
            <strong>{inventory?.totalInventoryItems ?? items.length}</strong>
            <small>Inventory items</small>
          </div>
        </div>

        <div className="inventory-stat-card">
          <div className="inventory-stat-icon">
            <Carrot size={23} />
          </div>
          <div>
            <span>Total Ingredients</span>
            <strong>{inventory?.totalIngredients ?? ingredients.length}</strong>
            <small>Available ingredients</small>
          </div>
        </div>

        <div className="inventory-stat-card">
          <div className="inventory-stat-icon">
            <AlertTriangle size={23} />
          </div>
          <div>
            <span>Low Stock</span>
            <strong>{inventory?.lowStockCount ?? 0}</strong>
            <small>Items need attention</small>
          </div>
        </div>

        <div className="inventory-stat-card inventory-status-card">
          <div className="inventory-stat-icon">
            <CheckCircle2 size={23} />
          </div>
          <div>
            <span>Inventory Status</span>
            <strong>{isHealthy ? "Healthy" : "Attention"}</strong>
            <small>
              {isHealthy ? "No low-stock items" : "Check low-stock items"}
            </small>
          </div>
        </div>
      </div>

      {/* Inventory Records */}
      <div className="inventory-overview-card">
        <div className="inventory-overview-header">
          <div>
            <h2>Inventory Items</h2>
            <p>Current ingredient quantities and stock levels</p>
          </div>
          <Package size={24} />
        </div>

        {items.length === 0 ? (
          <div className="inventory-empty">
            <Package size={38} />
            <h3>No Inventory Records</h3>
            <p>
              Click Add Inventory to add stock for your registered ingredients.
            </p>
          </div>
        ) : (
          <div className="inventory-table-wrapper">
            <table className="inventory-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Ingredient</th>
                  <th>Available Quantity</th>
                  <th>Minimum Stock</th>
                  <th>Stock Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {items.map((item, index) => {
                  const lowStock = item.quantity <= item.minimum_stock;

                  const ingredientName =
                    item.ingredient_name ||
                    ingredients.find(
                      (ingredient) => ingredient._id === item.ingredient_id
                    )?.name ||
                    "Unknown ingredient";

                  return (
                    <tr key={item._id}>
                      <td>{index + 1}</td>
                      <td><strong>{ingredientName}</strong></td>
                      <td>{item.quantity} {item.unit}</td>
                      <td>{item.minimum_stock} {item.unit}</td>
                      <td>
                        <span
                          className={
                            lowStock
                              ? "inventory-stock-badge low"
                              : "inventory-stock-badge healthy"
                          }
                        >
                          {lowStock ? "Low Stock" : "Healthy"}
                        </span>
                      </td>
                      <td>
                        <div className="inventory-row-actions">
                          <button
                            type="button"
                            title="Edit inventory"
                            onClick={() => openEditForm(item)}
                          >
                            <Pencil size={17} />
                          </button>
                          <button
                            type="button"
                            title="Delete inventory"
                            onClick={() => handleDelete(item._id)}
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Low Stock Overview */}
      {!isHealthy && (
        <div className="inventory-overview-card">
          <div className="inventory-overview-header">
            <div>
              <h2>Low Stock Items</h2>
              <p>Items that need replenishment</p>
            </div>
            <AlertTriangle size={24} />
          </div>

          {inventory?.lowStockItems.map((item, index) => (
            <div className="low-stock-item" key={index}>
              <AlertTriangle size={20} />
              <span>{item}</span>
              <span className="low-stock-badge">Low Stock</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Inventory;
