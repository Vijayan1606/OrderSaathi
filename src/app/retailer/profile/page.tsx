"use client";

import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/lib/auth/auth-context";
import {
  Store,
  CreditCard,
  Building2,
  ShieldCheck,
  Phone,
  MapPin,
  CheckCircle2,
  Gift,
  LogOut,
  Calendar,
} from "lucide-react";

export default function RetailerProfilePage() {
  const { profile, retailer, logout } = useAuth();

  const creditLimit = retailer?.credit_limit || 75000;
  const outstanding = retailer?.outstanding_balance || 14250;
  const available = creditLimit - outstanding;
  const creditUsage = Math.min(100, Math.round((outstanding / creditLimit) * 100));

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F8F3]">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="border-b border-[#E5EEE8] pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E5EEE8] text-[#173F35] text-xs font-bold mb-2">
            <Store className="w-3.5 h-3.5 text-[#E9A83B]" />
            <span>Authorized FMCG Kirana Profile</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#173F35] tracking-tight">
            Store Profile & Distributor Account
          </h1>
          <p className="text-sm text-[#7B857E]">
            Registered kirana partner information and live commercial credit standing with Jabalpur Distribution Hub.
          </p>
        </div>

        {/* Credit Standing Card */}
        <div className="bg-white rounded-2xl border border-[#cbded2] shadow-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5EEE8] pb-4">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-[#173F35]" />
              <h2 className="font-bold text-base text-[#173F35]">
                Commercial Credit Facility Standing
              </h2>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
              Active • Good Standing
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-[#F8F8F3] border border-[#E5EEE8] text-center">
              <p className="text-xs text-[#7B857E]">Sanctioned Credit Limit</p>
              <p className="text-xl font-extrabold text-[#173F35]">
                ₹{creditLimit.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#F8F8F3] border border-[#E5EEE8] text-center">
              <p className="text-xs text-[#7B857E]">Outstanding Balance</p>
              <p className="text-xl font-extrabold text-rose-700">
                ₹{outstanding.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 text-center">
              <p className="text-xs text-emerald-800 font-semibold">Available Credit</p>
              <p className="text-xl font-extrabold text-emerald-800">
                ₹{available.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          <div className="space-y-1.5 pt-2">
            <div className="flex justify-between text-xs text-[#7B857E]">
              <span>Credit Utilized: {creditUsage}%</span>
              <span>Payment Cycle: 7 Days from Invoice</span>
            </div>
            <div className="w-full bg-[#E5EEE8] h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-[#173F35] h-full rounded-full transition-all"
                style={{ width: `${creditUsage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Store Profile Details */}
        <div className="bg-white rounded-2xl border border-[#E5EEE8] shadow-subtle p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-[#E5EEE8] pb-4">
            <Store className="w-5 h-5 text-[#173F35]" />
            <h2 className="font-bold text-base text-[#173F35]">Kirana Store Details</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <span className="text-[#7B857E] font-medium">Store Registered Name:</span>
              <p className="font-bold text-sm text-[#202923]">
                {retailer?.store_name || "Mahakaushal Kirana Store"}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[#7B857E] font-medium">Proprietor / Contact Person:</span>
              <p className="font-bold text-sm text-[#202923]">
                {retailer?.owner_name || profile?.full_name || "Rajesh Sharma"}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[#7B857E] font-medium">Mobile Phone (OTP Login):</span>
              <p className="font-bold text-sm text-[#173F35]">
                {retailer?.phone || profile?.phone || "+91 98261 12345"}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[#7B857E] font-medium">Registered GSTIN:</span>
              <p className="font-mono font-bold text-sm text-[#202923]">
                {retailer?.gst_number || "23AAAFM1234F1Z5"}
              </p>
            </div>

            <div className="sm:col-span-2 space-y-1 pt-2 border-t border-[#E5EEE8]">
              <span className="text-[#7B857E] font-medium">Physical Delivery Address:</span>
              <p className="font-medium text-[#202923]">
                {retailer?.address || "Shop No. 14, Lordganj Main Market"}, Jabalpur, Madhya Pradesh 482002
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={logout}
            className="px-6 py-2.5 rounded-xl bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-xs flex items-center gap-2 transition-colors shadow-sm"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out of Store Account</span>
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
