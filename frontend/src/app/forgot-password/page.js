"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Lock, Mail, Loader2, KeyRound } from "lucide-react";
import axiosInstance from "@/lib/axiosInstance";
import { toast, Toaster } from "react-hot-toast";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    newPassword: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!formData.email) {
      return toast.error("Email is required");
    }
    setLoading(true);

    try {
      const response = await axiosInstance.post("/auth/forgot-password", { email: formData.email });
      if (response.data.success) {
        toast.success(response.data.message || "OTP sent to your email!");
        setStep(2);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!formData.otp || !formData.newPassword) {
      return toast.error("OTP and New Password are required");
    }
    setLoading(true);

    try {
      const response = await axiosInstance.post("/auth/reset-password", {
        email: formData.email,
        otp: formData.otp,
        newPassword: formData.newPassword,
      });
      if (response.data.success) {
        toast.success(response.data.message || "Password reset successfully!");
        router.push("/login");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-white relative overflow-hidden">
      <Toaster position="top-right" />
      <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-blue-900/20 to-transparent pointer-events-none"></div>

      <div className="w-full max-w-md p-8 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center mb-10">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent inline-block mb-6">
            PersonalManager
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">
            {step === 1 ? "Forgot Password" : "Reset Password"}
          </h1>
          <p className="text-neutral-400 mt-2">
            {step === 1
              ? "Enter your email to receive a secure one-time password."
              : "Enter the OTP sent to your email and your new password."}
          </p>
        </div>

        <div className="bg-neutral-900/50 border border-neutral-800 rounded-3xl p-8 backdrop-blur-xl">
          {step === 1 ? (
            <form onSubmit={handleSendOtp} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-300">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="you@example.com"
                    className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-neutral-200 transition-colors flex items-center justify-center group disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Send OTP
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-300">Enter OTP</label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                  <input
                    type="text"
                    name="otp"
                    value={formData.otp}
                    onChange={handleChange}
                    required
                    placeholder="123456"
                    className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-300">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                  <input
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    required
                    placeholder="••••••••"
                    className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-neutral-200 transition-colors flex items-center justify-center group disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Reset Password
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          )}

          <div className="mt-6 text-center text-sm text-neutral-400">
            Remember your password?{" "}
            <Link href="/login" className="text-white font-medium hover:underline">
              Log in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
