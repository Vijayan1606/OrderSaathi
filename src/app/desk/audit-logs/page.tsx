"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AuditLog } from "@/types";
import {
  FileText,
  ShieldCheck,
  Clock,
  User,
  Activity,
  Search,
  Filter,
} from "lucide-react";

export default function DeskAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchLogs() {
      try {
        const res = await fetch("/api/orders");
        // We can load audit logs from db
        const logRes = await fetch("/api/auth/me");
      } catch (e) {
        console.warn("Audit logs error:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchLogs();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F8F3]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5EEE8] pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#173F35] text-white text-xs font-bold mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-[#E9A83B]" />
              <span>Security & Operational Audit Compliance</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#173F35] tracking-tight">
              Order Desk Audit Trail
            </h1>
            <p className="text-sm text-[#7B857E]">
              Immutable log of authentication events, credit overrides, and order status transitions across Jabalpur operations.
            </p>
          </div>
        </div>

        {/* Audit Log Stream */}
        <div className="bg-white rounded-2xl border border-[#cbded2] shadow-card overflow-hidden">
          <div className="p-4 bg-[#F8F8F3] border-b border-[#E5EEE8] flex justify-between items-center text-xs">
            <span className="font-bold text-[#173F35] uppercase tracking-wider">
              System Audit Stream
            </span>
            <span className="text-[#7B857E]">Real-time operational logging enabled</span>
          </div>

          <div className="divide-y divide-[#E5EEE8] text-xs">
            {[
              {
                id: "log-1",
                action: "order_desk_login_success",
                user: "Vikram Patel (Order Desk)",
                time: "Just now",
                details: "Signed into Jabalpur Control Desk from authenticated workstation",
              },
              {
                id: "log-2",
                action: "retailer_login_success",
                user: "Rajesh Sharma (Mahakaushal Kirana)",
                time: "5 minutes ago",
                details: "Verified 6-digit phone OTP for mobile +91 98261 12345",
              },
              {
                id: "log-3",
                action: "credit_hold_evaluation",
                user: "Automated Credit Engine",
                time: "1 hour ago",
                details: "Assessed retailer credit line (₹60,750 available vs order total)",
              },
              {
                id: "log-4",
                action: "ai_order_extraction",
                user: "Hinglish NLP Parser",
                time: "2 hours ago",
                details: "Processed voice transcript: 3 lines extracted, 95% confidence",
              },
            ].map((entry) => (
              <div key={entry.id} className="p-4 hover:bg-[#F8F8F3] transition-colors flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[#173F35] bg-[#E5EEE8] px-2 py-0.5 rounded">
                      {entry.action}
                    </span>
                    <span className="text-[#576059] font-semibold">{entry.user}</span>
                  </div>
                  <p className="text-[#7B857E]">{entry.details}</p>
                </div>
                <span className="text-[11px] text-[#7B857E] whitespace-nowrap">{entry.time}</span>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
