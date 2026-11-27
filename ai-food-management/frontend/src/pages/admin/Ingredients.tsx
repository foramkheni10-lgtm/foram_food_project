
import { useEffect, useState } from "react";
import {
  Carrot,
  Package,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Info,
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
} from "lucide-react";

import api from "../../services/api";
import "./Ingredients.css";

interface InventoryOverview {
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
  description?: string;
}

interface IngredientForm {
  name: string;
  category: string;
  unit: string;
  description: string;
}

const emptyForm: IngredientForm = {
  name: "",
  category: "",
  unit: "",
  description: "",
};

function Ingredients() {
  const [data, setData] = useState<InventoryOverview | null>(null);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<IngredientForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const fetchIngredients = async () => {
    try {
      setLoading(true);
      setError("");

      const [overviewResponse, ingredientResponse] = await Promise.all([
        api.get("/api/admin/inventory-overview"),
        api.get("/ingredients/"),
      ]);

      setData(overviewResponse.data);

      const result = ingredientResponse.data;
      setIngredients(
        Array.isArray(result)
          ? result
          : result.ingredients || result.data || []
      );
    } catch (err) {
      console.error(err);
      setError("Failed to load ingredient information.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIngredients();
  }, []);

  const openAddForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
    setMessage("");
  };

  const openEditForm = (ingredient: Ingredient) => {
    setEditingId(ingredient._id);
    setForm({
      name: ingredient.name,
      category: ingredient.category,
      unit: ingredient.unit,
      description: ingredient.description || "",
    });
    setShowForm(true);
    setMessage("");
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setSaving(true);
      setMessage("");

      if (editingId) {
        await api.put(`/ingredients/${editingId}`, form);
        setMessage("Ingredient updated successfully.");
      } else {
        await api.post("/ingredients/", form);
        setMessage("Ingredient added successfully.");
      }

      setShowForm(false);
      setForm(emptyForm);
      setEditingId(null);

      await fetchIngredients();
    } catch (err: any) {
      console.error(err);
      setMessage(
        err.response?.data?.detail || "Failed to save ingredient."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this ingredient?")) {
      return;
    }

    try {
      await api.delete(`/ingredients/${id}`);
      setMessage("Ingredient deleted successfully.");
      await fetchIngredients();
    } catch (err: any) {
      console.error(err);
      setMessage(
        err.response?.data?.detail ||
        "Unable to delete ingredient. It may be linked to inventory."
      );
    }
  };

  if (loading) {
    return (
      <div className="ingredients-page">
        <div className="ingredients-loading">
          <RefreshCw size={32} />
          <p>Loading ingredients...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ingredients-page">
        <div className="ingredients-error">
          <AlertTriangle size={30} />
          <p>{error}</p>
          <button onClick={fetchIngredients}>
            <RefreshCw size={17} />
            Retry
          </button>
        </div>
      </div>
    );
  }

  const isHealthy = (data?.lowStockCount ?? 0) === 0;

  return (
    <div className="ingredients-page">
      <div className="ingredients-header">
        <div>
          <span className="ingredients-eyebrow">
            INGREDIENT MANAGEMENT
          </span>
          <h1>Ingredients</h1>
          <p>Manage ingredients and monitor stock health.</p>
        </div>

        <div className="ingredients-header-actions">
          <button
            className="ingredients-refresh"
            onClick={fetchIngredients}
          >
            <RefreshCw size={18} />
            Refresh
          </button>

          <button
            className="ingredients-add-button"
            onClick={openAddForm}
          >
            <Plus size={18} />
            Add Ingredient
          </button>
        </div>
      </div>

      {message && (
        <div className="ingredients-message">
          {message}
          <button onClick={() => setMessage("")}>
            <X size={16} />
          </button>
        </div>
      )}

      {showForm && (
        <div className="ingredients-form-card">
          <div className="ingredients-form-heading">
            <h2>{editingId ? "Edit Ingredient" : "Add New Ingredient"}</h2>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              aria-label="Close form"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSave}>
            <div className="ingredients-form-grid">
              <label>
                Ingredient Name *
                <input
                  required
                  minLength={2}
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                  placeholder="e.g. Paneer"
                />
              </label>

              <label>
                Category *
                <input
                  required
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                  placeholder="e.g. Dairy"
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
                  placeholder="e.g. kg, litre, pieces"
                />
              </label>

              <label>
                Description
                <input
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Enter description"
                />
              </label>
            </div>

            <div className="ingredients-form-actions">
              <button
                type="button"
                className="ingredients-cancel-button"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="ingredients-add-button"
                disabled={saving}
              >
                <Save size={17} />
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Update Ingredient"
                    : "Save Ingredient"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="ingredients-stats">
        <div className="ingredients-stat-card">
          <div className="ingredients-stat-icon">
            <Carrot size={24} />
          </div>
          <div>
            <span>Total Ingredients</span>
            <strong>{data?.totalIngredients ?? ingredients.length}</strong>
            <small>Available in system</small>
          </div>
        </div>

        <div className="ingredients-stat-card">
          <div className="ingredients-stat-icon">
            <Package size={24} />
          </div>
          <div>
            <span>Inventory Items</span>
            <strong>{data?.totalInventoryItems ?? 0}</strong>
            <small>Total inventory records</small>
          </div>
        </div>

        <div className="ingredients-stat-card">
          <div className="ingredients-stat-icon">
            <AlertTriangle size={24} />
          </div>
          <div>
            <span>Low Stock</span>
            <strong>{data?.lowStockCount ?? 0}</strong>
            <small>Need attention</small>
          </div>
        </div>

        <div className="ingredients-stat-card">
          <div className="ingredients-stat-icon ingredients-success-icon">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <span>Stock Status</span>
            <strong>{isHealthy ? "Healthy" : "Attention"}</strong>
            <small>
              {isHealthy
                ? "All stock levels are healthy"
                : "Low stock detected"}
            </small>
          </div>
        </div>
      </div>

      <div className="ingredients-main-card">
        <div className="ingredients-card-header">
          <div>
            <h2>Ingredient Overview</h2>
            <p>All registered ingredients in your system</p>
          </div>
          <div className="ingredients-card-icon">
            <Carrot size={24} />
          </div>
        </div>

        {ingredients.length === 0 ? (
          <div className="ingredients-healthy">
            <Info size={38} />
            <h3>No Ingredients Found</h3>
            <p>Click Add Ingredient to create your first ingredient.</p>
          </div>
        ) : (
          <div className="ingredients-table-wrapper">
            <table className="ingredients-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Ingredient Name</th>
                  <th>Category</th>
                  <th>Unit</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {ingredients.map((ingredient, index) => (
                  <tr key={ingredient._id}>
                    <td>{index + 1}</td>
                    <td><strong>{ingredient.name}</strong></td>
                    <td>{ingredient.category}</td>
                    <td>{ingredient.unit}</td>
                    <td>{ingredient.description || "—"}</td>
                    <td>
                      <div className="ingredients-row-actions">
                        <button
                          onClick={() => openEditForm(ingredient)}
                          title="Edit ingredient"
                        >
                          <Pencil size={17} />
                        </button>
                        <button
                          onClick={() => handleDelete(ingredient._id)}
                          title="Delete ingredient"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!isHealthy && (
        <div className="ingredients-main-card">
          <div className="ingredients-warning-title">
            <AlertTriangle size={22} />
            <h3>Low Stock Ingredients</h3>
          </div>

          {data?.lowStockItems.map((item, index) => (
            <div className="ingredient-item" key={index}>
              <Carrot size={19} />
              <span>{item}</span>
              <span className="ingredient-low-badge">Low Stock</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Ingredients;
