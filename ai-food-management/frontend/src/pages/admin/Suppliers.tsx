import { useEffect, useState, type FormEvent } from "react";
import "./Suppliers.css";

const API_URL = "http://127.0.0.1:8000/suppliers";

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
  count?: number;
  suppliers?: Supplier[];
  supplier?: Supplier;
  detail?: string;
  message?: string;
}

const emptyForm = {
  name: "",
  contact_person: "",
  phone: "",
  email: "",
  address: "",
};

function Suppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedSupplier, setSelectedSupplier] =
    useState<Supplier | null>(null);

  const [formData, setFormData] = useState(emptyForm);

  // GET ALL SUPPLIERS
  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/`);

      const data: SupplierResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to load suppliers");
      }

      setSuppliers(data.suppliers || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load suppliers"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  // HANDLE INPUT CHANGES
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // OPEN ADD FORM
  const openAddForm = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setShowForm(true);
    setSelectedSupplier(null);
    setError("");
    setSuccess("");
  };

  // CLOSE FORM
  const closeForm = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  // ADD / UPDATE SUPPLIER
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const url = editingId
        ? `${API_URL}/${editingId}`
        : `${API_URL}/`;

      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data: SupplierResponse = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || data.message || "Unable to save supplier"
        );
      }

      setSuccess(
        editingId
          ? "Supplier updated successfully"
          : "Supplier added successfully"
      );

      closeForm();
      await fetchSuppliers();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setSaving(false);
    }
  };

  // OPEN EDIT FORM
  const handleEdit = (supplier: Supplier) => {
    setFormData({
      name: supplier.name || "",
      contact_person: supplier.contact_person || "",
      phone: supplier.phone || "",
      email: supplier.email || "",
      address: supplier.address || "",
    });

    setEditingId(supplier._id);
    setShowForm(true);
    setSelectedSupplier(null);
    setError("");
    setSuccess("");
  };

  // VIEW SUPPLIER
  const handleView = async (supplierId: string) => {
    try {
      setError("");

      const response = await fetch(`${API_URL}/${supplierId}`);
      const data: SupplierResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Unable to view supplier");
      }

      if (data.supplier) {
        setSelectedSupplier(data.supplier);
        setShowForm(false);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to view supplier"
      );
    }
  };

  // DELETE SUPPLIER
  const handleDelete = async (supplierId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this supplier?"
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      const response = await fetch(`${API_URL}/${supplierId}`, {
        method: "DELETE",
      });

      const data: SupplierResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Unable to delete supplier");
      }

      setSuccess("Supplier deleted successfully");

      if (selectedSupplier?._id === supplierId) {
        setSelectedSupplier(null);
      }

      await fetchSuppliers();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to delete supplier"
      );
    }
  };

  return (
    <main className="suppliers-page">

      {/* HEADER */}
      <div className="suppliers-header">
        <div>
          <p className="suppliers-welcome">SUPPLIER MANAGEMENT</p>
          <h1>Suppliers</h1>
          <span>
            Manage your ingredient suppliers and their contact information.
          </span>
        </div>

        <button className="add-supplier-btn" onClick={openAddForm}>
          + Add Supplier
        </button>
      </div>

      {/* MESSAGES */}
      {error && <div className="supplier-error">{error}</div>}
      {success && <div className="supplier-success">{success}</div>}

      {/* ADD / EDIT FORM */}
      {showForm && (
        <div className={`supplier-form-container ${editingId ? "edit-form" : ""}`}>
          <h2>{editingId ? "Edit Supplier" : "Add New Supplier"}</h2>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Supplier Name</label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter supplier name"
                required
              />
            </div>

            <div className="form-group">
              <label>Contact Person</label>
              <input
                name="contact_person"
                value={formData.contact_person}
                onChange={handleChange}
                placeholder="Enter contact person"
                required
              />
            </div>

            <div className="form-group">
              <label>Phone</label>
              <input
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter phone number"
                required
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email address"
                required
              />
            </div>

            <div className="form-group full-width">
              <label>Address</label>
              <input
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter supplier address"
                required
              />
            </div>

            <div className="form-buttons">
              <button type="submit" className="save-btn" disabled={saving}>
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Update Supplier"
                    : "Save Supplier"}
              </button>

              <button
                type="button"
                className="cancel-btn"
                onClick={closeForm}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* VIEW SUPPLIER DETAILS */}
      {selectedSupplier && (
        <div className="supplier-details-container">
          <div className="details-header">
            <h2>Supplier Details</h2>
            <button
              className="close-details-btn"
              onClick={() => setSelectedSupplier(null)}
            >
              Close
            </button>
          </div>

          <div className="supplier-details-grid">
            <div>
              <label>Supplier Name</label>
              <p>{selectedSupplier.name}</p>
            </div>

            <div>
              <label>Contact Person</label>
              <p>{selectedSupplier.contact_person}</p>
            </div>

            <div>
              <label>Phone</label>
              <p>{selectedSupplier.phone}</p>
            </div>

            <div>
              <label>Email</label>
              <p>{selectedSupplier.email}</p>
            </div>

            <div className="full-width">
              <label>Address</label>
              <p>{selectedSupplier.address}</p>
            </div>
          </div>

          <button
            className="edit-btn"
            onClick={() => handleEdit(selectedSupplier)}
          >
            Edit Supplier
          </button>
        </div>
      )}

      {/* SUPPLIER TABLE */}
      <div className="supplier-table-container">
        {loading ? (
          <div className="supplier-message">Loading suppliers...</div>
        ) : suppliers.length === 0 ? (
          <div className="supplier-message">
            <h3>No Suppliers Found</h3>
            <p>Add your first supplier using the button above.</p>
          </div>
        ) : (
          <table className="supplier-table">
            <thead>
              <tr>
                <th>Supplier Name</th>
                <th>Contact Person</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Address</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {suppliers.map((supplier) => (
                <tr key={supplier._id}>
                  <td className="supplier-name">
                    🏭 {supplier.name}
                  </td>

                  <td>{supplier.contact_person}</td>
                  <td>{supplier.phone}</td>
                  <td>{supplier.email}</td>
                  <td>{supplier.address}</td>

                  <td>
                    <div className="action-buttons">
                      <button
                        className="view-btn"
                        onClick={() => handleView(supplier._id)}
                      >
                        View
                      </button>

                      <button
                        className="edit-btn"
                        onClick={() => handleEdit(supplier)}
                      >
                        Edit
                      </button>

                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(supplier._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}

export default Suppliers;
