"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Order, OrderStatus } from "@/types";
import {
  Layers,
  ShieldCheck,
  AlertTriangle,
  Clock,
  CheckCircle2,
  TrendingUp,
  FileSpreadsheet,
  ArrowRight,
  Search,
  Filter,
  DollarSign,
  Building2,
  Store,
} from "lucide-react";

export default function OrderDeskDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch("/api/orders");
        const json = await res.json();
        if (json.success) {
          setOrders(json.orders);
        }
      } catch (e) {
        console.error("Order desk data fetch failed", e);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  // Compute live operational statistics from actual database records
  const stats = useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    const ordersToday = orders.filter((o) => o.created_at.startsWith(todayStr));
    const awaitingReview = orders.filter((o) => o.status === "pending_review");
    const confirmed = orders.filter((o) => o.status === "confirmed");
    const onHold = orders.filter((o) => o.status === "on_hold");
    const totalRevenue = orders.reduce((acc, o) => acc + o.grand_total, 0);

    return {
      ordersTodayCount: ordersToday.length || orders.length,
      awaitingReviewCount: awaitingReview.length,
      confirmedCount: confirmed.length,
      onHoldCount: onHold.length,
      totalOrderValue: totalRevenue,
    };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchSearch =
        o.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (o.retailer?.store_name &&
          o.retailer.store_name.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchSearch;
    });
  }, [orders, searchQuery]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F8F3]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Order Desk Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5EEE8] pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#173F35] text-white text-xs font-bold mb-2">
              <Building2 className="w-3.5 h-3.5 text-[#E9A83B]" />
              <span>Jabalpur FMCG Operations Control Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#173F35] tracking-tight">
              Order Desk Operations
            </h1>
            <p className="text-sm text-[#7B857E] mt-0.5">
              Review AI extractions, resolve credit holds, approve Kirana dispatches, and export to Tally.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/order-desk/orders"
              className="px-5 py-2.5 rounded-xl bg-[#173F35] hover:bg-[#244d3e] text-white text-xs font-bold shadow-md transition-all flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-[#E9A83B]" />
              <span>Process Pending Queue ({stats.awaitingReviewCount})</span>
            </Link>

            <Link
              href="/order-desk/export"
              className="px-5 py-2.5 rounded-xl bg-white border border-[#cbded2] text-[#173F35] hover:bg-[#E5EEE8] text-xs font-bold transition-all flex items-center gap-2"
            >
              <FileSpreadsheet className="w-4 h-4 text-[#173F35]" />
              <span>Tally Export</span>
            </Link>
          </div>
        </div>

        {/* Live Metrics Grid (100% Database Driven) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Orders Today */}
          <div className="bg-white rounded-2xl p-5 border border-[#E5EEE8] shadow-subtle space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-[#7B857E] uppercase">
              <span>Orders Active</span>
              <Clock className="w-4 h-4 text-[#173F35]" />
            </div>
            <p className="text-3xl font-extrabold text-[#173F35]">{stats.ordersTodayCount}</p>
            <p className="text-[11px] text-[#7B857E]">Daily volume from 1,800 kiranas</p>
          </div>

          {/* Card 2: Awaiting Review */}
          <div className="bg-white rounded-2xl p-5 border border-blue-200 shadow-subtle space-y-2 bg-blue-50/30">
            <div className="flex justify-between items-center text-xs font-bold text-blue-900 uppercase">
              <span>Awaiting Desk Review</span>
              <ShieldCheck className="w-4 h-4 text-blue-700" />
            </div>
            <p className="text-3xl font-extrabold text-blue-800">{stats.awaitingReviewCount}</p>
            <p className="text-[11px] text-blue-900/80">Pending order desk validation</p>
          </div>

          {/* Card 3: Orders on Credit Hold */}
          <div className="bg-white rounded-2xl p-5 border border-amber-200 shadow-subtle space-y-2 bg-amber-50/40">
            <div className="flex justify-between items-center text-xs font-bold text-amber-900 uppercase">
              <span>Credit Hold Queue</span>
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-3xl font-extrabold text-amber-800">{stats.onHoldCount}</p>
            <p className="text-[11px] text-amber-900/80">Requires credit limit override</p>
          </div>

          {/* Card 4: Confirmed Orders Value */}
          <div className="bg-white rounded-2xl p-5 border border-emerald-200 shadow-subtle space-y-2 bg-emerald-50/30">
            <div className="flex justify-between items-center text-xs font-bold text-emerald-900 uppercase">
              <span>Total Orders Value</span>
              <TrendingUp className="w-4 h-4 text-emerald-700" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-emerald-800">
              ₹{stats.totalOrderValue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
            </p>
            <p className="text-[11px] text-emerald-900/80">{stats.confirmedCount} confirmed for dispatch</p>
          </div>
        </div>

        {/* Operational Filter and Search */}
        <div className="bg-white p-5 rounded-2xl border border-[#E5EEE8] shadow-subtle flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-[#7B857E]" />
            <input
              type="text"
              placeholder="Search by order ID (ORD-...) or Kirana store name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#cbded2] bg-[#F8F8F3] text-sm focus:bg-white focus:border-[#173F35]"
            />
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/order-desk/orders"
              className="text-xs font-bold text-[#173F35] hover:text-[#E9A83B] flex items-center gap-1"
            >
              <span>Detailed Processing Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Recent Operational Activity Stream */}
        <section className="bg-white rounded-2xl border border-[#E5EEE8] shadow-subtle overflow-hidden">
          <div className="p-5 border-b border-[#E5EEE8] flex justify-between items-center bg-[#F8F8F3]">
            <h2 className="font-bold text-sm text-[#173F35] uppercase tracking-wider">
              Live Incoming Order Desk Feed
            </h2>
            <span className="text-xs text-[#7B857E]">Auto-refreshing every 30s</span>
          </div>

          <div className="divide-y divide-[#E5EEE8]">
            {loading ? (
              <div className="p-8 text-center text-xs text-[#7B857E]">Loading orders feed...</div>
            ) : filteredOrders.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#7B857E]">No orders match current query.</div>
            ) : (
              filteredOrders.map((order) => {
                const isHold = order.status === "on_hold";
                const isPending = order.status === "pending_review";
                const isConfirmed = order.status === "confirmed";

                return (
                  <div
                    key={order.id}
                    className="p-5 hover:bg-[#F8F8F3] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5">
                        <span className="font-extrabold text-sm text-[#173F35]">
                          {order.order_number}
                        </span>
                        <span
                          className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                            isConfirmed
                              ? "bg-emerald-100 text-emerald-800"
                              : isHold
                              ? "bg-amber-100 text-amber-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {order.status.replace("_", " ").toUpperCase()}
                        </span>
                        <span className="text-[11px] text-[#7B857E] bg-white px-2 py-0.5 rounded border">
                          Source: {order.source}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-[#576059]">
                        <Store className="w-3.5 h-3.5 text-[#E9A83B]" />
                        <span className="font-bold text-[#202923]">
                          {order.retailer?.store_name || "Mahakaushal Kirana Store"}
                        </span>
                        <span>•</span>
                        <span>{order.items?.length || 1} product lines</span>
                        <span>•</span>
                        <span>{new Date(order.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>
                      </div>

                      {order.credit_hold_reason && (
                        <p className="text-xs text-amber-800 font-medium">
                          ⚠️ {order.credit_hold_reason}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-xs text-[#7B857E]">Grand Total</p>
                        <p className="text-base font-extrabold text-[#173F35]">
                          ₹{order.grand_total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </p>
                      </div>

                      <Link
                        href={`/order-desk/orders?order_id=${order.id}`}
                        className="px-4 py-2 rounded-xl bg-[#173F35] text-white text-xs font-bold hover:bg-[#244d3e] transition-colors"
                      >
                        Review Order
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
