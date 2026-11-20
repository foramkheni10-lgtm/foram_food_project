
import { useEffect, useMemo, useRef, useState } from "react";
import {
  MapContainer,
  Marker,
  Polyline,
  TileLayer,
  Popup,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./LiveDeliveryMap.css";

interface LiveDeliveryMapProps {
  orderNumber: string;
  orderId: string;
}

// Sample route coordinates for demonstration only.
const route: [number, number][] = [
  [21.1702, 72.8311],
  [21.1740, 72.8350],
  [21.1780, 72.8390],
  [21.1820, 72.8430],
  [21.1860, 72.8470],
];

const restaurantIcon = L.divIcon({
  className: "live-map-marker",
  html: '<div class="restaurant-pin">R</div>',
  iconSize: [34, 34],
  iconAnchor: [17, 17],
});

const deliveryIcon = L.divIcon({
  className: "live-map-marker",
  html: '<div class="delivery-pin">🛵</div>',
  iconSize: [42, 42],
  iconAnchor: [21, 21],
});

const customerIcon = L.divIcon({
  className: "live-map-marker",
  html: '<div class="customer-pin">H</div>',
  iconSize: [34, 34],
  iconAnchor: [17, 17],
});

function LiveDeliveryMap({
  orderNumber,
  orderId,
}: LiveDeliveryMapProps) {
  const [progress, setProgress] = useState(0);
  const [completionMessage, setCompletionMessage] = useState("");
  const [completionError, setCompletionError] = useState("");

  const completionStarted = useRef(false);

  // Reset the simulation when the order changes.
  useEffect(() => {
    setProgress(0);
    setCompletionMessage("");
    setCompletionError("");
    completionStarted.current = false;

    const interval = window.setInterval(() => {
      setProgress((current) => {
        const next = Math.min(1, current + 0.025);
        return next;
      });
    }, 1500);

    return () => window.clearInterval(interval);
  }, [orderNumber, orderId]);

  // Save the completed demo delivery in MongoDB.
  useEffect(() => {
    if (progress < 1 || completionStarted.current) {
      return;
    }

    completionStarted.current = true;

    const completeDelivery = async () => {
      try {
        const token = localStorage.getItem("smartfoodcourt_token");

        if (!token) {
          throw new Error("Please log in again to update this order.");
        }

        const response = await fetch(
          `https://foram-food-project.onrender.com/api/orders/${orderId}/demo-complete`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.detail || "Could not update delivery status."
          );
        }

        setCompletionMessage(
          "Delivery completed! Order status saved in MongoDB."
        );
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Something went wrong.";

        setCompletionError(message);
      }
    };

    completeDelivery();
  }, [progress, orderId]);

  const deliveryPosition = useMemo((): [number, number] => {
    const segments = route.length - 1;
    const scaledProgress = progress * segments;

    const segmentIndex = Math.min(
      Math.floor(scaledProgress),
      segments - 1
    );

    const segmentProgress =
      progress >= 1 ? 1 : scaledProgress - segmentIndex;

    const start = route[segmentIndex];
    const end = route[segmentIndex + 1];

    return [
      start[0] + (end[0] - start[0]) * segmentProgress,
      start[1] + (end[1] - start[1]) * segmentProgress,
    ];
  }, [progress]);

  const remainingMinutes = Math.max(
    0,
    Math.ceil((1 - progress) * 20)
  );

  return (
    <section className="live-delivery-section">
      <div className="live-delivery-heading">
        <div>
          <span className="live-delivery-eyebrow">
            LIVE ORDER TRACKING · DEMO
          </span>

          <h3>Track Your Delivery</h3>
          <p>Order #{orderNumber}</p>
        </div>

        <span className="live-delivery-status">
          <span className="live-status-dot" />
          {progress >= 1 ? "Arrived" : "Simulated Live"}
        </span>
      </div>

      <div className="live-delivery-map">
        <MapContainer
          center={route[0]}
          zoom={14}
          scrollWheelZoom={false}
          className="delivery-leaflet-map"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <Polyline
            positions={route}
            pathOptions={{
              color: "#d9c9bd",
              weight: 5,
            }}
          />

          <Polyline
            positions={route.slice(0, 1).concat([deliveryPosition])}
            pathOptions={{
              color: "#c65d3a",
              weight: 5,
            }}
          />

          <Marker position={route[0]} icon={restaurantIcon}>
            <Popup>Restaurant – Demo Location</Popup>
          </Marker>

          <Marker position={deliveryPosition} icon={deliveryIcon}>
            <Popup>
              {progress >= 1
                ? "Delivery completed"
                : "Delivery partner – Simulated location"}
            </Popup>
          </Marker>

          <Marker
            position={route[route.length - 1]}
            icon={customerIcon}
          >
            <Popup>Customer – Demo Destination</Popup>
          </Marker>
        </MapContainer>
      </div>

      <div className="live-delivery-info">
        <div>
          <span>Delivery partner</span>
          <strong>Smart FoodCourt Rider</strong>
        </div>

        <div>
          <span>Estimated arrival</span>
          <strong>
            {progress >= 1
              ? "Arrived"
              : `${remainingMinutes} minutes`}
          </strong>
        </div>
      </div>

      <div className="live-delivery-progress">
        <div
          className="live-delivery-progress-fill"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      {completionMessage && (
        <p style={{ color: "#4d7c0f", fontSize: "12px" }}>
          ✓ {completionMessage}
        </p>
      )}

      {completionError && (
        <p style={{ color: "#b91c1c", fontSize: "12px" }}>
          {completionError}
        </p>
      )}

      <p className="live-delivery-disclaimer">
        This is a simulated delivery route using sample map coordinates.
        It does not show an actual delivery partner's GPS location.
      </p>
    </section>
  );
}

export default LiveDeliveryMap;
