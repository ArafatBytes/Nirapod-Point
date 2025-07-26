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
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import PhotonSearchBar from "../components/PhotonSearchBar";
import { isInBangladeshPolygon } from "../utils/bangladeshPolygon";
import Card from "../components/card/Card";
import {
  Box,
  Flex,
  SimpleGrid,
  Text,
  useColorModeValue,
  Icon,
  List,
  ListItem,
  Spinner,
  InputGroup,
  InputRightElement,
  Input,
  InputLeftElement,
  Select,
  Button,
  Divider,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import { AnimatePresence } from "framer-motion";
import FixedPlugin from "../components/fixedPlugin/FixedPlugin";

const crimeTypeColors = {
  murder: "#FF0000",
  rape: "#FF1493",
  kidnap: "#8A2BE2",
  assault: "#FF8C00",
  robbery: "#008080",
  harassment: "#FFD700",
  theft: "#00CED1",
  others: "#808080",
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
      if (!isInBangladeshPolygon(e.latlng.lat, e.latlng.lng)) {
        toast.error("Please select a location within Bangladesh.");
        return;
      }
      onSelect(e.latlng);
    },
  });
  return null;
}

// MapSearchBar (Chakra UI style, ported from ReportPage)
function MapSearchBar({ placeholder, onSelect }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef();
  const timeoutRef = useRef();

  const fetchSuggestions = async (q) => {
    if (!q || q.length < 2) {
      setSuggestions([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(
          q
        )}&limit=5&bbox=88.0,20.5,92.7,26.7`
      );
      const data = await res.json();
      setSuggestions(
        (data.features || []).map((f) => ({
          name:
            f.properties.name || f.properties.city || f.properties.country || q,
          desc: f.properties.country
            ? `${f.properties.city ? f.properties.city + ", " : ""}${
                f.properties.country
              }`
            : "",
          lat: f.geometry.coordinates[1],
          lng: f.geometry.coordinates[0],
        }))
      );
    } catch {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    setShowDropdown(true);
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => fetchSuggestions(val), 300);
  };

  const handleSelect = (s) => {
    setQuery(s.name);
    setShowDropdown(false);
    setSuggestions([]);
    onSelect && onSelect(s);
  };

  React.useEffect(() => {
    const handler = (e) => {
      if (!inputRef.current?.contains(e.target)) setShowDropdown(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const bg = useColorModeValue("secondaryGray.300", "navy.900");
  const border = useColorModeValue("secondaryGray.400", "whiteAlpha.300");
  const dropdownBg = useColorModeValue("white", "navy.800");
  const highlight = useColorModeValue("brand.100", "brand.700");
  const textColor = useColorModeValue("gray.700", "white");
  const descColor = useColorModeValue("gray.500", "gray.300");
  const shadow = useColorModeValue("lg", "dark-lg");

  return (
    <Box ref={inputRef} w={{ base: "90vw", md: "320px" }} position="relative">
      <InputGroup size="lg">
        <InputLeftElement pointerEvents="none">
          <Icon as={SearchIcon} color="brand.400" boxSize={6} />
        </InputLeftElement>
        <Input
          value={query}
          onChange={handleChange}
          onFocus={() => setShowDropdown(true)}
          placeholder={placeholder || "Search for a place..."}
          borderRadius="30px"
          borderWidth="2px"
          borderColor={border}
          bg={bg}
          color={textColor}
          fontWeight={500}
          fontSize={"lg"}
          boxShadow={shadow}
          _hover={{ borderColor: "brand.400" }}
          _focus={{ borderColor: "brand.400", boxShadow: "0 0 0 2px #7551FF" }}
          pr={12}
        />
        {loading && (
          <InputRightElement width="2.5rem" pr={2}>
            <Spinner size="sm" color="brand.400" />
          </InputRightElement>
        )}
      </InputGroup>
      {showDropdown && suggestions.length > 0 && (
        <Box
          position="absolute"
          top={14}
          left={0}
          w="100%"
          minW={0}
          zIndex={100}
          bg={dropdownBg}
          borderRadius="2xl"
          boxShadow={shadow}
          borderWidth="2px"
          borderColor={border}
          mt={2}
          py={2}
        >
          <List spacing={1}>
            {suggestions.map((s, i) => (
              <ListItem
                key={i}
                px={4}
                py={3}
                borderRadius="xl"
                cursor="pointer"
                bg={i === 0 ? highlight : "transparent"}
                _hover={{ bg: highlight }}
                transition="background 0.15s"
                onClick={() => handleSelect(s)}
                onMouseDown={(e) => e.preventDefault()}
                display="flex"
                alignItems="center"
              >
                <Text fontWeight={600} color={textColor} fontSize="md">
                  {s.name}
                </Text>
                {s.desc && (
                  <Text color={descColor} fontSize="sm" ml={2}>
                    {s.desc}
                  </Text>
                )}
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </Box>
  );
}

const MapPage = () => {
  const [crimes, setCrimes] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [bounds, setBounds] = useState(null);
  const [selectedLatLng, setSelectedLatLng] = useState(null);
  const [route, setRoute] = useState([]); // Array of latlngs
  const [selectingRoute, setSelectingRoute] = useState(false);
  const [routePoints, setRoutePoints] = useState([]); // [start, end]
  const [networkType, setNetworkType] = useState("drive"); // 'drive' or 'walk'
  const [routeModalOpen, setRouteModalOpen] = useState(false);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState("");
  const [showRouteInstruction, setShowRouteInstruction] = useState(false);
  const [mapCenter, setMapCenter] = useState([23.685, 90.3563]);
  const [searchMode, setSearchMode] = useState("source"); // "source" or "destination"
  const [isMobileLegendOpen, setIsMobileLegendOpen] = useState(false);
  const mapRef = useRef();
  const navigate = useNavigate();
  const { jwt } = useUser();

  // Toast refs
  const sourceToastId = useRef(null);
  const destToastId = useRef(null);

  // Function to fetch crimes within current map bounds
  const fetchCrimesInBounds = async (bounds, type = filter) => {
    if (!bounds) return;

    setLoading(true);
    try {
      const res = await fetch(
        `/api/crimes/bounds?minLat=${bounds._southWest.lat}&maxLat=${bounds._northEast.lat}&minLng=${bounds._southWest.lng}&maxLng=${bounds._northEast.lng}&type=${type}`,
        {
          headers: { Authorization: jwt ? `Bearer ${jwt}` : undefined },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch crimes");
      const data = await res.json();
      setCrimes(
        data.crimes.map((c) => ({
          ...c,
          lat: c.location?.coordinates?.[1],
          lng: c.location?.coordinates?.[0],
        }))
      );
    } catch (err) {
      console.error("Error fetching crimes:", err);
      setCrimes([]);
    } finally {
      setLoading(false);
    }
  };

  // Update crimes when map bounds change
  const handleBoundsChange = () => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    const newBounds = map.getBounds();
    setBounds(newBounds);
    fetchCrimesInBounds(newBounds);
  };

  // Handle filter change
  const handleFilterChange = (e) => {
    const newFilter = e.target.value;
    setFilter(newFilter);
    if (bounds) {
      fetchCrimesInBounds(bounds, newFilter);
    }
  };

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
    // Show glassy toast for source selection
    if (sourceToastId.current) toast.dismiss(sourceToastId.current);
    if (destToastId.current) toast.dismiss(destToastId.current);
    sourceToastId.current = toast.custom(
      (t) => (
        <div
          className="backdrop-blur-xl bg-white/40 border border-glassyblue-200/40 shadow-2xl rounded-2xl px-6 py-4 flex items-center gap-3 text-glassyblue-800 font-semibold text-base animate-fade-in"
          style={{
            boxShadow: "0 8px 32px 0 rgba(31,38,135,0.18)",
            minWidth: 320,
          }}
        >
          <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-2"></span>
          Click on the map to select{" "}
          <span className="font-bold ml-1">source</span> (green marker).
        </div>
      ),
      { id: "source-toast", duration: Infinity, position: "top-center" }
    );
  };

  const resetRouteSelection = () => {
    setSelectingRoute(false);
    setRoutePoints([]);
    setRoute([]);
    setRouteModalOpen(false);
    setRouteError("");
    setShowRouteInstruction(false);
  };

  const handleSearch = (place) => {
    setMapCenter([place.lat, place.lng]);
    if (mapRef.current) {
      mapRef.current.setView([place.lat, place.lng], 15);
    }
  };

  // Handle map click for route selection
  const handleMapClick = async (latlng) => {
    if (!isInBangladeshPolygon(latlng.lat, latlng.lng)) {
      toast.error("Please select a location within Bangladesh.");
      return;
    }

    if (selectingRoute) {
      if (routePoints.length === 0) {
        // First click - set source point
        setRoutePoints([latlng]);
        // Dismiss source toast, show destination toast
        if (sourceToastId.current) toast.dismiss(sourceToastId.current);
        destToastId.current = toast.custom(
          (t) => (
            <div
              className="backdrop-blur-xl bg-white/40 border border-glassyblue-200/40 shadow-2xl rounded-2xl px-6 py-4 flex items-center gap-3 text-glassyblue-800 font-semibold text-base animate-fade-in"
              style={{
                boxShadow: "0 8px 32px 0 rgba(31,38,135,0.18)",
                minWidth: 320,
              }}
            >
              <span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-2"></span>
              Click on the map to select{" "}
              <span className="font-bold ml-1">destination</span> (red marker).
            </div>
          ),
          { id: "dest-toast", duration: Infinity, position: "top-center" }
        );
      } else if (routePoints.length === 1) {
        // Second click - set destination point and calculate route
        setRoutePoints([routePoints[0], latlng]);
        if (destToastId.current) toast.dismiss(destToastId.current);
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
          console.error("Route calculation error:", err);
          setRouteError("Failed to calculate route");
        } finally {
          setRouteLoading(false);
        }
      }
    }
  };

  return (
    <Box w="full" minH="100vh" bg="gray.100" mt={8}>
      <Box maxW="7xl" mx="auto" pt={{ base: 24, md: 28 }} pb={6} px={2}>
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <Card p={6} mb={6}>
            <Flex
              direction={{ base: "column", md: "row" }}
              align="center"
              justify="space-between"
              gap={6}
            >
              <Flex align="center" gap={4} flex={1}>
                <Text fontSize="2xl" fontWeight="bold" color="brand.700">
                  Bangladesh Crime Map
                </Text>
                <Flex align="center" gap={2}>
                  <Text color="brand.400" fontWeight={600}>
                    Crime Type:
                  </Text>
                  <Select
                    value={filter}
                    onChange={handleFilterChange}
                    w="150px"
                    borderRadius="md"
                    bg="whiteAlpha.800"
                    fontWeight={500}
                    fontSize="md"
                    borderColor="secondaryGray.400"
                    _focus={{ borderColor: "brand.400" }}
                  >
                    <option value="all">All</option>
                    <option value="murder">Murder</option>
                    <option value="rape">Rape</option>
                    <option value="kidnap">Kidnap</option>
                    <option value="assault">Assault</option>
                    <option value="robbery">Robbery</option>
                    <option value="harassment">Harassment</option>
                    <option value="theft">Theft</option>
                    <option value="others">Others</option>
                  </Select>
                </Flex>
              </Flex>
              <motion.div
                whileHover={{ scale: 1.06, boxShadow: "0 0 0 4px #7551FF33" }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Button
                  bgGradient="linear(to-r, #7551FF, #422AFB)"
                  color="white"
                  borderRadius="xl"
                  px={8}
                  fontWeight={700}
                  size="lg"
                  onClick={startRouteSelection}
                  shadow="md"
                  _hover={{
                    bgGradient: "linear(to-r, #422AFB, #7551FF)",
                    boxShadow: "xl",
                  }}
                  _active={{ bgGradient: "linear(to-r, #7551FF, #422AFB)" }}
                >
                  Safest Route
                </Button>
              </motion.div>
              <Box flex={1} display="flex" justifyContent="flex-end">
                <MapSearchBar
                  placeholder="Search for a place..."
                  onSelect={handleSearch}
                />
              </Box>
            </Flex>
          </Card>
        </motion.div>
      </Box>
      {/* Loading overlay for route calculation */}
      {routeLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/60 backdrop-blur-xl"
          style={{ pointerEvents: "all" }}
        >
          <motion.div
            className="rounded-2xl bg-white/40 shadow-xl p-8 flex flex-col items-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <motion.div
              className="w-16 h-16 mb-4 flex items-center justify-center"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
            >
              <svg className="w-16 h-16" viewBox="0 0 50 50">
                <circle
                  className="text-glassyblue-400 opacity-30"
                  cx="25"
                  cy="25"
                  r="20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="6"
                />
                <motion.circle
                  className="text-glassyblue-600"
                  cx="25"
                  cy="25"
                  r="20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="6"
                  strokeDasharray="100"
                  strokeDashoffset="60"
                  strokeLinecap="round"
                  animate={{
                    strokeDashoffset: [60, 0, 60],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.2,
                    ease: "easeInOut",
                  }}
                />
              </svg>
            </motion.div>
            <div className="text-xl font-semibold text-glassyblue-700 mb-2">
              Calculating safest route...
            </div>
            <div className="text-glassyblue-500 text-sm">
              Please wait while we analyze all possible paths for you.
            </div>
          </motion.div>
        </motion.div>
      )}
      <Box maxW="7xl" mx="auto" px={2} pb={8}>
        <Flex direction="row" gap={8} align="flex-start">
          {/* Map Section */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7 }}
            style={{ flex: 1, width: "100%" }}
          >
            {/* Mobile Legend Toggle Button */}
            <Flex
              display={{ base: "flex", md: "none" }}
              justify="flex-end"
              mb={4}
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
                onClick={() => setIsMobileLegendOpen(!isMobileLegendOpen)}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-purple-700 text-white font-semibold shadow-lg border border-purple-400/30 flex items-center gap-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
                Marker
              </motion.button>
            </Flex>
            <Box
              position="relative"
              borderRadius="2xl"
              overflow="hidden"
              boxShadow="xl"
              bg="white"
              minH="600px"
            >
              {/* Crimes loading spinner */}
              {loading && (
                <Flex
                  position="absolute"
                  top={0}
                  left={0}
                  w="full"
                  h="full"
                  align="center"
                  justify="center"
                  zIndex={10}
                  bg="whiteAlpha.700"
                >
                  <Spinner
                    size="xl"
                    color="brand.500"
                    thickness="4px"
                    speed="0.65s"
                  />
                </Flex>
              )}
              <MapContainer
                center={mapCenter}
                zoom={7}
                style={{ height: "600px", width: "100%" }}
                ref={mapRef}
                className="z-0"
                whenReady={(map) => {
                  setBounds(map.target.getBounds());
                  fetchCrimesInBounds(map.target.getBounds());
                }}
                onMoveEnd={handleBoundsChange}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {/* ...markers, polylines, etc... */}
                <AnimatePresence>
                  {crimes.map((crime) => (
                    <motion.div
                      key={crime.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.4 }}
                    >
                      <Marker
                        position={[crime.lat, crime.lng]}
                        icon={getCrimeIcon(crime.type)}
                      >
                        <Popup>
                          <Box>
                            <Text fontWeight="bold">
                              {crime.type.charAt(0).toUpperCase() +
                                crime.type.slice(1)}
                            </Text>
                            <Text>{crime.description}</Text>
                            <Text fontSize="xs" color="gray.500">
                              {new Date(crime.time).toLocaleString()}
                            </Text>
                          </Box>
                        </Popup>
                      </Marker>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {/* ...rest of the map overlays... */}
                {route.length > 1 && (
                  <Polyline
                    positions={route.map((p) => [p.lat, p.lng])}
                    color={networkType === "walk" ? "purple" : "green"}
                  />
                )}
                {/* Show source/destination markers while selecting or after route is shown */}
                {(routePoints[0] || (route.length > 1 && routePoints[0])) && (
                  <Marker
                    position={[
                      routePoints[0]?.lat ?? route[0]?.lat,
                      routePoints[0]?.lng ?? route[0]?.lng,
                    ]}
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
                {(routePoints[1] ||
                  (route.length > 1 && routePoints[route.length - 1])) && (
                  <Marker
                    position={[
                      routePoints[1]?.lat ?? route[route.length - 1]?.lat,
                      routePoints[1]?.lng ?? route[route.length - 1]?.lng,
                    ]}
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
            </Box>
          </motion.div>
          {/* Legend Sidebar */}
          {/* Desktop Legend */}
          <Box display={{ base: "none", md: "block" }}>
            <motion.div
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              style={{ minWidth: "180px", maxWidth: "260px" }}
            >
              <Card
                minW={{ base: "180px", md: "240px" }}
                maxW="260px"
                p={6}
                position="sticky"
                top="120px"
                alignSelf="flex-start"
                boxShadow="2xl"
                borderRadius="2xl"
                bg="white"
                zIndex={40}
              >
                <Text fontWeight={700} fontSize="lg" mb={2} color="brand.700">
                  Marker
                </Text>
                <Divider mb={3} />
                <Flex direction="column" gap={3}>
                  <Flex align="center" gap={2}>
                    <img
                      src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png"
                      alt="Source"
                      width={18}
                      height={30}
                    />
                    <Text>Source</Text>
                  </Flex>
                  <Flex align="center" gap={2}>
                    <img
                      src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png"
                      alt="Destination"
                      width={18}
                      height={30}
                    />
                    <Text>Destination</Text>
                  </Flex>
                  <Divider />
                  {/* Crime type icons */}
                  {Object.entries(crimeTypeColors).map(([type, color]) => (
                    <Flex align="center" gap={2} key={type}>
                      <Box
                        as="span"
                        display="inline-block"
                        w="18px"
                        h="18px"
                        borderRadius="full"
                        bg={color}
                        border="2px solid #fff"
                        boxShadow="md"
                      />
                      <Text textTransform="capitalize">{type}</Text>
                    </Flex>
                  ))}
                  <Divider />
                  <Text
                    fontWeight={700}
                    fontSize="md"
                    mt={2}
                    mb={1}
                    color="brand.700"
                  >
                    Route Type
                  </Text>
                  <Flex align="center" gap={2}>
                    <Box w="28px" h="4px" borderRadius="md" bg="#22c55e" />
                    <Text>Drive</Text>
                  </Flex>
                  <Flex align="center" gap={2}>
                    <Box w="28px" h="4px" borderRadius="md" bg="purple.500" />
                    <Text>Walk</Text>
                  </Flex>
                </Flex>
              </Card>
            </motion.div>
          </Box>
        </Flex>

        {/* Mobile Legend Sidebar */}
        {isMobileLegendOpen && (
          <div className="fixed inset-0 z-[9999] md:hidden">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/20 backdrop-blur-sm"
              onClick={() => setIsMobileLegendOpen(false)}
            />

            {/* Sidebar */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute right-0 top-0 h-full w-80 bg-white/95 backdrop-blur-xl border-l border-white/20 shadow-2xl"
            >
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-white/20">
                  <span className="text-xl font-bold text-black">Marker</span>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => setIsMobileLegendOpen(false)}
                    className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-purple-700 border border-purple-400/30 shadow-lg"
                  >
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </motion.button>
                </div>

                {/* Legend Content */}
                <div className="flex-1 p-6 space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-black mb-3">Point</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <img
                          src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png"
                          alt="Source"
                          width={18}
                          height={30}
                        />
                        <span className="text-black">Source</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <img
                          src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png"
                          alt="Destination"
                          width={18}
                          height={30}
                        />
                        <span className="text-black">Destination</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <h3 className="text-lg font-bold text-black mb-3">
                      Crime Types
                    </h3>
                    <div className="space-y-3">
                      {Object.entries(crimeTypeColors).map(([type, color]) => (
                        <div key={type} className="flex items-center gap-3">
                          <div
                            className="w-4 h-4 rounded-full border-2 border-white shadow-md"
                            style={{ backgroundColor: color }}
                          />
                          <span className="text-black capitalize">{type}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <h3 className="text-lg font-bold text-black mb-3">
                      Route Type
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-1 rounded bg-green-500" />
                        <span className="text-black">Drive</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-1 rounded bg-purple-500" />
                        <span className="text-black">Walk</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </Box>
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
                  <span className="font-semibold">source</span> (green marker).
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
      {/* (Removed, replaced by hot toasts) */}
      <FixedPlugin />
    </Box>
  );
};

export default MapPage;
