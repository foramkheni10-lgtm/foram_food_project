
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import api from "../services/api";
interface LocationData {
  latitude: number;
  longitude: number;
  status: string;
  locationSharing: boolean;
}

const deliveryIcon = new L.Icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

function MoveMap({ location }: { location: LocationData }) {
  const map = useMap();

  useEffect(() => {
    map.setView(
      [location.latitude, location.longitude],
      16
    );
  }, [location, map]);

  return null;
}

function CustomerTracking() {
  const { deliveryId } = useParams();

  const [location, setLocation] = useState<LocationData | null>(null);
  const [message, setMessage] = useState("Waiting for delivery location...");

  useEffect(() => {
    if (!deliveryId) return;

    let active = true;

    const fetchLocation = async () => {
      try {
        const response = await api.get(
          `/api/deliveries/${deliveryId}/location`
        );

        if (!active) return;

        setLocation(response.data);
        setMessage(
          response.data.locationSharing
            ? "Delivery person location is updating."
            : "Showing last available location."
        );
      } catch {
        if (active) {
          setMessage("Delivery location is not available yet.");
        }
      }
    };

    fetchLocation();

    const interval = window.setInterval(fetchLocation, 5000);

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [deliveryId]);

  return (
    <div style={{ padding: 24 }}>
      <h2>Live Delivery Tracking</h2>
      <p>{message}</p>

      {location ? (
        <>
          <p>Delivery status: {location.status}</p>

          <div style={{ height: 450, width: "100%" }}>
            <MapContainer
              center={[
                location.latitude,
                location.longitude
              ]}
              zoom={16}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <Marker
                position={[
                  location.latitude,
                  location.longitude
                ]}
                icon={deliveryIcon}
              >
                <Popup>Delivery person's current location</Popup>
              </Marker>

              <MoveMap location={location} />
            </MapContainer>
          </div>
        </>
      ) : (
        <p>Map will appear when the delivery person shares GPS.</p>
      )}
    </div>
  );
}

export default CustomerTracking;
