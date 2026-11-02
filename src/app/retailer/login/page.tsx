"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthLeftBanner } from "@/components/auth/AuthLeftBanner";
import { useAuth } from "@/lib/auth/auth-context";
import {
  Phone,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Lock,
  Store,
  ChevronLeft,
  Sparkles,
} from "lucide-react";

export default function RetailerLoginPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F8F8F3]">
          <div className="text-sm font-bold text-[#173F35]">Loading Retailer Authentication...</div>
        </div>
      }
    >
      <RetailerLoginForm />
    </React.Suspense>
  );
}

function RetailerLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/retailer/dashboard";
  const { refreshSession } = useAuth();

  // State
  const [phone, setPhone] = useState("+91 98261 12345");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(0);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer countdown effect
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Handle Send OTP
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);
    setSuccessNotice(null);

    const cleanDigits = phone.replace(/[^0-9]/g, "");
    if (cleanDigits.length < 10) {
      setErrorMessage("Please enter a valid 10-digit mobile number.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/phone/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });

      const data = await res.json();
      if (data.success) {
        setStep("otp");
        setCountdown(30);
        setSuccessNotice(
          data.isDemoReview
            ? `OTP sent to ${data.phone}. (Demo Reviewer Test Code: ${data.demoOtp})`
            : data.message
        );
        // Pre-focus first OTP box
        setTimeout(() => inputRefs.current[0]?.focus(), 150);
      } else {
        setErrorMessage(data.error || "Failed to send OTP.");
      }
    } catch {
      setErrorMessage("Network error connecting to authentication service.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle individual digit input
  const handleDigitChange = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newDigits = [...otpDigits];
    newDigits[index] = value;
    setOtpDigits(newDigits);

    // Auto-advance to next box if digit entered
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit if all 6 digits are filled
    const fullOtp = newDigits.join("");
    if (fullOtp.length === 6) {
      handleVerifyOtp(fullOtp);
    }
  };

  // Handle keydown for backspace navigation
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle OTP paste
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, 6);
    if (pasted.length > 0) {
      const newDigits = [...otpDigits];
      for (let i = 0; i < pasted.length; i++) {
        newDigits[i] = pasted[i];
      }
      setOtpDigits(newDigits);
      if (pasted.length === 6) {
        handleVerifyOtp(pasted);
      } else {
        inputRefs.current[pasted.length]?.focus();
      }
    }
  };

  // Verify OTP
  const handleVerifyOtp = async (codeToVerify?: string) => {
    const otp = codeToVerify || otpDigits.join("");
    if (otp.length !== 6) {
      setErrorMessage("Please enter all 6 digits of the verification code.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/auth/phone/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp }),
      });

      const data = await res.json();
      if (data.success) {
        await refreshSession();
        router.push(redirectTo);
        router.refresh();
      } else {
        setErrorMessage(data.error || "Invalid verification code.");
      }
    } catch {
      setErrorMessage("Network error during verification.");
    } finally {
      setIsLoading(false);
    }
  };

  // Demo account quick filler
  const handleFillDemo = () => {
    setPhone("+91 98261 12345");
    setOtpDigits(["1", "2", "3", "4", "5", "6"]);
  };

  return (
    <div className="min-h-screen flex w-full bg-[#F8F8F3]">
      {/* Left Branded Hero Section */}
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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E5EEE8] text-[#173F35] text-xs font-bold">
              <Store className="w-3.5 h-3.5 text-[#E9A83B]" />
              <span>Retailer Wholesale Access</span>
            </div>
            <h2 className="text-3xl font-extrabold text-[#173F35] tracking-tight">
              {step === "phone" ? "Sign In to Your Kirana Account" : "Enter Verification Code"}
            </h2>
            <p className="text-sm text-[#7B857E]">
              {step === "phone"
                ? "Enter your authorized mobile number registered with the Jabalpur distributor."
                : `We sent a 6-digit verification code to ${phone}.`}
            </p>
          </div>

          {/* Demo Account Quick-Fill Notice for Reviewers */}
          <div className="p-3.5 rounded-xl bg-[#E5EEE8]/60 border border-[#cbded2] text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#173F35] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#E9A83B]" />
                Demo Retailer Review Account
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
              Mobile: <strong>+91 98261 12345</strong> (Rajesh Sharma — Mahakaushal Kirana Store) • OTP: <strong>123456</strong>
            </p>
          </div>

          {/* Alerts */}
          {errorMessage && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-800 flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successNotice && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-900 flex items-start gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successNotice}</span>
            </div>
          )}

          {/* Step 1: Mobile Number Input */}
          {step === "phone" && (
            <form onSubmit={handleSendOtp} className="space-y-5">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#173F35] uppercase tracking-wider">
                  Registered Mobile Number
                </label>
                <div className="relative flex rounded-xl border border-[#cbded2] bg-white overflow-hidden focus-within:border-[#173F35] transition-all">
                  <div className="px-3.5 py-3 bg-[#F8F8F3] border-r border-[#cbded2] text-xs font-bold text-[#173F35] flex items-center gap-1.5">
                    <span>🇮🇳</span>
                    <span>+91</span>
                  </div>
                  <input
                    type="tel"
                    value={phone.replace(/^\+91\s?/, "")}
                    onChange={(e) => setPhone(`+91 ${e.target.value}`)}
                    placeholder="98261 12345"
                    className="flex-1 px-4 py-3 text-sm font-semibold text-[#202923] outline-none"
                    autoFocus
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-5 rounded-xl bg-[#173F35] hover:bg-[#244d3e] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-[#E9A83B]" />
                    <span>Sending Code...</span>
                  </>
                ) : (
                  <>
                    <span>Send Verification Code</span>
                    <ArrowRight className="w-4 h-4 text-[#E9A83B]" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Step 2: 6-Digit OTP Verification Form */}
          {step === "otp" && (
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-[#173F35] uppercase tracking-wider">
                    6-Digit Security Code
                  </span>
                  <button
                    type="button"
                    onClick={() => setStep("phone")}
                    className="text-[#7B857E] hover:text-[#173F35] flex items-center gap-1 font-semibold"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Change Number</span>
                  </button>
                </div>

                {/* Individual 6-digit boxes */}
                <div className="flex justify-between gap-2 sm:gap-3" onPaste={handlePaste}>
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        inputRefs.current[idx] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      className="w-12 h-14 sm:w-14 sm:h-16 text-center text-xl sm:text-2xl font-extrabold rounded-xl border-2 border-[#cbded2] bg-white text-[#173F35] focus:border-[#173F35] focus:bg-[#f0f5f2] outline-none transition-all shadow-subtle"
                    />
                  ))}
                </div>
              </div>

              {/* Verify Button */}
              <button
                type="button"
                onClick={() => handleVerifyOtp()}
                disabled={isLoading || otpDigits.join("").length !== 6}
                className="w-full py-3.5 px-5 rounded-xl bg-[#173F35] hover:bg-[#244d3e] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-[#E9A83B]" />
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  <>
                    <span>Verify & Open Dashboard</span>
                    <ArrowRight className="w-4 h-4 text-[#E9A83B]" />
                  </>
                )}
              </button>

              {/* Resend Cooldown */}
              <div className="text-center text-xs text-[#7B857E]">
                {countdown > 0 ? (
                  <span>Resend code available in <strong>{countdown}s</strong></span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSendOtp()}
                    className="font-bold text-[#173F35] hover:text-[#E9A83B] underline"
                  >
                    Didn't receive code? Resend OTP
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Switch to Order Desk Portal */}
          <div className="pt-6 border-t border-[#E5EEE8] text-center text-xs text-[#576059] space-y-2">
            <p>Distributor employee or billing administrator?</p>
            <Link
              href="/desk/login"
              className="inline-flex items-center gap-1.5 font-bold text-[#173F35] hover:text-[#E9A83B] transition-colors"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Go to Order Desk Operations Login →</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
