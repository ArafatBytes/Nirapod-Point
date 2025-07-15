import React from "react";
import { motion } from "framer-motion";
import { AnimatedBackground } from "../App";
import { useUser } from "../context/UserContext";

function CrimeReportForm() {
  const [type, setType] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [time, setTime] = React.useState("");
  const [lat, setLat] = React.useState("");
  const [lng, setLng] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState("");
  const [error, setError] = React.useState("");
  const { jwt } = useUser();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");
    setError("");
    if (!type || !description || !time || !lat || !lng) {
      setError("All fields are required.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/crimes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify({
          type,
          description,
          time,
          location: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
        }),
      });
      if (!res.ok) throw new Error("Failed to submit report");
      setSuccess("Crime report submitted successfully!");
      setType("");
      setDescription("");
      setTime("");
      setLat("");
      setLng("");
    } catch (err) {
      setError(err.message || "Submission failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-glassyblue-100 via-white to-glassyblue-200 flex flex-col items-center justify-center pt-24 pb-12 px-2 overflow-x-hidden">
      <AnimatedBackground />
      <motion.form
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        onSubmit={handleSubmit}
        className="backdrop-blur-xl bg-white/30 border border-glassyblue-200/40 shadow-2xl rounded-3xl p-8 max-w-lg w-full mx-4 flex flex-col gap-4 mt-8"
        style={{ boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.18)" }}
      >
        <h2 className="text-2xl md:text-3xl font-bold text-glassyblue-700 mb-2 text-center">
          Report a Crime
        </h2>
        <div className="flex flex-col gap-2">
          <label className="font-medium text-glassyblue-700">
            Type<span className="text-red-500">*</span>
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="rounded-lg border border-glassyblue-200 p-2 bg-white/60 focus:outline-none focus:ring-2 focus:ring-glassyblue-400"
          >
            <option value="">Select type</option>
            <option value="Robbery">Robbery</option>
            <option value="Assault">Assault</option>
            <option value="Harassment">Harassment</option>
            <option value="Theft">Theft</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-medium text-glassyblue-700">
            Description<span className="text-red-500">*</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="rounded-lg border border-glassyblue-200 p-2 bg-white/60 focus:outline-none focus:ring-2 focus:ring-glassyblue-400"
            placeholder="Describe the incident..."
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-medium text-glassyblue-700">
            Date & Time<span className="text-red-500">*</span>
          </label>
          <input
            type="datetime-local"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="rounded-lg border border-glassyblue-200 p-2 bg-white/60 focus:outline-none focus:ring-2 focus:ring-glassyblue-400"
          />
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
          <div className="flex-1 flex flex-col gap-2">
            <label className="font-medium text-glassyblue-700">
              Latitude<span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              className="rounded-lg border border-glassyblue-200 p-2 bg-white/60 focus:outline-none focus:ring-2 focus:ring-glassyblue-400"
              placeholder="23.8103"
              step="any"
            />
          </div>
          <div className="flex-1 flex flex-col gap-2">
            <label className="font-medium text-glassyblue-700">
              Longitude<span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={lng}
              onChange={(e) => setLng(e.target.value)}
              className="rounded-lg border border-glassyblue-200 p-2 bg-white/60 focus:outline-none focus:ring-2 focus:ring-glassyblue-400"
              placeholder="90.4125"
              step="any"
            />
          </div>
        </div>
        {error && (
          <div className="text-red-500 text-center font-medium">{error}</div>
        )}
        {success && (
          <div className="text-green-600 text-center font-medium">
            {success}
          </div>
        )}
        <motion.button
          type="submit"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          disabled={loading}
          className="mt-2 px-8 py-3 rounded-full bg-glassyblue-500 text-black font-semibold shadow-lg hover:bg-glassyblue-600 transition-colors duration-200 backdrop-blur-md border border-white/20 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Submitting..." : "Submit Report"}
        </motion.button>
      </motion.form>
    </div>
  );
}

export default CrimeReportForm;
