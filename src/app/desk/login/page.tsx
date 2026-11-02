"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthLeftBanner } from "@/components/auth/AuthLeftBanner";
import { useAuth } from "@/lib/auth/auth-context";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  AlertCircle,
  Building2,
  Sparkles,
  KeyRound,
} from "lucide-react";

export default function DeskLoginPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F8F8F3]">
          <div className="text-sm font-bold text-[#173F35]">Loading Order Desk Operations...</div>
        </div>
      }
    >
      <DeskLoginForm />
    </React.Suspense>
  );
}

function DeskLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/desk/dashboard";
  const { refreshSession } = useAuth();

  const [email, setEmail] = useState("desk@ordersaathi.demo");
  const [password, setPassword] = useState("OrderSaathi@Desk2026");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !password) {
      setErrorMessage("Please enter both email address and password.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/desk/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (data.success) {
        await refreshSession();
        router.push(redirectTo);
        router.refresh();
      } else {
        setErrorMessage(data.error || "Authentication failed.");
      }
    } catch {
      setErrorMessage("Network error connecting to Order Desk authorization.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail("desk@ordersaathi.demo");
    setPassword("OrderSaathi@Desk2026");
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setResetSent(true);
    setTimeout(() => {
      setForgotModalOpen(false);
      setResetSent(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen flex w-full bg-[#F8F8F3]">
      {/* Left Branded Section */}
      <AuthLeftBanner />

      {/* Right Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Top Brand Header */}
          <div className="lg:hidden flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#173F35] flex items-center justify-center text-white font-bold text-xl shadow-md">
              <span className="text-[#E9A83B]">O</span>S
            </div>
            <div>
              <span className="text-xl font-extrabold text-[#173F35]">
                Order<span className="text-[#E9A83B]">Saathi</span>
              </span>
              <p className="text-[10px] text-[#7B857E] font-semibold uppercase">
                Smarter Orders. Faster Distribution.
              </p>
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#173F35] text-white text-xs font-bold">
              <Building2 className="w-3.5 h-3.5 text-[#E9A83B]" />
              <span>Operations Control Room</span>
            </div>
            <h2 className="text-3xl font-extrabold text-[#173F35] tracking-tight">
              Order Desk Employee Sign In
            </h2>
            <p className="text-sm text-[#7B857E]">
              Restricted portal for Jabalpur FMCG distribution agents, credit review officers, and dispatch clerks.
            </p>
          </div>

          {/* Demo Reviewer Box */}
          <div className="p-3.5 rounded-xl bg-[#E5EEE8]/60 border border-[#cbded2] text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#173F35] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#E9A83B]" />
                Demo Order Desk Review Account
              </span>
              <button
                type="button"
                onClick={handleFillDemo}
                className="text-[11px] font-bold text-[#173F35] hover:text-[#E9A83B] underline"
              >
                Auto Fill
              </button>
            </div>
            <p className="text-[#576059]">
              Email: <strong>desk@ordersaathi.demo</strong> • Password: <strong>OrderSaathi@Desk2026</strong>
            </p>
          </div>

          {/* Error Alert */}
          {errorMessage && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-800 flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#173F35] uppercase tracking-wider">
                Distributor Staff Email Address
              </label>
              <div className="relative flex items-center rounded-xl border border-[#cbded2] bg-white overflow-hidden focus-within:border-[#173F35]">
                <Mail className="w-4 h-4 text-[#7B857E] absolute left-3.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="agent@ordersaathi.demo"
                  className="w-full pl-10 pr-4 py-3 text-sm font-semibold text-[#202923] outline-none"
                  autoFocus
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <label className="font-bold text-[#173F35] uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setForgotModalOpen(true)}
                  className="text-[#7B857E] hover:text-[#173F35] font-semibold"
                >
                  Forgot password?
                </button>
              </div>

              <div className="relative flex items-center rounded-xl border border-[#cbded2] bg-white overflow-hidden focus-within:border-[#173F35]">
                <Lock className="w-4 h-4 text-[#7B857E] absolute left-3.5" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-11 py-3 text-sm font-semibold text-[#202923] outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 text-[#7B857E] hover:text-[#202923] transition-colors"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-5 rounded-xl bg-[#173F35] hover:bg-[#244d3e] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-[#E9A83B]" />
                  <span>Authenticating Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Order Desk</span>
                  <ArrowRight className="w-4 h-4 text-[#E9A83B]" />
                </>
              )}
            </button>
          </form>

          {/* Switch to Retailer Portal */}
          <div className="pt-6 border-t border-[#E5EEE8] text-center text-xs text-[#576059] space-y-2">
            <p>Kirana shop owner placing wholesale orders?</p>
            <Link
              href="/retailer/login"
              className="inline-flex items-center gap-1.5 font-bold text-[#173F35] hover:text-[#E9A83B] transition-colors"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Go to Retailer Mobile OTP Login →</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-[#cbded2] shadow-float p-6 max-w-sm w-full space-y-4">
            <div className="flex items-center gap-2 text-[#173F35]">
              <KeyRound className="w-5 h-5 text-[#E9A83B]" />
              <h3 className="font-bold text-base">Reset Order Desk Password</h3>
            </div>
            <p className="text-xs text-[#7B857E]">
              Enter your registered distributor email. A secure password reset link will be dispatched via Supabase Auth.
            </p>

            {resetSent ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-900">
                ✓ Password reset instructions dispatched to your email.
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <input
                  type="email"
                  defaultValue={email}
                  placeholder="agent@ordersaathi.demo"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#cbded2] text-xs font-semibold"
                  required
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setForgotModalOpen(false)}
                    className="px-3 py-1.5 rounded-lg border text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-[#173F35] text-white text-xs font-bold"
                  >
                    Send Reset Link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
