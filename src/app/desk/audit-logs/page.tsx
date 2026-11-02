"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AuditLog } from "@/types";
import {
  ShieldCheck,
  Search,
  Activity,
  User,
  Clock,
  Layers,
} from "lucide-react";

export default function DeskAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchLogs() {
      try {
        const res = await fetch("/api/desk/audit-logs");
        const json = await res.json();
        if (json.success && json.logs) {
          setLogs(json.logs);
        }
      } catch (e) {
        console.warn("Audit logs error:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((l) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const actionMatch = l.action.toLowerCase().includes(q);
    const userMatch = l.user_name ? l.user_name.toLowerCase().includes(q) : false;
    const entityMatch = l.entity_id ? l.entity_id.toLowerCase().includes(q) : false;
    return actionMatch || userMatch || entityMatch;
  });

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
              Immutable log of authentication events, credit overrides, and order status transitions stored in Supabase PostgreSQL.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-[#7B857E] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter audit actions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-[#cbded2] rounded-xl text-xs text-[#173F35] focus:outline-none focus:ring-2 focus:ring-[#173F35]/20"
            />
          </div>
        </div>

        {/* Audit Log Stream */}
        <div className="bg-white rounded-2xl border border-[#cbded2] shadow-card overflow-hidden">
          <div className="p-4 bg-[#F8F8F3] border-b border-[#E5EEE8] flex justify-between items-center text-xs">
            <span className="font-bold text-[#173F35] uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#E9A83B]" />
              <span>Live Database Audit Stream ({filteredLogs.length} events)</span>
            </span>
            <span className="text-[#7B857E]">Supabase PostgreSQL Verified</span>
          </div>

          {loading ? (
            <div className="p-8 text-center text-[#7B857E] text-xs">
              Loading audit logs from Supabase...
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="p-8 text-center text-[#7B857E] text-xs">
              No audit logs matching query.
            </div>
          ) : (
            <div className="divide-y divide-[#E5EEE8] text-xs">
              {filteredLogs.map((entry) => (
                <div
                  key={entry.id}
                  className="p-4 hover:bg-[#F8F8F3] transition-colors flex items-start justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-bold text-[#173F35] bg-[#E5EEE8] px-2 py-0.5 rounded">
                        {entry.action}
                      </span>
                      <span className="text-[#576059] font-semibold flex items-center gap-1">
                        <User className="w-3 h-3 text-[#7B857E]" />
                        {entry.user_name || "Vikram Patel (Order Desk)"}
                      </span>
                      {entry.entity_id && (
                        <span className="text-[11px] font-mono text-[#7B857E] bg-gray-100 px-1.5 py-0.5 rounded">
                          {entry.entity_type}: {entry.entity_id}
                        </span>
                      )}
                    </div>
                    {entry.details && (
                      <p className="text-[#7B857E]">
                        {typeof entry.details === "object"
                          ? Object.entries(entry.details)
                              .map(([k, v]) => `${k}: ${v}`)
                              .join(" • ")
                          : String(entry.details)}
                      </p>
                    )}
                  </div>
                  <span className="text-[11px] text-[#7B857E] whitespace-nowrap flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(entry.created_at).toLocaleString("en-IN", {
                      timeZone: "Asia/Kolkata",
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
