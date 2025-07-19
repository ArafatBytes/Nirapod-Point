import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import CrimeReportForm from "../components/CrimeReportForm";

function LocationPicker({ onSelect, selectedLatLng }) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng);
    },
  });
  return selectedLatLng ? (
    <Marker
      position={[selectedLatLng.lat, selectedLatLng.lng]}
      icon={
        new L.Icon({
          iconUrl:
            "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
          iconSize: [25, 41],
          iconAnchor: [12, 41],
        })
      }
    />
  ) : null;
}

export default function ReportPage() {
  const [selectedLatLng, setSelectedLatLng] = useState(null);

  // Responsive: flex-row for md+, flex-col for mobile
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-glassyblue-100 via-white to-glassyblue-200">
      {/* Map (left on desktop, top on mobile) */}
      <div className="md:w-1/2 w-full h-72 md:h-auto flex-shrink-0">
        <MapContainer
          center={[23.685, 90.3563]}
          zoom={7}
          style={{ width: "100%", height: "100%" }}
          className="rounded-none md:rounded-l-3xl shadow-xl z-10"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationPicker
            onSelect={setSelectedLatLng}
            selectedLatLng={selectedLatLng}
          />
        </MapContainer>
      </div>
      {/* Form (right on desktop, bottom on mobile) */}
      <div className="md:w-1/2 w-full flex items-center justify-center p-4 md:p-12">
        <CrimeReportForm lat={selectedLatLng?.lat} lng={selectedLatLng?.lng} />
      </div>
    </div>
  );
}
