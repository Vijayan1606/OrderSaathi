"use client";

import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/lib/auth/auth-context";
import {
  Building2,
  ShieldCheck,
  Mail,
  Phone,
  LogOut,
  Sliders,
  CheckCircle2,
} from "lucide-react";

export default function DeskSettingsPage() {
  const { profile, logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F8F3]">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="border-b border-[#E5EEE8] pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#173F35] text-white text-xs font-bold mb-2">
            <Building2 className="w-3.5 h-3.5 text-[#E9A83B]" />
            <span>Operational Settings</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#173F35] tracking-tight">
            Order Desk Agent Profile
          </h1>
          <p className="text-sm text-[#7B857E]">
            Authenticated employee credentials and distribution workstation settings.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-[#cbded2] shadow-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5EEE8] pb-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#173F35]" />
              <h2 className="font-bold text-base text-[#173F35]">
                Desk Agent Identity
              </h2>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#173F35] text-[#E9A83B]">
              Role: ORDER_DESK
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <span className="text-[#7B857E]">Full Name:</span>
              <p className="font-bold text-sm text-[#202923]">{profile?.full_name || "Vikram Patel"}</p>
            </div>

            <div className="space-y-1">
              <span className="text-[#7B857E]">Employee Email:</span>
              <p className="font-bold text-sm text-[#173F35]">{profile?.email || "desk@ordersaathi.demo"}</p>
            </div>

            <div className="space-y-1">
              <span className="text-[#7B857E]">Operational Station:</span>
              <p className="font-medium text-[#202923]">Jabalpur Main Mandi Dispatch Hub, Counter 1</p>
            </div>

            <div className="space-y-1">
              <span className="text-[#7B857E]">Account Security:</span>
              <p className="font-semibold text-emerald-800 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Verified Supabase Auth Session
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-[#E5EEE8] flex justify-end">
            <button
              type="button"
              onClick={logout}
              className="px-6 py-2.5 rounded-xl bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-xs flex items-center gap-2 transition-colors shadow-sm"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out of Desk Workstation</span>
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
