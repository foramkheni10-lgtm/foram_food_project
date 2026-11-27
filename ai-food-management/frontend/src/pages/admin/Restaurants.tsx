
import { useEffect, useMemo, useState } from "react";
import {
  Search,
  RefreshCw,
  Store,
  MapPin,
  Eye,
  X,
  CheckCircle,
  XCircle,
  Star,
  Utensils,
  Power,
} from "lucide-react";

import api from "../../services/api";
import "./Restaurants.css";

interface Restaurant {
  _id: string;
  name?: string;
  description?: string | null;
  address?: string | null;
  image?: string | null;
  status?: string | null;
  rating?: number | null;
}

function Restaurants() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedRestaurant, setSelectedRestaurant] =
    useState<Restaurant | null>(null);

  const loadRestaurants = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/api/restaurants/");
      const data = Array.isArray(response.data?.restaurants)
        ? response.data.restaurants
        : [];

      setRestaurants(data);
    } catch (err) {
      console.error("Restaurants API Error:", err);
      setError("Unable to load restaurants. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRestaurants();
  }, []);

  const getStatus = (restaurant: Restaurant) => {
    if (!restaurant.status) return "not-set";

    return restaurant.status.toLowerCase() === "active"
      ? "active"
      : "inactive";
  };

  const updateStatus = async (restaurant: Restaurant) => {
    const currentStatus = getStatus(restaurant);
    const newStatus = currentStatus === "active" ? "Inactive" : "Active";

    const confirmed = window.confirm(
      `Are you sure you want to ${newStatus === "Active" ? "activate" : "deactivate"} ${restaurant.name || "this restaurant"}?`
    );

    if (!confirmed) return;

    try {
      setUpdatingId(restaurant._id);
      setError("");
      setSuccess("");

      await api.patch(
        `/api/restaurants/${restaurant._id}/status`,
        { status: newStatus }
      );

      setRestaurants((previous) =>
        previous.map((item) =>
          item._id === restaurant._id
            ? { ...item, status: newStatus }
            : item
        )
      );

      setSelectedRestaurant((previous) =>
        previous?._id === restaurant._id
          ? { ...previous, status: newStatus }
          : previous
      );

      setSuccess(
        `${restaurant.name || "Restaurant"} ${newStatus === "Active" ? "activated" : "deactivated"} successfully.`
      );
    } catch (err: unknown) {
      console.error("Restaurant status update error:", err);
      setError("Unable to update restaurant status. Please try again.");
    } finally {
      setUpdatingId("");
    }
  };

  const filteredRestaurants = useMemo(() => {
    return restaurants.filter((restaurant) => {
      const name = (restaurant.name || "").toLowerCase();
      const address = (restaurant.address || "").toLowerCase();
      const description = (restaurant.description || "").toLowerCase();
      const searchText = search.toLowerCase();

      const matchesSearch =
        name.includes(searchText) ||
        address.includes(searchText) ||
        description.includes(searchText);

      const status = getStatus(restaurant);

      const matchesStatus =
        statusFilter === "all" || status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [restaurants, search, statusFilter]);

  const activeCount = restaurants.filter(
    (restaurant) => getStatus(restaurant) === "active"
  ).length;

  const inactiveCount = restaurants.filter(
    (restaurant) => getStatus(restaurant) === "inactive"
  ).length;

  const notSetCount = restaurants.filter(
    (restaurant) => getStatus(restaurant) === "not-set"
  ).length;

  const getDate = (restaurant: Restaurant) => {
    const value = (restaurant as Restaurant & {
      created_at?: string;
      createdAt?: string;
    }).created_at || (restaurant as Restaurant & {
      createdAt?: string;
    }).createdAt;

    if (!value) return "Not available";

    const date = new Date(value);

    return Number.isNaN(date.getTime())
      ? "Not available"
      : date.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
  };

  if (loading) {
    return (
      <div className="restaurants-page">
        <div className="restaurants-loading">
          <RefreshCw size={30} className="restaurants-spin" />
          <p>Loading restaurants...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="restaurants-page">
      <div className="restaurants-header">
        <div>
          <p className="restaurants-welcome">
            Manage your restaurant network
          </p>
          <h1>Restaurants</h1>
          <p className="restaurants-subtitle">
            View and monitor all registered restaurants.
          </p>
        </div>

        <button
          className="restaurants-refresh-button"
          onClick={loadRestaurants}
          disabled={loading}
        >
          <RefreshCw size={18} />
          Refresh
        </button>
      </div>

      {error && <div className="restaurants-error">{error}</div>}
      {success && <div className="restaurants-success">{success}</div>}

      <div className="restaurants-summary-grid">
        <div className="restaurants-summary-card">
          <div className="restaurant-summary-icon total">
            <Store size={22} />
          </div>
          <div>
            <p>Total Restaurants</p>
            <h2>{restaurants.length}</h2>
          </div>
        </div>

        <div className="restaurants-summary-card">
          <div className="restaurant-summary-icon active">
            <CheckCircle size={22} />
          </div>
          <div>
            <p>Active</p>
            <h2>{activeCount}</h2>
          </div>
        </div>

        <div className="restaurants-summary-card">
          <div className="restaurant-summary-icon inactive">
            <XCircle size={22} />
          </div>
          <div>
            <p>Inactive</p>
            <h2>{inactiveCount}</h2>
          </div>
        </div>

        <div className="restaurants-summary-card">
          <div className="restaurant-summary-icon not-set">
            <Utensils size={22} />
          </div>
          <div>
            <p>Status Not Set</p>
            <h2>{notSetCount}</h2>
          </div>
        </div>
      </div>

      <div className="restaurants-container">
        <div className="restaurants-toolbar">
          <div className="restaurants-search">
            <Search size={19} />
            <input
              type="text"
              placeholder="Search restaurant or address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="restaurants-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Restaurants</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="not-set">Status Not Set</option>
          </select>
        </div>

        <div className="restaurant-cards">
          {filteredRestaurants.length === 0 ? (
            <div className="restaurants-empty">
              <Store size={45} />
              <h3>No restaurants found</h3>
              <p>Try changing your search or status filter.</p>
            </div>
          ) : (
            filteredRestaurants.map((restaurant, index) => {
              const status = getStatus(restaurant);
              const isUpdating = updatingId === restaurant._id;

              return (
                <div
                  className="restaurant-card"
                  key={restaurant._id}
                  style={{ animationDelay: `${index * 0.06}s` }}
                >
                  <div className="restaurant-card-top">
                    {restaurant.image ? (
                      <img
                        src={restaurant.image}
                        alt={restaurant.name || "Restaurant"}
                        className="restaurant-image"
                      />
                    ) : (
                      <div className="restaurant-logo">
                        <Store size={25} />
                      </div>
                    )}

                    <span className={`restaurant-status ${status}`}>
                      {status === "not-set"
                        ? "Not Set"
                        : status === "active"
                          ? "Active"
                          : "Inactive"}
                    </span>
                  </div>

                  <h3>{restaurant.name || "Unnamed Restaurant"}</h3>

                  <span className="restaurant-id">
                    ID: {restaurant._id.slice(-10)}
                  </span>

                  {restaurant.rating != null && (
                    <div className="restaurant-rating">
                      <Star size={15} fill="currentColor" />
                      {restaurant.rating}
                    </div>
                  )}

                  <div className="restaurant-details">
                    <div>
                      <MapPin size={16} />
                      <span>
                        {restaurant.address || "Address not available"}
                      </span>
                    </div>
                  </div>

                  <div className="restaurant-card-footer">
                    <span>Added {getDate(restaurant)}</span>

                    <button
                      className="restaurant-view-button"
                      onClick={() => setSelectedRestaurant(restaurant)}
                    >
                      <Eye size={16} />
                      View
                    </button>
                  </div>

                  <button
                    className={`restaurant-toggle-button ${
                      status === "active" ? "deactivate" : "activate"
                    }`}
                    onClick={() => updateStatus(restaurant)}
                    disabled={isUpdating}
                  >
                    {isUpdating ? (
                      <RefreshCw size={16} className="restaurants-spin" />
                    ) : (
                      <Power size={16} />
                    )}

                    {isUpdating
                      ? "Updating..."
                      : status === "active"
                        ? "Deactivate"
                        : "Activate"}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {selectedRestaurant && (
        <div
          className="restaurant-modal-overlay"
          onClick={() => setSelectedRestaurant(null)}
        >
          <div
            className="restaurant-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="restaurant-modal-header">
              <div className="restaurant-modal-title">
                <div className="restaurant-modal-icon">
                  <Store size={25} />
                </div>
                <div>
                  <p>Restaurant Details</p>
                  <h2>{selectedRestaurant.name || "Restaurant"}</h2>
                </div>
              </div>

              <button
                className="restaurant-modal-close"
                onClick={() => setSelectedRestaurant(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="restaurant-modal-body">
              <div className="restaurant-detail-row">
                <span>Restaurant ID</span>
                <strong>{selectedRestaurant._id}</strong>
              </div>

              <div className="restaurant-detail-row">
                <span>Name</span>
                <strong>{selectedRestaurant.name || "Not available"}</strong>
              </div>

              <div className="restaurant-detail-row">
                <span>Description</span>
                <strong>
                  {selectedRestaurant.description || "Not available"}
                </strong>
              </div>

              <div className="restaurant-detail-row">
                <span>Address</span>
                <strong>
                  {selectedRestaurant.address || "Not available"}
                </strong>
              </div>

              <div className="restaurant-detail-row">
                <span>Rating</span>
                <strong>
                  {selectedRestaurant.rating ?? "Not available"}
                </strong>
              </div>

              <div className="restaurant-detail-row">
                <span>Created</span>
                <strong>{getDate(selectedRestaurant)}</strong>
              </div>

              <div className="restaurant-detail-status">
                <span>Status</span>
                <span className={`restaurant-status ${getStatus(selectedRestaurant)}`}>
                  {getStatus(selectedRestaurant) === "not-set"
                    ? "Not Set"
                    : getStatus(selectedRestaurant) === "active"
                      ? "Active"
                      : "Inactive"}
                </span>
              </div>

              <button
                className={`restaurant-toggle-button ${
                  getStatus(selectedRestaurant) === "active"
                    ? "deactivate"
                    : "activate"
                }`}
                onClick={() => updateStatus(selectedRestaurant)}
                disabled={updatingId === selectedRestaurant._id}
              >
                <Power size={16} />
                {updatingId === selectedRestaurant._id
                  ? "Updating..."
                  : getStatus(selectedRestaurant) === "active"
                    ? "Deactivate Restaurant"
                    : "Activate Restaurant"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Restaurants;
