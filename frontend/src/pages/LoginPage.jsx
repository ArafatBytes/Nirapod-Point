import React, { useState } from "react";
import { motion } from "framer-motion";
import { useUser } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function LoginPage() {
  const { login } = useUser();
  const navigate = useNavigate();
  const [form, setForm] = useState({ emailOrPhone: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetStep, setResetStep] = useState(1);
  const [resetEmail, setResetEmail] = useState("");
  const [resetOtp, setResetOtp] = useState("");
  const [resetNew, setResetNew] = useState("");
  const [resetConfirm, setResetConfirm] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState("");
  const [resetSuccess, setResetSuccess] = useState("");

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
          <button
            type="button"
            className="text-xs text-glassyblue-600 underline hover:text-glassyblue-700 mt-1 text-left"
            onClick={() => setShowReset(true)}
          >
            Forgot password?
          </button>
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
      {showReset && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setShowReset(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl p-8 w-full max-w-md flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-glassyblue-700 mb-2 text-center">
              Reset Password
            </h3>
            {resetStep === 1 && (
              <>
                <label className="font-medium text-glassyblue-700">Email</label>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="rounded-lg border border-glassyblue-200 p-2 bg-white/60 focus:outline-none focus:ring-2 focus:ring-glassyblue-400"
                  placeholder="Enter your email"
                />
                <button
                  className="mt-2 px-6 py-2 rounded-full bg-glassyblue-500 text-black font-semibold shadow hover:bg-glassyblue-600 transition-colors duration-200"
                  disabled={resetLoading || !resetEmail}
                  onClick={async () => {
                    setResetLoading(true);
                    setResetError("");
                    setResetSuccess("");
                    try {
                      const res = await fetch("/api/auth/request-reset", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ email: resetEmail }),
                      });
                      if (!res.ok) throw new Error(await res.text());
                      setResetStep(2);
                      setResetSuccess(
                        "OTP sent to your email (valid for 5 minutes)"
                      );
                      toast.success(
                        "OTP sent to your email (valid for 5 minutes)"
                      );
                    } catch (err) {
                      setResetError(err.message || "Failed to send OTP");
                      toast.error(err.message || "Failed to send OTP");
                    } finally {
                      setResetLoading(false);
                    }
                  }}
                >
                  {resetLoading ? "Sending..." : "Send OTP"}
                </button>
              </>
            )}
            {resetStep === 2 && (
              <>
                <label className="font-medium text-glassyblue-700">OTP</label>
                <input
                  type="text"
                  value={resetOtp}
                  onChange={(e) => setResetOtp(e.target.value)}
                  className="rounded-lg border border-glassyblue-200 p-2 bg-white/60 focus:outline-none focus:ring-2 focus:ring-glassyblue-400"
                  placeholder="Enter OTP"
                />
                <button
                  className="mt-2 px-6 py-2 rounded-full bg-glassyblue-500 text-black font-semibold shadow hover:bg-glassyblue-600 transition-colors duration-200"
                  disabled={resetLoading || !resetOtp}
                  onClick={async () => {
                    setResetLoading(true);
                    setResetError("");
                    setResetSuccess("");
                    try {
                      setResetStep(3);
                      setResetSuccess(
                        "OTP verified! Please set your new password."
                      );
                      toast.success(
                        "OTP verified! Please set your new password."
                      );
                    } catch (err) {
                      setResetError(err.message || "Invalid or expired OTP");
                      toast.error(err.message || "Invalid or expired OTP");
                    } finally {
                      setResetLoading(false);
                    }
                  }}
                >
                  {resetLoading ? "Verifying..." : "Verify OTP"}
                </button>
              </>
            )}
            {resetStep === 3 && (
              <>
                <label className="font-medium text-glassyblue-700 mt-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={resetNew}
                  onChange={(e) => setResetNew(e.target.value)}
                  className="rounded-lg border border-glassyblue-200 p-2 bg-white/60 focus:outline-none focus:ring-2 focus:ring-glassyblue-400"
                  placeholder="New password"
                />
                <label className="font-medium text-glassyblue-700 mt-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={resetConfirm}
                  onChange={(e) => setResetConfirm(e.target.value)}
                  className="rounded-lg border border-glassyblue-200 p-2 bg-white/60 focus:outline-none focus:ring-2 focus:ring-glassyblue-400"
                  placeholder="Confirm new password"
                />
                <button
                  className="mt-2 px-6 py-2 rounded-full bg-glassyblue-500 text-black font-semibold shadow hover:bg-glassyblue-600 transition-colors duration-200"
                  disabled={
                    resetLoading || !resetNew || resetNew !== resetConfirm
                  }
                  onClick={async () => {
                    setResetLoading(true);
                    setResetError("");
                    setResetSuccess("");
                    try {
                      const res = await fetch("/api/auth/reset-password", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          email: resetEmail,
                          otp: resetOtp,
                          newPassword: resetNew,
                        }),
                      });
                      if (!res.ok) throw new Error(await res.text());
                      setResetSuccess(
                        "Password reset successful! You can now log in."
                      );
                      toast.success(
                        "Password reset successful! You can now log in."
                      );
                      setTimeout(() => {
                        setShowReset(false);
                      }, 2000);
                    } catch (err) {
                      setResetError(err.message || "Failed to reset password");
                      if (
                        (err.message || "").includes("same as the old password")
                      ) {
                        toast.error(
                          "New password cannot be the same as the old password."
                        );
                      } else {
                        toast.error(err.message || "Failed to reset password");
                      }
                    } finally {
                      setResetLoading(false);
                    }
                  }}
                >
                  {resetLoading ? "Resetting..." : "Reset Password"}
                </button>
              </>
            )}
            {resetError && (
              <div className="text-red-500 text-center font-medium">
                {resetError}
              </div>
            )}
            {resetSuccess && (
              <div className="text-green-600 text-center font-medium">
                {resetSuccess}
              </div>
            )}
            <button
              className="absolute top-2 right-4 text-xl text-glassyblue-500 hover:text-glassyblue-700"
              onClick={() => setShowReset(false)}
            >
              &times;
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
