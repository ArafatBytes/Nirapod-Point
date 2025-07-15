import React, { useState, useEffect } from "react";
import { useUser } from "../context/UserContext";
import { motion } from "framer-motion";

export default function AccountPage() {
  const { user, refreshUser } = useUser();
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("jwt")}`,
        },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(await res.text());
      setSuccess("Account updated successfully!");
      refreshUser && refreshUser();
    } catch (err) {
      setError(err.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div className="pt-24 text-center">Loading...</div>;

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-glassyblue-100 via-white to-glassyblue-200 flex flex-col items-center justify-center pt-24 pb-12 px-2 overflow-x-hidden">
      <motion.form
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        onSubmit={handleSubmit}
        className="backdrop-blur-xl bg-white/30 border border-glassyblue-200/40 shadow-2xl rounded-3xl p-8 max-w-lg w-full mx-4 flex flex-col gap-4 mt-8"
        style={{ boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.18)" }}
      >
        <h2 className="text-2xl md:text-3xl font-bold text-glassyblue-700 mb-2 text-center">
          My Account
        </h2>
        <div className="flex flex-col gap-2">
          <label className="font-medium text-glassyblue-700">Name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="rounded-lg border border-glassyblue-200 p-2 bg-white/60 focus:outline-none focus:ring-2 focus:ring-glassyblue-400"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-medium text-glassyblue-700">Email</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            className="rounded-lg border border-glassyblue-200 p-2 bg-white/60 focus:outline-none focus:ring-2 focus:ring-glassyblue-400"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-medium text-glassyblue-700">Phone</label>
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className="rounded-lg border border-glassyblue-200 p-2 bg-white/60 focus:outline-none focus:ring-2 focus:ring-glassyblue-400"
          />
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
          {loading ? "Updating..." : "Update Account"}
        </motion.button>
      </motion.form>
    </div>
  );
}
