import React, { useState, useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
  Polyline,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import CrimeReportForm from "../components/CrimeReportForm";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

const crimeTypeColors = {
  robbery: "red",
  assault: "purple",
  harassment: "gold",
  theft: "blue",
  other: "gray",
};

// Custom icon for markers
const getCrimeIcon = (type) => {
  const color = crimeTypeColors[type?.toLowerCase()] || "gray";
  // SVG for a modern pin: thin pin, solid colored ball, white highlight
  const svg = `
    <svg xmlns='http://www.w3.org/2000/svg' width='40' height='60' viewBox='0 0 40 60'>
      <line x1='20' y1='24' x2='20' y2='58' stroke='#888' stroke-width='2.5'/>
      <circle cx='20' cy='18' r='14' fill='${color}' stroke='#fff' stroke-width='2'/>
      <ellipse cx='15' cy='13' rx='5' ry='2.5' fill='white' opacity='0.5'/>
    </svg>
  `;
  return new L.Icon({
    iconUrl: `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`,
    iconSize: [40, 60],
    iconAnchor: [20, 58], // tip of the pin
    popupAnchor: [0, -30],
  });
};

function LocationMarker({ onSelect }) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng);
    },
  });
  return null;
}

const MapPage = () => {
  const [crimes, setCrimes] = useState([]);
  const [filter, setFilter] = useState("all");
  const [selectedLatLng, setSelectedLatLng] = useState(null);
  const [route, setRoute] = useState([]); // Array of latlngs
  const [selectingRoute, setSelectingRoute] = useState(false);
  const [routePoints, setRoutePoints] = useState([]); // [start, end]
  const [networkType, setNetworkType] = useState("drive"); // 'drive' or 'walk'
  const [routeModalOpen, setRouteModalOpen] = useState(false);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState("");
  const [showRouteInstruction, setShowRouteInstruction] = useState(false);
  const mapRef = useRef();
  const navigate = useNavigate();
  const { jwt } = useUser();

  // Fetch real crimes on mount
  useEffect(() => {
    async function fetchCrimes() {
      try {
        const res = await fetch("/api/crimes", {
          headers: { Authorization: jwt ? `Bearer ${jwt}` : undefined },
        });
        if (!res.ok) throw new Error("Failed to fetch crimes");
        const data = await res.json();
        // Transform crimes to add lat/lng
        const crimesWithLatLng = data.map((c) => ({
          ...c,
          lat: c.location?.coordinates?.[1],
          lng: c.location?.coordinates?.[0],
        }));
        setCrimes(crimesWithLatLng);
      } catch (err) {
        setCrimes([]);
      }
    }
    fetchCrimes();
  }, [jwt]);

  // Compute hourData and dayData from real crimes
  const hourData = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`,
    count: 0,
  }));
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dayData = dayNames.map((day) => ({ day, count: 0 }));
  crimes.forEach((c) => {
    if (c.time) {
      const d = new Date(c.time);
      const hour = d.getHours();
      hourData[hour].count++;
      const day = d.getDay();
      dayData[day].count++;
    }
  });

  // Filter crimes by type
  const filteredCrimes =
    filter === "all"
      ? crimes
      : crimes.filter((c) => c.type.toLowerCase() === filter);

  // Handle map click for reporting or route selection
  const handleMapClick = async (latlng) => {
    if (selectingRoute) {
      if (routePoints.length === 0) {
        setRoutePoints([latlng]);
      } else if (routePoints.length === 1) {
        setRoutePoints([routePoints[0], latlng]);
        setRouteLoading(true);
        setRouteError("");
        setRoute([]);
        try {
          const res = await fetch("/api/routes/safest", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: jwt ? `Bearer ${jwt}` : undefined,
            },
            body: JSON.stringify({
              startLat: routePoints[0].lat,
              startLng: routePoints[0].lng,
              endLat: latlng.lat,
              endLng: latlng.lng,
              networkType: networkType,
            }),
          });
          if (!res.ok) throw new Error("Failed to fetch route");
          const data = await res.json();
          if (data.route && data.route.length > 1) {
            setRoute(data.route.map((pt) => ({ lat: pt.lat, lng: pt.lng })));
            setRouteError("");
          } else {
            setRoute([]);
            setRouteError("No safe route found for the selected points.");
          }
          setSelectingRoute(false);
          setShowRouteInstruction(false);
        } catch (err) {
          setRouteError("Failed to fetch route");
        } finally {
          setRouteLoading(false);
        }
      }
    }
  };

  // Handle filter change
  const handleFilterChange = (e) => setFilter(e.target.value);

  // Handle network type change
  const handleNetworkTypeChange = (e) => setNetworkType(e.target.value);

  // Handle start route selection
  const startRouteSelection = () => {
    setRouteModalOpen(true);
    setSelectingRoute(false);
    setRoutePoints([]);
    setRoute([]);
    setRouteError("");
    setShowRouteInstruction(false);
  };

  const beginSelectingRoute = () => {
    setRouteModalOpen(false);
    setSelectingRoute(true);
    setRoutePoints([]);
    setRoute([]);
    setRouteError("");
    setShowRouteInstruction(true);
  };

  const resetRouteSelection = () => {
    setSelectingRoute(false);
    setRoutePoints([]);
    setRoute([]);
    setRouteModalOpen(false);
    setRouteError("");
    setShowRouteInstruction(false);
  };

  return (
    <div className="w-full h-screen flex flex-col bg-gray-100">
      <div
        className="flex flex-row items-center justify-between p-6 mt-20 mx-auto max-w-4xl rounded-2xl bg-white/30 backdrop-blur-md border border-glassyblue-200/40 shadow-2xl z-20 mb-2"
        style={{ boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.18)" }}
      >
        <h1 className="text-2xl md:text-3xl font-extrabold text-glassyblue-700 tracking-tight drop-shadow-lg mr-8 whitespace-nowrap">
          Bangladesh Crime Map
        </h1>
        <div className="flex flex-row items-center gap-4 flex-1 justify-end">
          <label className="font-medium text-glassyblue-700">Crime Type:</label>
          <select
            value={filter}
            onChange={handleFilterChange}
            className="rounded-lg border border-glassyblue-200 p-2 bg-white/60 focus:outline-none focus:ring-2 focus:ring-glassyblue-400"
          >
            <option value="all">All</option>
            <option value="robbery">Robbery</option>
            <option value="assault">Assault</option>
            <option value="harassment">Harassment</option>
            <option value="theft">Theft</option>
            <option value="other">Other</option>
          </select>
          <button
            onClick={startRouteSelection}
            className="ml-4 px-6 py-2 rounded-full bg-glassyblue-500 text-black font-semibold shadow-lg hover:bg-glassyblue-600 transition-colors duration-200 backdrop-blur-md border border-white/20"
          >
            Safest Route
          </button>
        </div>
      </div>
      <div className="flex-1 relative">
        <MapContainer
          center={[23.685, 90.3563]}
          zoom={7}
          style={{ height: "100%", width: "100%" }}
          ref={mapRef}
          className="z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {filteredCrimes.map((crime) => (
            <Marker
              key={crime.id}
              position={[crime.lat, crime.lng]}
              icon={getCrimeIcon(crime.type)}
            >
              <Popup>
                <div>
                  <strong>
                    {crime.type.charAt(0).toUpperCase() + crime.type.slice(1)}
                  </strong>
                  <br />
                  {crime.description}
                  <br />
                  <span className="text-xs text-gray-500">
                    {new Date(crime.time).toLocaleString()}
                  </span>
                </div>
              </Popup>
            </Marker>
          ))}
          {route.length > 1 && (
            <Polyline
              positions={route.map((p) => [p.lat, p.lng])}
              color={networkType === "walk" ? "purple" : "green"}
            />
          )}
          {/* Show source/destination markers while selecting */}
          {selectingRoute && routePoints[0] && (
            <Marker
              position={[routePoints[0].lat, routePoints[0].lng]}
              icon={
                new L.Icon({
                  iconUrl:
                    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
                  iconSize: [25, 41],
                  iconAnchor: [12, 41],
                })
              }
            />
          )}
          {selectingRoute && routePoints[1] && (
            <Marker
              position={[routePoints[1].lat, routePoints[1].lng]}
              icon={
                new L.Icon({
                  iconUrl:
                    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
                  iconSize: [25, 41],
                  iconAnchor: [12, 41],
                })
              }
            />
          )}
          <LocationMarker onSelect={handleMapClick} />
        </MapContainer>
        {/* Safest Route Modal - moved outside MapContainer for z-index fix */}
        {routeModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 relative">
              <h2 className="text-xl font-bold mb-4">Find Safest Route</h2>
              <label className="block mb-2 font-medium">Route Type:</label>
              <select
                value={networkType}
                onChange={handleNetworkTypeChange}
                className="border rounded px-2 py-1 mb-4 w-full"
              >
                <option value="drive">Drive</option>
                <option value="walk">Walk</option>
              </select>
              <div className="mb-4">
                <p className="mb-1">Instructions:</p>
                <ul className="list-disc list-inside text-sm text-gray-700">
                  <li>
                    After clicking 'Start Selecting', click on the map to select{" "}
                    <span className="font-semibold">source</span> (green
                    marker).
                  </li>
                  <li>
                    Then click to select{" "}
                    <span className="font-semibold">destination</span> (red
                    marker).
                  </li>
                </ul>
              </div>
              <div className="flex flex-row justify-end gap-2">
                <button
                  onClick={resetRouteSelection}
                  className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={beginSelectingRoute}
                  className="px-4 py-2 rounded bg-blue-500 hover:bg-blue-600 text-white font-semibold"
                >
                  Start Selecting
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Floating instruction while selecting route */}
        {showRouteInstruction && selectingRoute && (
          <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-40 bg-blue-100 border border-blue-300 text-blue-900 px-6 py-2 rounded shadow-lg">
            {routePoints.length === 0 &&
              "Click on the map to select source (green marker)."}
            {routePoints.length === 1 &&
              "Click on the map to select destination (red marker)."}
          </div>
        )}
      </div>
      <div className="flex flex-row w-full bg-white shadow p-4">
        <div className="w-1/2 h-48">
          <h2 className="font-semibold mb-2">Crimes by Hour</h2>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={hourData.filter((h) => h.count > 0)}>
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="w-1/2 h-48">
          <h2 className="font-semibold mb-2">Crimes by Day</h2>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dayData.filter((d) => d.count > 0)}>
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default MapPage;
