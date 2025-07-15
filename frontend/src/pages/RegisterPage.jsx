import React, { useState } from "react";
import { motion } from "framer-motion";
import { useUser } from "../context/UserContext";
import { useNavigate } from "react-router-dom";

const bdPhoneRegex = /^(?:\+?88)?01[3-9]\d{8}$/;

function RegisterPage() {
  const { register, login } = useUser();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    nidFront: null,
    nidBack: null,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  function validate() {
    const errs = {};
    if (!form.name) errs.name = "Name is required";
    if (!form.email) errs.email = "Email is required";
    if (!form.phone) errs.phone = "Phone is required";
    else if (!bdPhoneRegex.test(form.phone))
      errs.phone = "Invalid BD phone number";
    if (!form.password || form.password.length < 6)
      errs.password = "Password must be at least 6 characters";
    if (!form.nidFront) errs.nidFront = "NID front image required";
    if (!form.nidBack) errs.nidBack = "NID back image required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    const formData = new FormData();
    Object.entries(form).forEach(([k, v]) => formData.append(k, v));
    const ok = await register(formData);
    if (ok) {
      await login({
        emailOrPhone: form.email || form.phone,
        password: form.password,
      });
      navigate("/");
    }
    setLoading(false);
  }

  function handleChange(e) {
    const { name, value, files } = e.target;
    setForm((f) => ({ ...f, [name]: files ? files[0] : value }));
  }

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
          Create an Account
        </h2>
        <div className="flex flex-col gap-2">
          <label className="font-medium text-glassyblue-700">
            Name<span className="text-red-500">*</span>
          </label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="rounded-lg border border-glassyblue-200 p-2 bg-white/60 focus:outline-none focus:ring-2 focus:ring-glassyblue-400"
          />
          {errors.name && (
            <span className="text-red-500 text-sm">{errors.name}</span>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-medium text-glassyblue-700">
            Email<span className="text-red-500">*</span>
          </label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            className="rounded-lg border border-glassyblue-200 p-2 bg-white/60 focus:outline-none focus:ring-2 focus:ring-glassyblue-400"
          />
          {errors.email && (
            <span className="text-red-500 text-sm">{errors.email}</span>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-medium text-glassyblue-700">
            Phone (BD)<span className="text-red-500">*</span>
          </label>
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className="rounded-lg border border-glassyblue-200 p-2 bg-white/60 focus:outline-none focus:ring-2 focus:ring-glassyblue-400"
            placeholder="01XXXXXXXXX"
          />
          {errors.phone && (
            <span className="text-red-500 text-sm">{errors.phone}</span>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-medium text-glassyblue-700">
            Password<span className="text-red-500">*</span>
          </label>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            className="rounded-lg border border-glassyblue-200 p-2 bg-white/60 focus:outline-none focus:ring-2 focus:ring-glassyblue-400"
          />
          {errors.password && (
            <span className="text-red-500 text-sm">{errors.password}</span>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-medium text-glassyblue-700">
            NID Front Image<span className="text-red-500">*</span>
          </label>
          <input
            name="nidFront"
            type="file"
            accept="image/*"
            onChange={handleChange}
            className="rounded-lg border border-glassyblue-200 p-2 bg-white/60 focus:outline-none focus:ring-2 focus:ring-glassyblue-400"
          />
          {errors.nidFront && (
            <span className="text-red-500 text-sm">{errors.nidFront}</span>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-medium text-glassyblue-700">
            NID Back Image<span className="text-red-500">*</span>
          </label>
          <input
            name="nidBack"
            type="file"
            accept="image/*"
            onChange={handleChange}
            className="rounded-lg border border-glassyblue-200 p-2 bg-white/60 focus:outline-none focus:ring-2 focus:ring-glassyblue-400"
          />
          {errors.nidBack && (
            <span className="text-red-500 text-sm">{errors.nidBack}</span>
          )}
        </div>
        <motion.button
          type="submit"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          disabled={loading}
          className="mt-2 px-8 py-3 rounded-full bg-glassyblue-500 text-black font-semibold shadow-lg hover:bg-glassyblue-600 transition-colors duration-200 backdrop-blur-md border border-white/20 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Registering..." : "Register"}
        </motion.button>
        <div className="text-center mt-2 text-glassyblue-600">
          Already have an account?{" "}
          <a href="/login" className="underline hover:text-glassyblue-700">
            Login
          </a>
        </div>
      </motion.form>
    </div>
  );
}

export default RegisterPage;
