
import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  Truck,
  Search,
  RefreshCw,
  Clock,
  CheckCircle,
  Package,
  Eye,
  X,
  MapPin,
  PackageCheck,
  ArrowRight,
  UserPlus,
  Navigation,
  Phone,
} from "lucide-react";

import api from "../../services/api";
import "./Deliveries.css";

interface Delivery {
  _id?: string;
  id?: string;
  orderId?: string;
  tokenNumber?: string | number;
  token?: string | number;
  customerName?: string;
  customer?: string;
  deliveryPerson?: string;
  deliveryPersonName?: string;
  driverName?: string;
  phone?: string;
  address?: string;
  deliveryAddress?: string;
  status?: string;
  amount?: number;
  totalAmount?: number;
  total?: number;
  createdAt?: string;
  created_at?: string;
  assignedAt?: string;
  updatedAt?: string;
  latitude?: number;
  longitude?: number;
}

interface DeliveryLocation {
  latitude: number;
  longitude: number;
  locationUpdatedAt?: string;
  locationSharing?: boolean;
  status?: string;
}

type DeliveryStatus =
  | "assigned"
  | "picked_up"
  | "out_for_delivery"
  | "delivered";

function Deliveries() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [selectedDelivery, setSelectedDelivery] =
    useState<Delivery | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);

  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [assigning, setAssigning] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const [assignForm, setAssignForm] = useState({
    orderId: "",
    deliveryPerson: "",
    phone: "",
  });

  const [deliveryLocation, setDeliveryLocation] =
    useState<DeliveryLocation | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);

  /* =========================
     HELPERS
     ========================= */

  const getDeliveryId = (delivery: Delivery) =>
    delivery._id || delivery.id || "";

  const getStatus = (delivery: Delivery): DeliveryStatus => {
    const status = delivery.status?.toLowerCase();

    if (
      status === "assigned" ||
      status === "picked_up" ||
      status === "out_for_delivery" ||
      status === "delivered"
    ) {
      return status;
    }

    return "assigned";
  };

  const getCustomer = (delivery: Delivery) =>
    delivery.customerName || delivery.customer || "Customer";

  const getOrderId = (delivery: Delivery) =>
    delivery.orderId || "N/A";

  const getToken = (delivery: Delivery) =>
    delivery.tokenNumber ||
    delivery.token ||
    getOrderId(delivery).slice(-5);

  const getDeliveryPerson = (delivery: Delivery) =>
    delivery.deliveryPersonName ||
    delivery.deliveryPerson ||
    delivery.driverName ||
    "Not Assigned";

  const getAddress = (delivery: Delivery) =>
    delivery.deliveryAddress ||
    delivery.address ||
    "Address not available";

  const getAmount = (delivery: Delivery) =>
    delivery.totalAmount ?? delivery.amount ?? delivery.total ?? 0;

  const getDate = (delivery: Delivery) => {
    const date =
      delivery.createdAt ||
      delivery.created_at ||
      delivery.assignedAt;

    if (!date) return "N/A";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return "N/A";

    return parsedDate.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case "assigned":
        return "Assigned";
      case "picked_up":
        return "Picked Up";
      case "out_for_delivery":
        return "Out for Delivery";
      case "delivered":
        return "Delivered";
      default:
        return status;
    }
  };

  const StatusIcon = ({ status }: { status: string }) => {
    switch (status) {
      case "assigned":
        return <Clock size={15} />;
      case "picked_up":
        return <PackageCheck size={15} />;
      case "out_for_delivery":
        return <Truck size={15} />;
      case "delivered":
        return <CheckCircle size={15} />;
      default:
        return <Clock size={15} />;
    }
  };

  const getNextStatus = (
    status: DeliveryStatus
  ): DeliveryStatus | null => {
    switch (status) {
      case "assigned":
        return "picked_up";
      case "picked_up":
        return "out_for_delivery";
      case "out_for_delivery":
        return "delivered";
      default:
        return null;
    }
  };

  /* =========================
     FETCH DELIVERIES
     ========================= */

  const fetchDeliveries = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      setError("");

      const response = await api.get("/api/deliveries/");

      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.deliveries ||
          response.data?.data ||
          [];

      setDeliveries(data);

      setSelectedDelivery((previous) => {
        if (!previous) return previous;

        const selectedId = getDeliveryId(previous);

        return (
          data.find(
            (item: Delivery) =>
              getDeliveryId(item) === selectedId
          ) || previous
        );
      });
    } catch (err: any) {
      console.error("Deliveries API Error:", err);

      setError(
        err?.response?.data?.detail ||
          "Unable to load delivery data. Please check the backend API."
      );
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, []);

  /* =========================
     ASSIGN DELIVERY PERSON
     ========================= */

  const assignDelivery = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (
      !assignForm.orderId.trim() ||
      !assignForm.deliveryPerson.trim() ||
      !assignForm.phone.trim()
    ) {
      setError("Please fill in all delivery assignment fields.");
      return;
    }

    try {
      setAssigning(true);
      setError("");
      setStatusMessage("");

      const response = await api.post(
        `/api/deliveries/assign/${assignForm.orderId.trim()}`,
        {
          deliveryPerson: assignForm.deliveryPerson.trim(),
          phone: assignForm.phone.trim(),
        }
      );

      setStatusMessage(
        response.data?.message ||
          "Delivery person assigned successfully."
      );

      setAssignForm({
        orderId: "",
        deliveryPerson: "",
        phone: "",
      });

      setShowAssignModal(false);

      await fetchDeliveries(false);
    } catch (err: any) {
      console.error("Assign Delivery Error:", err);

      const detail = err?.response?.data?.detail;

      setError(
        typeof detail === "string"
          ? detail
          : "Unable to assign delivery person."
      );
    } finally {
      setAssigning(false);
    }
  };

  /* =========================
     UPDATE DELIVERY STATUS
     ========================= */

  const updateDeliveryStatus = async (
    delivery: Delivery,
    newStatus: DeliveryStatus
  ) => {
    const deliveryId = getDeliveryId(delivery);

    if (!deliveryId) {
      setError("Delivery ID is missing.");
      return;
    }

    try {
      setUpdatingId(deliveryId);
      setError("");
      setStatusMessage("");

      const response = await api.patch(
        `/api/deliveries/${deliveryId}/status`,
        null,
        {
          params: {
            status: newStatus,
          },
        }
      );

      setDeliveries((previous) =>
        previous.map((item) =>
          getDeliveryId(item) === deliveryId
            ? { ...item, status: newStatus }
            : item
        )
      );

      setSelectedDelivery((previous) =>
        previous && getDeliveryId(previous) === deliveryId
          ? { ...previous, status: newStatus }
          : previous
      );

      setStatusMessage(
        response.data?.message ||
          `Delivery status updated to ${statusLabel(newStatus)}.`
      );

      await fetchDeliveries(false);
    } catch (err: any) {
      console.error("Delivery Status Update Error:", err);

      const detail = err?.response?.data?.detail;

      setError(
        typeof detail === "string"
          ? detail
          : "Unable to update delivery status."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  /* =========================
     FETCH GPS LOCATION
     ========================= */

  const fetchDeliveryLocation = async (deliveryId: string) => {
    try {
      setLocationLoading(true);
      setDeliveryLocation(null);

      const response = await api.get(
        `/api/deliveries/${deliveryId}/location`
      );

      setDeliveryLocation(response.data);
    } catch (err: any) {
      console.error("Delivery Location Error:", err);
      setDeliveryLocation(null);
    } finally {
      setLocationLoading(false);
    }
  };

  /* =========================
     FILTER DELIVERIES
     ========================= */

  const filteredDeliveries = useMemo(() => {
    return deliveries.filter((delivery) => {
      const text = search.toLowerCase();

      const matchesSearch =
        getCustomer(delivery).toLowerCase().includes(text) ||
        getOrderId(delivery).toLowerCase().includes(text) ||
        String(getToken(delivery)).toLowerCase().includes(text) ||
        getDeliveryPerson(delivery).toLowerCase().includes(text);

      const status = getStatus(delivery);

      const matchesStatus =
        statusFilter === "all" || status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [deliveries, search, statusFilter]);

  /* =========================
     COUNTS
     ========================= */

  const assignedCount = deliveries.filter(
    (item) => getStatus(item) === "assigned"
  ).length;

  const pickedUpCount = deliveries.filter(
    (item) => getStatus(item) === "picked_up"
  ).length;

  const outForDeliveryCount = deliveries.filter(
    (item) => getStatus(item) === "out_for_delivery"
  ).length;

  const deliveredCount = deliveries.filter(
    (item) => getStatus(item) === "delivered"
  ).length;

  /* =========================
     LOADING
     ========================= */

  if (loading) {
    return (
      <div className="delivery-page">
        <div className="delivery-loading">
          <Truck size={36} className="delivery-loading-icon" />
          <p>Loading deliveries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="delivery-page">
      {/* HEADER */}

      <div className="delivery-header">
        <div>
          <p className="delivery-welcome">
            Delivery Management
          </p>

          <h1>Deliveries</h1>

          <p className="delivery-subtitle">
            Assign delivery partners and track customer deliveries.
          </p>
        </div>

        <div className="delivery-header-actions">
          <button
            className="delivery-assign-button"
            onClick={() => {
              setError("");
              setShowAssignModal(true);
            }}
          >
            <UserPlus size={17} />
            Assign Delivery
          </button>

          <button
            className="delivery-refresh-button"
            onClick={() => fetchDeliveries()}
          >
            <RefreshCw size={18} />
            Refresh
          </button>
        </div>
      </div>

      {/* MESSAGES */}

      {error && (
        <div className="delivery-error">
          {error}
        </div>
      )}

      {statusMessage && (
        <div className="delivery-success">
          {statusMessage}
        </div>
      )}

      {/* STATISTICS */}

      <div className="delivery-stats">
        <div className="delivery-stat-card">
          <div className="delivery-stat-icon pending">
            <Clock size={22} />
          </div>
          <div>
            <p>Assigned</p>
            <h2>{assignedCount}</h2>
          </div>
        </div>

        <div className="delivery-stat-card">
          <div className="delivery-stat-icon transit">
            <PackageCheck size={22} />
          </div>
          <div>
            <p>Picked Up</p>
            <h2>{pickedUpCount}</h2>
          </div>
        </div>

        <div className="delivery-stat-card">
          <div className="delivery-stat-icon transit">
            <Truck size={22} />
          </div>
          <div>
            <p>Out for Delivery</p>
            <h2>{outForDeliveryCount}</h2>
          </div>
        </div>

        <div className="delivery-stat-card">
          <div className="delivery-stat-icon delivered">
            <CheckCircle size={22} />
          </div>
          <div>
            <p>Delivered</p>
            <h2>{deliveredCount}</h2>
          </div>
        </div>
      </div>

      {/* DELIVERY CONTAINER */}

      <div className="delivery-container">
        <div className="delivery-toolbar">
          <div>
            <h2>Delivery Orders</h2>
            <p>
              {filteredDeliveries.length} deliveries found
            </p>
          </div>

          <div className="delivery-controls">
            <div className="delivery-search">
              <Search size={18} />
              <input
                type="text"
                placeholder="Search delivery..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select
              className="delivery-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="assigned">Assigned</option>
              <option value="picked_up">Picked Up</option>
              <option value="out_for_delivery">Out for Delivery</option>
              <option value="delivered">Delivered</option>
            </select>
          </div>
        </div>

        {/* DELIVERY CARDS */}

        <div className="delivery-grid">
          {filteredDeliveries.length === 0 ? (
            <div className="delivery-empty">
              <Truck size={50} />
              <h3>No deliveries found</h3>
              <p>
                Assign a delivery person to an order or change your search filter.
              </p>
            </div>
          ) : (
            filteredDeliveries.map((delivery, index) => {
              const status = getStatus(delivery);
              const deliveryId = getDeliveryId(delivery);
              const nextStatus = getNextStatus(status);
              const isUpdating = updatingId === deliveryId;

              return (
                <div
                  className="delivery-card"
                  key={deliveryId || `${getOrderId(delivery)}-${index}`}
                  style={{
                    animationDelay: `${index * 0.06}s`,
                  }}
                >
                  <div className="delivery-card-top">
                    <div className="delivery-token">
                      <span>TOKEN</span>
                      <strong>#{getToken(delivery)}</strong>
                    </div>

                    <div className={`delivery-status ${status}`}>
                      <StatusIcon status={status} />
                      {statusLabel(status)}
                    </div>
                  </div>

                  <div className="delivery-customer">
                    <div className="delivery-customer-icon">
                      <Package size={18} />
                    </div>

                    <div>
                      <strong>{getCustomer(delivery)}</strong>
                      <span>
                        Order #{getOrderId(delivery).slice(-8)}
                      </span>
                    </div>
                  </div>

                  <div className="delivery-person">
                    <span>Delivery Partner</span>
                    <strong>{getDeliveryPerson(delivery)}</strong>

                    {delivery.phone && (
                      <a href={`tel:${delivery.phone}`}>
                        <Phone size={13} />
                        {delivery.phone}
                      </a>
                    )}
                  </div>

                  <div className="delivery-address">
                    <MapPin size={16} />
                    <span>{getAddress(delivery)}</span>
                  </div>

                  <div className="delivery-footer">
                    <div>
                      <span>Assigned Time</span>
                      <strong>{getDate(delivery)}</strong>
                    </div>

                    <div>
                      <span>Amount</span>
                      <strong>
                        ₹{Number(getAmount(delivery)).toLocaleString("en-IN")}
                      </strong>
                    </div>

                    <button
                      className="delivery-view-button"
                      onClick={() => {
                        setSelectedDelivery(delivery);
                        setDeliveryLocation(null);
                        setStatusMessage("");
                        setShowModal(true);

                        if (deliveryId) {
                          fetchDeliveryLocation(deliveryId);
                        }
                      }}
                    >
                      <Eye size={16} />
                      View
                    </button>
                  </div>

                  {nextStatus && (
                    <div className="delivery-card-action">
                      <button
                        className="delivery-status-action"
                        disabled={isUpdating}
                        onClick={() =>
                          updateDeliveryStatus(delivery, nextStatus)
                        }
                      >
                        {isUpdating ? (
                          <>
                            <RefreshCw size={15} className="spin" />
                            Updating...
                          </>
                        ) : (
                          <>
                            {nextStatus === "picked_up" && (
                              <PackageCheck size={15} />
                            )}
                            {nextStatus === "out_for_delivery" && (
                              <Truck size={15} />
                            )}
                            {nextStatus === "delivered" && (
                              <CheckCircle size={15} />
                            )}

                            Mark as {statusLabel(nextStatus)}
                            <ArrowRight size={15} />
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {status === "delivered" && (
                    <div className="delivery-completed-message">
                      <CheckCircle size={15} />
                      Delivery completed
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ASSIGN DELIVERY MODAL */}

      {showAssignModal && (
        <div
          className="delivery-modal-overlay"
          onClick={() => setShowAssignModal(false)}
        >
          <div
            className="delivery-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="delivery-modal-header">
              <div className="delivery-modal-title">
                <div className="delivery-modal-icon">
                  <UserPlus size={24} />
                </div>

                <div>
                  <p>Delivery Management</p>
                  <h2>Assign Delivery Person</h2>
                </div>
              </div>

              <button
                className="delivery-modal-close"
                onClick={() => setShowAssignModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form
              className="delivery-assign-form"
              onSubmit={assignDelivery}
            >
              <label htmlFor="delivery-order-id">
                Order ID
              </label>

              <input
                id="delivery-order-id"
                value={assignForm.orderId}
                onChange={(e) =>
                  setAssignForm({
                    ...assignForm,
                    orderId: e.target.value,
                  })
                }
                placeholder="Enter MongoDB order ID"
                required
              />

              <label htmlFor="delivery-person-name">
                Delivery Person Name
              </label>

              <input
                id="delivery-person-name"
                value={assignForm.deliveryPerson}
                onChange={(e) =>
                  setAssignForm({
                    ...assignForm,
                    deliveryPerson: e.target.value,
                  })
                }
                placeholder="Enter delivery person's name"
                required
              />

              <label htmlFor="delivery-person-phone">
                Phone Number
              </label>

              <input
                id="delivery-person-phone"
                type="tel"
                value={assignForm.phone}
                onChange={(e) =>
                  setAssignForm({
                    ...assignForm,
                    phone: e.target.value,
                  })
                }
                placeholder="Enter phone number"
                required
              />

              <button
                type="submit"
                className="delivery-status-action"
                disabled={assigning}
              >
                {assigning ? (
                  <>
                    <RefreshCw size={16} className="spin" />
                    Assigning...
                  </>
                ) : (
                  <>
                    <UserPlus size={16} />
                    Assign Delivery Person
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* DELIVERY DETAILS MODAL */}

      {showModal && selectedDelivery && (
        <div
          className="delivery-modal-overlay"
          onClick={() => setShowModal(false)}
        >
          <div
            className="delivery-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="delivery-modal-header">
              <div className="delivery-modal-title">
                <div className="delivery-modal-icon">
                  <Truck size={24} />
                </div>

                <div>
                  <p>Delivery Details</p>
                  <h2>Token #{getToken(selectedDelivery)}</h2>
                </div>
              </div>

              <button
                className="delivery-modal-close"
                onClick={() => setShowModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="delivery-modal-body">
              <div className="delivery-detail">
                <span>Customer</span>
                <strong>{getCustomer(selectedDelivery)}</strong>
              </div>

              <div className="delivery-detail">
                <span>Order ID</span>
                <strong>{getOrderId(selectedDelivery)}</strong>
              </div>

              <div className="delivery-detail">
                <span>Delivery Partner</span>
                <strong>{getDeliveryPerson(selectedDelivery)}</strong>
              </div>

              <div className="delivery-detail">
                <span>Phone</span>
                <strong>{selectedDelivery.phone || "Not available"}</strong>
              </div>

              <div className="delivery-detail">
                <span>Address</span>
                <strong>{getAddress(selectedDelivery)}</strong>
              </div>

              <div className="delivery-detail">
                <span>Amount</span>
                <strong>
                  ₹{Number(getAmount(selectedDelivery)).toLocaleString("en-IN")}
                </strong>
              </div>

              <div className="delivery-detail">
                <span>Assigned Time</span>
                <strong>{getDate(selectedDelivery)}</strong>
              </div>

              <div className="delivery-detail-status">
                <span>Status</span>

                <div
                  className={`delivery-status ${getStatus(selectedDelivery)}`}
                >
                  <StatusIcon status={getStatus(selectedDelivery)} />
                  {statusLabel(getStatus(selectedDelivery))}
                </div>
              </div>

              {/* GPS LOCATION */}

              <div className="delivery-gps-section">
                <div className="delivery-gps-heading">
                  <div>
                    <Navigation size={19} />
                    <strong>Delivery Person Location</strong>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const id = getDeliveryId(selectedDelivery);
                      if (id) fetchDeliveryLocation(id);
                    }}
                    disabled={locationLoading}
                  >
                    <RefreshCw
                      size={14}
                      className={locationLoading ? "spin" : ""}
                    />
                    Refresh
                  </button>
                </div>

                {locationLoading ? (
                  <p>Fetching delivery location...</p>
                ) : deliveryLocation ? (
                  <>
                    <p>
                      Latitude: {deliveryLocation.latitude}
                    </p>

                    <p>
                      Longitude: {deliveryLocation.longitude}
                    </p>

                    <p>
                      Location Sharing:{" "}
                      {deliveryLocation.locationSharing
                        ? "Active"
                        : "Inactive"}
                    </p>

                    {deliveryLocation.locationUpdatedAt && (
                      <p>
                        Last Updated:{" "}
                        {new Date(
                          deliveryLocation.locationUpdatedAt
                        ).toLocaleString("en-IN")}
                      </p>
                    )}

                    <a
                      href={`https://www.google.com/maps?q=${deliveryLocation.latitude},${deliveryLocation.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="delivery-map-link"
                    >
                      <MapPin size={16} />
                      View on Google Maps
                    </a>
                  </>
                ) : (
                  <p>
                    Delivery person's location is not available yet.
                  </p>
                )}
              </div>

              {/* NEXT STATUS */}

              {getNextStatus(getStatus(selectedDelivery)) && (
                <div className="delivery-modal-action">
                  <p>Next Step</p>

                  <button
                    className="delivery-status-action modal-action"
                    disabled={
                      updatingId === getDeliveryId(selectedDelivery)
                    }
                    onClick={() =>
                      updateDeliveryStatus(
                        selectedDelivery,
                        getNextStatus(getStatus(selectedDelivery))!
                      )
                    }
                  >
                    {updatingId === getDeliveryId(selectedDelivery) ? (
                      <>
                        <RefreshCw size={15} className="spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        Mark as{" "}
                        {statusLabel(
                          getNextStatus(getStatus(selectedDelivery))!
                        )}
                        <ArrowRight size={15} />
                      </>
                    )}
                  </button>
                </div>
              )}

              {getStatus(selectedDelivery) === "delivered" && (
                <div className="delivery-completed-message modal-completed">
                  <CheckCircle size={16} />
                  Delivery completed successfully
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Deliveries;
