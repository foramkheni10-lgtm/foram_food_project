import { useEffect, useState } from "react";
import "./PurchaseOrders.css";

interface PurchaseOrder {
  _id: string;
  supplier_id: string;
  ingredient_name: string;
  quantity: number;
  unit: string;
  status: string;
}

interface PurchaseOrderResponse {
  status: string;
  count: number;
  purchase_orders: PurchaseOrder[];
}

interface Supplier {
  _id: string;
  name: string;
  contact_person: string;
  phone: string;
  email: string;
  address: string;
}

interface SupplierResponse {
  status: string;
  count: number;
  suppliers: Supplier[];
}

function PurchaseOrders() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [supplierId, setSupplierId] = useState("");
  const [ingredientName, setIngredientName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [status, setStatus] = useState("pending");

  const [editingId, setEditingId] = useState<string | null>(null);

  // GET PURCHASE ORDERS
  const fetchOrders = () => {
    setLoading(true);
    setError("");

    fetch("http://127.0.0.1:8000/purchase-orders/")
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch purchase orders");
        }
        return response.json();
      })
      .then((data: PurchaseOrderResponse) => {
        setOrders(data.purchase_orders || []);
      })
      .catch((error) => {
        console.error("Purchase Order API Error:", error);
        setError("Unable to load purchase orders");
      })
      .finally(() => setLoading(false));
  };

  // GET SUPPLIERS
  const fetchSuppliers = () => {
    fetch("http://127.0.0.1:8000/suppliers/")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch suppliers");
        }
        return response.json();
      })
      .then((data: SupplierResponse) => {
        setSuppliers(data.suppliers || []);
      })
      .catch((error) => {
        console.error("Supplier API Error:", error);
      });
  };

  useEffect(() => {
    fetchOrders();
    fetchSuppliers();
  }, []);

  // SUMMARY COUNTS
  const totalOrders = orders.length;

  const pendingOrders = orders.filter(
    (order) => order.status.toLowerCase() === "pending"
  ).length;

  const orderedOrders = orders.filter(
    (order) => order.status.toLowerCase() === "ordered"
  ).length;

  const receivedOrders = orders.filter(
    (order) => order.status.toLowerCase() === "received"
  ).length;

  // CLEAR FORM
  const clearForm = () => {
    setSupplierId("");
    setIngredientName("");
    setQuantity("");
    setUnit("");
    setStatus("pending");
    setEditingId(null);
    setShowForm(false);
  };

  // CREATE PURCHASE ORDER
  const handleAddOrder = (event: React.FormEvent) => {
    event.preventDefault();

    const orderData = {
      supplier_id: supplierId,
      ingredient_name: ingredientName.trim(),
      quantity: Number(quantity),
      unit: unit.trim(),
      status,
    };

    fetch("http://127.0.0.1:8000/purchase-orders/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData),
    })
      .then(async (response) => {
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || "Failed to create purchase order");
        }

        return data;
      })
      .then(() => {
        alert("Purchase order created successfully");
        clearForm();
        fetchOrders();
      })
      .catch((error) => {
        console.error("Add Purchase Order Error:", error);
        alert(error.message);
      });
  };

  // EDIT PURCHASE ORDER
  const handleEdit = (order: PurchaseOrder) => {
    if (order.status.toLowerCase() === "received") {
      alert("Received purchase orders cannot be edited");
      return;
    }

    setEditingId(order._id);
    setSupplierId(order.supplier_id);
    setIngredientName(order.ingredient_name);
    setQuantity(String(order.quantity));
    setUnit(order.unit);
    setStatus(order.status.toLowerCase());
    setShowForm(true);
  };

  // UPDATE PURCHASE ORDER
  const handleUpdateOrder = (event: React.FormEvent) => {
    event.preventDefault();

    if (!editingId) return;

    const orderData = {
      supplier_id: supplierId,
      ingredient_name: ingredientName.trim(),
      quantity: Number(quantity),
      unit: unit.trim(),
      status,
    };

    fetch(`http://127.0.0.1:8000/purchase-orders/${editingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData),
    })
      .then(async (response) => {
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || "Failed to update purchase order");
        }

        return data;
      })
      .then(() => {
        alert("Purchase order updated successfully");
        clearForm();
        fetchOrders();
      })
      .catch((error) => {
        console.error("Update Purchase Order Error:", error);
        alert(error.message);
      });
  };

  // DELETE PURCHASE ORDER
  const handleDelete = (order: PurchaseOrder) => {
    if (order.status.toLowerCase() === "received") {
      alert("Received purchase orders cannot be deleted");
      return;
    }

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this purchase order?"
    );

    if (!confirmDelete) return;

    fetch(`http://127.0.0.1:8000/purchase-orders/${order._id}`, {
      method: "DELETE",
    })
      .then(async (response) => {
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || "Failed to delete purchase order");
        }

        return data;
      })
      .then(() => {
        alert("Purchase order deleted successfully");
        fetchOrders();
      })
      .catch((error) => {
        console.error("Delete Purchase Order Error:", error);
        alert(error.message);
      });
  };

  // RECEIVE PURCHASE ORDER
  const handleReceive = (orderId: string) => {
    const confirmReceive = window.confirm(
      "Mark this purchase order as received?"
    );

    if (!confirmReceive) return;

    fetch(`http://127.0.0.1:8000/purchase-orders/${orderId}/receive`, {
      method: "POST",
    })
      .then(async (response) => {
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || "Failed to receive purchase order");
        }

        return data;
      })
      .then(() => {
        alert("Purchase order received successfully");
        fetchOrders();
      })
      .catch((error) => {
        console.error("Receive Purchase Order Error:", error);
        alert(error.message);
      });
  };

  return (
    <main className="purchase-orders-page">

      {/* HEADER */}
      <div className="purchase-orders-header">
        <div>
          <p className="purchase-orders-welcome">
            PURCHASE ORDER MANAGEMENT
          </p>
          <h1>Purchase Orders</h1>
          <span>
            Manage ingredient purchases, suppliers and order status.
          </span>
        </div>

        <button
          className="add-order-btn"
          onClick={() => {
            setEditingId(null);
            setShowForm(!showForm);
          }}
        >
          + Create Purchase Order
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div className="purchase-order-error">
          {error}
        </div>
      )}

      {/* SUMMARY CARDS */}
      <div className="purchase-order-summary">

        <div className="summary-card total-card">
          <div>
            <p>Total Orders</p>
            <h2>{totalOrders}</h2>
          </div>
          {/* <span className="summary-icon"></span> */}
        </div>

        <div className="summary-card pending-card">
          <div>
            <p>Pending Orders</p>
            <h2>{pendingOrders}</h2>
          </div>
          {/* <span className="summary-icon">⏳</span> */}
        </div>

        <div className="summary-card ordered-card">
          <div>
            <p>Ordered</p>
            <h2>{orderedOrders}</h2>
          </div>
          {/* <span className="summary-icon">📦</span> */}
        </div>

        <div className="summary-card received-card">
          <div>
            <p>Received Orders</p>
            <h2>{receivedOrders}</h2>
          </div>
          {/* <span className="summary-icon">✅</span> */}
        </div>

      </div>

      {/* FORM */}
      {showForm && (
        <div
          className={`purchase-order-form-container ${
            editingId ? "edit-form" : ""
          }`}
        >
          <h2>
            {editingId ? "Edit Purchase Order" : "Create New Purchase Order"}
          </h2>

          {editingId && (
            <p className="editing-order">
              Update purchase order information below.
            </p>
          )}

          <form onSubmit={editingId ? handleUpdateOrder : handleAddOrder}>

            <div className="form-group">
              <label>Supplier</label>
              <select
                value={supplierId}
                onChange={(event) => setSupplierId(event.target.value)}
                required
              >
                <option value="">Select Supplier</option>
                {suppliers.map((supplier) => (
                  <option key={supplier._id} value={supplier._id}>
                    {supplier.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Ingredient Name</label>
              <input
                type="text"
                placeholder="Enter ingredient name"
                value={ingredientName}
                onChange={(event) => setIngredientName(event.target.value)}
                required
                minLength={1}
              />
            </div>

            <div className="form-group">
              <label>Quantity</label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                placeholder="Enter quantity"
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Unit</label>
              <input
                type="text"
                placeholder="kg, litre, pcs..."
                value={unit}
                onChange={(event) => setUnit(event.target.value)}
                required
                minLength={1}
              />
            </div>

            <div className="form-group">
              <label>Status</label>
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
              >
                <option value="pending">Pending</option>
                <option value="ordered">Ordered</option>
              </select>
            </div>

            <div className="form-buttons">
              <button type="submit" className="save-btn">
                {editingId ? "Update Order" : "Create Order"}
              </button>

              <button
                type="button"
                className="cancel-btn"
                onClick={clearForm}
              >
                Cancel
              </button>
            </div>

          </form>
        </div>
      )}

      {/* PURCHASE ORDER TABLE */}
      <div className="purchase-order-table-container">
        {loading ? (
          <div className="purchase-order-message">
            Loading purchase orders...
          </div>
        ) : orders.length === 0 ? (
          <div className="purchase-order-message">
            <h3>No Purchase Orders Found</h3>
            <p>
              Create your first purchase order using the button above.
            </p>
          </div>
        ) : (
          <table className="purchase-order-table">
            <thead>
              <tr>
                <th>Supplier</th>
                <th>Ingredient</th>
                <th>Quantity</th>
                <th>Unit</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((order) => {
                const supplier = suppliers.find(
                  (item) => item._id === order.supplier_id
                );

                const isReceived =
                  order.status.toLowerCase() === "received";

                return (
                  <tr key={order._id}>
                    <td>
                      <div className="supplier-id">
                        {supplier ? supplier.name : order.supplier_id}
                      </div>
                    </td>

                    <td>
                      <div className="ingredient-name">
                        🥕 {order.ingredient_name}
                      </div>
                    </td>

                    <td>{order.quantity}</td>
                    <td>{order.unit}</td>

                    <td>
                      <span
                        className={`order-status ${order.status.toLowerCase()}`}
                      >
                        {order.status}
                      </span>
                    </td>

                    <td>
                      <div className="action-buttons">
                        <button
                          className="edit-btn"
                          onClick={() => handleEdit(order)}
                          disabled={isReceived}
                        >
                          Edit
                        </button>

                        <button
                          className="receive-btn"
                          onClick={() => handleReceive(order._id)}
                          disabled={isReceived}
                        >
                          Receive
                        </button>

                        <button
                          className="delete-btn"
                          onClick={() => handleDelete(order)}
                          disabled={isReceived}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

    </main>
  );
}

export default PurchaseOrders;
