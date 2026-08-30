import {
  GoogleMap,
  Marker,
  DirectionsRenderer,
  useJsApiLoader,
} from "@react-google-maps/api";
import { useState, useEffect, useRef, useMemo } from "react";
import { useParams } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import CloseIcon from "@mui/icons-material/Close";
// import { appConfig } from "./config";

export default function HandymanTrackingMap() {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyDpcQs7a9Gl4cX5UKJeHFcvgvBCHlv6SAs", // 🔑 Replace with your real key
  });

  const { id } = useParams();
  const [position, setPosition] = useState({ lat: 0, lng: 0 });
  const [distance, setDistance] = useState(null);
  const mapRef = useRef(null);
  const [groceryData, setGroceryData] = useState([]);
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Directions API state
  const [directions, setDirections] = useState(null);
  const [routeStarted, setRouteStarted] = useState(false);
  const [customerPhoneNumber, setCustomerPhoneNumber] = useState("");
  const [deliveryPartnerUserId, setDeliveryPartnerUserId] = useState("");

  useEffect(() => {
    console.log(loading, groceryData);
  }, [loading, groceryData]);

  // 🔹 Fetch destination data
  useEffect(() => {
    const fetchGroceryData = async () => {
      try {
        const response = await fetch(
          `https://localhost:7091/api/Mart/GetProductDetails?id=${id}`,
        );
        if (!response.ok) throw new Error("Failed to fetch ticket data");
        const data = await response.json();

        const tickets = Array.isArray(data)
          ? data
          : data && typeof data === "object"
            ? [data]
            : [];

        setGroceryData(tickets);

        const first = tickets[0] || {};
        setLatitude(first.latitude ? parseFloat(first.latitude) : null);
        setLongitude(first.longitude ? parseFloat(first.longitude) : null);
        const phone =
          first.customerPhoneNumber || first.customer?.phoneNumber || "N/A";
        setCustomerPhoneNumber(phone);
        console.log("Phone from API:", phone);
        setDeliveryPartnerUserId(first.deliveryPartnerUserId || "N/A");
      } catch (error) {
        console.error("Error fetching ticket data:", error);
        setGroceryData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchGroceryData();
  }, [id]);

  const destination = useMemo(() => {
    const lat = typeof latitude === "number" ? latitude : parseFloat(latitude);
    const lng =
      typeof longitude === "number" ? longitude : parseFloat(longitude);
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      return { lat, lng };
    }
    return null;
  }, [latitude, longitude]);

  const calculateDistance = (pos1, pos2) => {
    if (
      !pos1 ||
      !pos2 ||
      !Number.isFinite(pos1.lat) ||
      !Number.isFinite(pos1.lng) ||
      !Number.isFinite(pos2.lat) ||
      !Number.isFinite(pos2.lng)
    ) {
      return null;
    }

    const R = 6371;
    const dLat = ((pos2.lat - pos1.lat) * Math.PI) / 180;
    const dLon = ((pos2.lng - pos1.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((pos1.lat * Math.PI) / 180) *
        Math.cos((pos2.lat * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(2);
  };

  // ✅ Track handyman live location
  useEffect(() => {
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const newPosition = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setPosition(newPosition);

        if (destination) {
          const d = calculateDistance(newPosition, destination);
          if (d !== null) setDistance(d);
        }

        // Auto-center map
        if (mapRef.current) {
          mapRef.current.panTo(newPosition);
        }
      },
      (err) => {
        console.error("Error watching position:", err);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000,
      },
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [destination]);

  // ✅ Start Route Function
  const startRoute = () => {
    if (!destination || !position.lat || !position.lng) return;

    const directionsService = new window.google.maps.DirectionsService();

    directionsService.route(
      {
        origin: position,
        destination: destination,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === "OK") {
          setDirections(result);
          setRouteStarted(true);
        } else {
          console.error("Directions request failed due to " + status);
        }
      },
    );
  };

  if (!isLoaded) return <p>Loading map...</p>;

  return (
    <>
      <Header />
      <div
        className="d-flex align-items-center gap-2"
        style={{
          position: "fixed",
          top: "90px",
          right: "20px",
          zIndex: 1000,
          cursor: "pointer",
        }}
        onClick={() =>
          (window.location.href = `/profilePage/customer/${deliveryPartnerUserId}`)
        }
      >
        <p className="text-dark mb-0">
          Customer Phone Number: {customerPhoneNumber || "N/A"}
        </p>
        <CloseIcon style={{ fontSize: "28px", color: "red" }} />
      </div>
      <div className="container m-1">
        <div style={{ position: "relative", marginTop: "150px" }}>
          {/* ✅ Distance Display */}
          {distance && (
            <div
              style={{
                position: "absolute",
                top: 10,
                left: 10,
                zIndex: 999,
                background: "white",
                padding: "8px 12px",
                borderRadius: "8px",
                boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
                fontWeight: "bold",
              }}
            >
              Distance to destination: {distance} km
            </div>
          )}

          <GoogleMap
            center={position}
            zoom={15}
            mapContainerStyle={{ height: "100vh", width: "100%" }}
            onLoad={(map) => (mapRef.current = map)}
          >
            {/* ✅ Handyman live location */}
            <Marker
              position={position}
              icon={{
                url: "https://res.cloudinary.com/du4y50nvl/image/upload/v1758803979/greenbike_anlntu.png",
                scaledSize: isLoaded
                  ? new window.google.maps.Size(40, 40)
                  : null,
              }}
            />

            {/* ✅ Destination marker (before starting route) */}
            {destination && !routeStarted && (
              <Marker position={destination} label="🏠" />
            )}

            {/* ✅ Driving route when started */}
            {directions && <DirectionsRenderer directions={directions} />}
          </GoogleMap>

          {/* ✅ Start Button */}
          {destination && (
            <button
              onClick={startRoute}
              style={{
                position: "absolute",
                bottom: "20px",
                left: "50%",
                transform: "translateX(-50%)",
                padding: "10px 20px",
                background: "blue",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                zIndex: 999,
              }}
            >
              Start
            </button>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
