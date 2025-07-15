import React, { useState } from "react";
import { motion } from "framer-motion";
import { useUser } from "../context/UserContext";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const { login } = useUser();
  const navigate = useNavigate();
  const [form, setForm] = useState({ emailOrPhone: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  function validate() {
    const errs = {};
    if (!form.emailOrPhone) errs.emailOrPhone = "Email or phone is required";
    if (!form.password) errs.password = "Password is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    const ok = await login(form);
    setLoading(false);
    if (ok) navigate("/");
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
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
          Login
        </h2>
        <div className="flex flex-col gap-2">
          <label className="font-medium text-glassyblue-700">
            Email or Phone<span className="text-red-500">*</span>
          </label>
          <input
            name="emailOrPhone"
            value={form.emailOrPhone}
            onChange={handleChange}
            className="rounded-lg border border-glassyblue-200 p-2 bg-white/60 focus:outline-none focus:ring-2 focus:ring-glassyblue-400"
          />
          {errors.emailOrPhone && (
            <span className="text-red-500 text-sm">{errors.emailOrPhone}</span>
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
        <motion.button
          type="submit"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          disabled={loading}
          className="mt-2 px-8 py-3 rounded-full bg-glassyblue-500 text-black font-semibold shadow-lg hover:bg-glassyblue-600 transition-colors duration-200 backdrop-blur-md border border-white/20 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Logging in..." : "Login"}
        </motion.button>
        <div className="text-center mt-2 text-glassyblue-600">
          Don't have an account?{" "}
          <a href="/register" className="underline hover:text-glassyblue-700">
            Register
          </a>
        </div>
      </motion.form>
    </div>
  );
}
