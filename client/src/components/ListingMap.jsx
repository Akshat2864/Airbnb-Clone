import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

// Fix default marker icon paths in Vite
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const defaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export default function ListingMap({ coordinates, title, address }) {
  if (
    !coordinates ||
    !Number.isFinite(coordinates.lat) ||
    !Number.isFinite(coordinates.lng)
  ) {
    return <p>Location coordinates are unavailable.</p>;
  }

  const position = [coordinates.lat, coordinates.lng];

  return (
    <div style={{ height: "400px", width: "100%" }}>
      <MapContainer
        center={position}
        zoom={13}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%", borderRadius: "12px" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker position={position} icon={defaultIcon}>
          <Popup>
            <strong>{title}</strong>
            <br />
            {address}
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}