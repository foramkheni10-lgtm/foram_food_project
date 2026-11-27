
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
function DriverLocation() {
  const { deliveryId } = useParams();

  const [sharing, setSharing] = useState(false);
  const [message, setMessage] = useState("Location sharing is stopped.");
  const watchId = useRef<number | null>(null);

  const stopSharing = () => {
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }

    setSharing(false);
    setMessage("Location sharing stopped.");
  };

  const startSharing = async () => {
    if (!deliveryId) {
      setMessage("Delivery ID is missing.");
      return;
    }

    if (!navigator.geolocation) {
      setMessage("GPS is not supported by this browser.");
      return;
    }

    try {
      const response = await api.get(
        `/api/deliveries/${deliveryId}`
      );

      if (response.data.status === "delivered") {
        setMessage("This delivery is already completed.");
        return;
      }
    } catch {
      setMessage("Unable to find this delivery.");
      return;
    }

    setMessage("Waiting for GPS permission...");

    watchId.current = navigator.geolocation.watchPosition(
      async (position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        };

        try {
          await api.put(
            `/api/deliveries/${deliveryId}/location`,
            location
          );

          setSharing(true);
          setMessage(
            `Location shared: ${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`
          );
        } catch {
          setMessage("Unable to upload GPS location.");
        }
      },
      (error) => {
        setMessage(error.message);
        stopSharing();
      },
      {
        enableHighAccuracy: true,
        maximumAge: 3000,
        timeout: 15000
      }
    );
  };

  useEffect(() => {
    return () => {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
      }
    };
  }, []);

  return (
    <div style={{ padding: 30, maxWidth: 600, margin: "auto" }}>
      <h2>Delivery GPS Tracking</h2>

      <p>Delivery ID: {deliveryId}</p>

      <p>{message}</p>

      <button
        onClick={startSharing}
        disabled={sharing}
        style={{
          padding: "12px 20px",
          background: "#c65d3a",
          color: "white",
          border: 0,
          borderRadius: 8,
          cursor: "pointer",
          marginRight: 10
        }}
      >
        Start Sharing Location
      </button>

      <button
        onClick={stopSharing}
        disabled={!sharing}
        style={{
          padding: "12px 20px",
          background: "#333",
          color: "white",
          border: 0,
          borderRadius: 8,
          cursor: "pointer"
        }}
      >
        Stop Sharing
      </button>
    </div>
  );
}

export default DriverLocation;
