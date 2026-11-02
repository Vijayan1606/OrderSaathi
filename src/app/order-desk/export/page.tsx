"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Order, ExportHistoryRecord } from "@/types";
import {
  FileSpreadsheet,
  Download,
  Calendar,
  CheckCircle2,
  AlertCircle,
  History,
  ShieldCheck,
  Building2,
  FileCheck,
} from "lucide-react";

export default function TallyExportPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [exportHistory, setExportHistory] = useState<ExportHistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  useEffect(() => {
    async function loadExportData() {
      try {
        const ordRes = await fetch("/api/orders");
        const ordJson = await ordRes.json();
        if (ordJson.success) {
          setOrders(ordJson.orders);
        }
      } catch (e) {
        console.error("Failed to load export orders", e);
      } finally {
        setLoading(false);
      }
    }
    loadExportData();
  }, []);

  const confirmedOrders = orders.filter(
    (o) => o.status === "confirmed" || o.status === "processing"
  );

  const unapprovedOrders = orders.filter(
    (o) => o.status === "pending_review" || o.status === "on_hold"
  );

  const handleDownloadCSV = () => {
    let url = "/api/orders/export";
    const params = new URLSearchParams();
    if (startDate) params.set("start_date", startDate);
    if (endDate) params.set("end_date", endDate);
    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    // Direct download
    window.location.href = url;
    setDownloadNotice(
      `Tally CSV export file generated successfully for ${confirmedOrders.length} approved orders.`
    );
    setTimeout(() => setDownloadNotice(null), 5000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F8F3]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5EEE8] pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#173F35] text-white text-xs font-bold mb-2">
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#E9A83B]" />
              <span>Accounting Bridge Integration</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#173F35] tracking-tight">
              Tally CSV Export Center
            </h1>
            <p className="text-sm text-[#7B857E] mt-0.5">
              Generate standardized, audit-ready CSV batches of approved Kirana orders for seamless Tally import.
            </p>
          </div>
        </div>

        {downloadNotice && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{downloadNotice}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Export Controls & Filter */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-[#cbded2] shadow-card p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-2 border-b border-[#E5EEE8] pb-4">
              <FileCheck className="w-5 h-5 text-[#173F35]" />
              <h2 className="text-base font-bold text-[#173F35]">
                Configure Accounting Export Batch
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#173F35] uppercase tracking-wider">
                  Dispatch Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#cbded2] bg-[#F8F8F3] text-xs font-medium focus:bg-white focus:border-[#173F35]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#173F35] uppercase tracking-wider">
                  Dispatch End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#cbded2] bg-[#F8F8F3] text-xs font-medium focus:bg-white focus:border-[#173F35]"
                />
              </div>
            </div>

            {/* Business Rules Guardrail */}
            <div className="p-4 rounded-xl bg-[#E5EEE8]/60 border border-[#cbded2] space-y-2 text-xs text-[#202923]">
              <div className="flex items-center gap-1.5 font-bold text-[#173F35]">
                <ShieldCheck className="w-4 h-4 text-[#173F35]" />
                <span>Enforced Accounting Guardrails</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-[#576059]">
                <li>
                  <strong>Only Approved & Confirmed</strong> orders are eligible for export.
                </li>
                <li>
                  Orders currently in <strong>Pending Review</strong> or on <strong>Credit Hold</strong> are strictly prevented from exporting.
                </li>
                <li>
                  Free promotional goods are separated into distinct quantities with zero charge.
                </li>
              </ul>
            </div>

            {/* Export Summary Numbers */}
            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-[#F8F8F3] border border-[#E5EEE8] text-center">
              <div>
                <p className="text-xs text-[#7B857E]">Eligible Approved Orders</p>
                <p className="text-2xl font-black text-emerald-800">{confirmedOrders.length}</p>
              </div>
              <div>
                <p className="text-xs text-[#7B857E]">Excluded Unapproved</p>
                <p className="text-2xl font-black text-amber-700">{unapprovedOrders.length}</p>
              </div>
            </div>

            {/* Download Button */}
            <button
              type="button"
              onClick={handleDownloadCSV}
              disabled={confirmedOrders.length === 0}
              className="w-full py-3.5 px-6 rounded-xl bg-[#173F35] hover:bg-[#244d3e] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Download className="w-4 h-4 text-[#E9A83B]" />
              <span>Download Tally CSV File ({confirmedOrders.length} Orders)</span>
            </button>
          </div>

          {/* Right: Format Specifications & Schema */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-[#E5EEE8] shadow-subtle p-6 space-y-4">
            <h3 className="font-bold text-sm text-[#173F35] uppercase tracking-wider">
              Tally CSV Column Mapping
            </h3>
            <p className="text-xs text-[#7B857E]">
              Format matches standard sales voucher import structure:
            </p>

            <div className="divide-y divide-[#E5EEE8] border border-[#E5EEE8] rounded-xl overflow-hidden text-xs">
              <div className="p-2.5 bg-[#F8F8F3] flex justify-between font-mono font-bold text-[#173F35]">
                <span>Column Field</span>
                <span>Type</span>
              </div>
              <div className="p-2 flex justify-between">
                <span className="font-semibold">Order ID</span>
                <span className="text-[#7B857E]">ORD-202611-XXX</span>
              </div>
              <div className="p-2 flex justify-between">
                <span className="font-semibold">Retailer ID & Name</span>
                <span className="text-[#7B857E]">Store Name / Kirana</span>
              </div>
              <div className="p-2 flex justify-between">
                <span className="font-semibold">Retailer GST</span>
                <span className="text-[#7B857E]">State GSTIN</span>
              </div>
              <div className="p-2 flex justify-between">
                <span className="font-semibold">SKU Code & Name</span>
                <span className="text-[#7B857E]">Catalog SKU</span>
              </div>
              <div className="p-2 flex justify-between">
                <span className="font-semibold">Quantity (Cases)</span>
                <span className="text-[#7B857E]">Integer</span>
              </div>
              <div className="p-2 flex justify-between">
                <span className="font-semibold">Free Quantity</span>
                <span className="text-[#7B857E]">Promotional Qty</span>
              </div>
              <div className="p-2 flex justify-between">
                <span className="font-semibold">Taxable & GST Amount</span>
                <span className="text-[#7B857E]">INR Decimal</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
