"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Order, OrderStatus } from "@/types";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  CreditCard,
  Store,
  Clock,
  Sparkles,
  Receipt,
  FileText,
  UserCheck,
  History,
  ArrowRight,
} from "lucide-react";

export default function OrderDeskReviewPage(props: {
  params?: { id?: string };
  searchParams?: { order_id?: string };
}) {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F8F8F3]">
          <div className="p-8 text-center text-[#173F35] font-bold">
            Loading Jabalpur Order Desk Queue...
          </div>
        </div>
      }
    >
      <OrderDeskReviewContent targetOrderId={props.params?.id || props.searchParams?.order_id} />
    </React.Suspense>
  );
}

function OrderDeskReviewContent({ targetOrderId }: { targetOrderId?: string }) {
  const searchParams = useSearchParams();
  const highlightedOrderId = targetOrderId || searchParams.get("order_id");

  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionReason, setActionReason] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadOrders() {
      try {
        const res = await fetch("/api/orders");
        const json = await res.json();
        if (json.success) {
          setOrders(json.orders);
          if (highlightedOrderId) {
            const found = json.orders.find((o: Order) => o.id === highlightedOrderId);
            if (found) setSelectedOrder(found);
            else if (json.orders.length > 0) setSelectedOrder(json.orders[0]);
          } else if (json.orders.length > 0) {
            setSelectedOrder(json.orders[0]);
          }
        }
      } catch (err) {
        console.error("Order desk load error", err);
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, [highlightedOrderId]);

  const handleUpdateStatus = async (newStatus: OrderStatus) => {
    if (!selectedOrder) return;

    setIsUpdating(true);
    setStatusMessage(null);

    try {
      const res = await fetch(`/api/orders/${selectedOrder.id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          reviewer_id: "22222222-2222-2222-2222-222222222222",
          reason: actionReason || `Status changed to ${newStatus} by Order Desk.`,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setStatusMessage(json.message);
        setActionReason("");
        // Refresh local orders list
        setOrders((prev) =>
          prev.map((o) => (o.id === selectedOrder.id ? { ...o, status: newStatus } : o))
        );
        setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
        setTimeout(() => setStatusMessage(null), 4000);
      } else {
        alert(json.error || "Failed to update order status");
      }
    } catch (e) {
      console.error("Failed to update status", e);
    } finally {
      setIsUpdating(false);
    }
  };

  const currentRetailer = selectedOrder?.retailer;
  const creditLimit = currentRetailer?.credit_limit || 75000;
  const outstanding = currentRetailer?.outstanding_balance || 14250;
  const availableCredit = creditLimit - outstanding;

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F8F3]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5EEE8] pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#173F35] tracking-tight">
              Order Review & Processing Workspace
            </h1>
            <p className="text-sm text-[#7B857E] mt-1">
              Validate incoming retail orders, verify AI transcription fidelity, review credit holds, and authorize dispatch.
            </p>
          </div>
        </div>

        {statusMessage && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{statusMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Queue List */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-[#E5EEE8] shadow-subtle overflow-hidden">
            <div className="p-4 bg-[#F8F8F3] border-b border-[#E5EEE8] flex justify-between items-center">
              <h2 className="font-bold text-xs uppercase tracking-wider text-[#173F35]">
                Incoming Queue ({orders.length})
              </h2>
              <span className="text-xs text-[#7B857E]">Select order to review</span>
            </div>

            <div className="divide-y divide-[#E5EEE8] max-h-[750px] overflow-y-auto">
              {orders.map((o) => {
                const isSelected = selectedOrder?.id === o.id;
                return (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => setSelectedOrder(o)}
                    className={`w-full p-4 text-left transition-colors flex flex-col gap-1.5 ${
                      isSelected ? "bg-[#E5EEE8]/60 border-l-4 border-l-[#173F35]" : "hover:bg-[#F8F8F3]"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-xs text-[#173F35]">{o.order_number}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          o.status === "confirmed"
                            ? "bg-emerald-100 text-emerald-800"
                            : o.status === "on_hold"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {o.status.toUpperCase()}
                      </span>
                    </div>

                    <p className="font-bold text-xs text-[#202923] truncate">
                      {o.retailer?.store_name || "Mahakaushal Kirana"}
                    </p>

                    <div className="flex justify-between items-center text-[11px] text-[#7B857E]">
                      <span>₹{o.grand_total.toFixed(2)}</span>
                      <span>{new Date(o.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Detailed Order Inspection & Authorization */}
          <div className="lg:col-span-8 space-y-6">
            {selectedOrder ? (
              <div className="bg-white rounded-2xl border border-[#cbded2] shadow-card p-6 sm:p-8 space-y-6">
                {/* Header info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5EEE8] pb-6">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-extrabold text-[#173F35]">
                        {selectedOrder.order_number}
                      </span>
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full ${
                          selectedOrder.status === "confirmed"
                            ? "bg-emerald-100 text-emerald-800"
                            : selectedOrder.status === "on_hold"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {selectedOrder.status.replace("_", " ").toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-[#7B857E] mt-1">
                      Received via {selectedOrder.source === "ai_capture" ? "AI Text / Voice Capture" : "Web Portal"} •{" "}
                      {new Date(selectedOrder.created_at).toLocaleString("en-IN")}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-[#7B857E]">Order Payable Total</p>
                    <p className="text-2xl font-extrabold text-[#173F35]">
                      ₹{selectedOrder.grand_total.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Retailer Details & Credit Health */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Retailer Info */}
                  <div className="p-4 rounded-xl bg-[#F8F8F3] border border-[#E5EEE8] space-y-2 text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-[#173F35]">
                      <Store className="w-4 h-4 text-[#E9A83B]" />
                      <span>{currentRetailer?.store_name}</span>
                    </div>
                    <p className="text-[#576059]">Owner: {currentRetailer?.owner_name}</p>
                    <p className="text-[#576059]">Phone: {currentRetailer?.phone}</p>
                    <p className="text-[#7B857E]">{currentRetailer?.address}, Jabalpur</p>
                    <p className="text-[#7B857E] font-mono">GST: {currentRetailer?.gst_number || "Unregistered"}</p>
                  </div>

                  {/* Credit Status */}
                  <div className="p-4 rounded-xl bg-[#F8F8F3] border border-[#E5EEE8] space-y-2 text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-[#173F35]">
                      <CreditCard className="w-4 h-4 text-[#173F35]" />
                      <span>Distributor Credit Health</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#7B857E]">Credit Limit:</span>
                      <span className="font-bold">₹{creditLimit.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#7B857E]">Outstanding Balance:</span>
                      <span className="font-bold text-rose-700">₹{outstanding.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-[#E5EEE8]">
                      <span className="text-[#7B857E]">Available Credit:</span>
                      <span className="font-extrabold text-emerald-800">
                        ₹{availableCredit.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Credit Hold Warning if applicable */}
                {selectedOrder.status === "on_hold" && (
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs space-y-2">
                    <div className="flex items-center gap-2 font-bold">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <span>Credit Hold Alert — Action Required</span>
                    </div>
                    <p className="leading-relaxed">
                      {selectedOrder.credit_hold_reason ||
                        `Order amount (₹${selectedOrder.grand_total.toFixed(2)}) exceeds retailer available credit (₹${availableCredit.toFixed(2)}). An authorized desk override is required to confirm.`}
                    </p>
                  </div>
                )}

                {/* Ordered Items Table */}
                <div className="space-y-3">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-[#173F35]">
                    Items in Order ({selectedOrder.items?.length || 0})
                  </h3>

                  <div className="border border-[#E5EEE8] rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#F8F8F3] border-b border-[#E5EEE8] text-[#576059]">
                        <tr>
                          <th className="p-3">Product / SKU</th>
                          <th className="p-3 text-center">Cases</th>
                          <th className="p-3 text-center">Free Qty</th>
                          <th className="p-3 text-right">Dealer Price</th>
                          <th className="p-3 text-right">Discount</th>
                          <th className="p-3 text-right">Taxable</th>
                          <th className="p-3 text-right">Line Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E5EEE8]">
                        {selectedOrder.items?.map((it) => (
                          <tr key={it.id} className="hover:bg-[#F8F8F3]">
                            <td className="p-3">
                              <p className="font-bold text-[#202923]">{it.product?.name || "Product"}</p>
                              <p className="text-[10px] font-mono text-[#7B857E]">{it.product?.sku}</p>
                            </td>
                            <td className="p-3 text-center font-bold">{it.quantity}</td>
                            <td className="p-3 text-center">
                              {it.free_quantity > 0 ? (
                                <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                                  +{it.free_quantity} Free
                                </span>
                              ) : (
                                "—"
                              )}
                            </td>
                            <td className="p-3 text-right font-medium">₹{it.unit_price.toFixed(2)}</td>
                            <td className="p-3 text-right text-emerald-700 font-medium">
                              {it.discount_amount > 0 ? `-₹${it.discount_amount.toFixed(2)}` : "—"}
                            </td>
                            <td className="p-3 text-right font-medium">₹{it.taxable_amount.toFixed(2)}</td>
                            <td className="p-3 text-right font-bold text-[#173F35]">
                              ₹{it.line_total.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Order Desk Authorization Actions */}
                <div className="p-5 rounded-2xl bg-[#F8F8F3] border border-[#cbded2] space-y-4">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-[#173F35]">
                    Order Desk Authorization Decision
                  </h4>

                  <input
                    type="text"
                    placeholder="Enter reason or authorization remarks (required for hold overrides / rejections)..."
                    value={actionReason}
                    onChange={(e) => setActionReason(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#cbded2] bg-white text-xs font-medium focus:border-[#173F35]"
                  />

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() => handleUpdateStatus("confirmed")}
                      className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-sm flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve & Authorize Dispatch</span>
                    </button>

                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() => handleUpdateStatus("on_hold")}
                      className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-sm flex items-center gap-2"
                    >
                      <AlertTriangle className="w-4 h-4" />
                      <span>Place On Hold</span>
                    </button>

                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() => handleUpdateStatus("rejected")}
                      className="px-5 py-2.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold shadow-sm flex items-center gap-2"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject Order</span>
                    </button>
                  </div>
                </div>

                {/* Audit Trail & Corrections History */}
                {selectedOrder.corrections && selectedOrder.corrections.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-[#173F35] flex items-center gap-1.5">
                      <History className="w-3.5 h-3.5" />
                      <span>Audit Trail & Desk Decisions</span>
                    </h4>

                    <div className="space-y-2">
                      {selectedOrder.corrections.map((corr) => (
                        <div key={corr.id} className="p-3 rounded-lg bg-gray-50 border text-xs space-y-1">
                          <div className="flex justify-between font-semibold text-[#173F35]">
                            <span>{corr.action_type}</span>
                            <span className="text-[#7B857E]">
                              {new Date(corr.created_at).toLocaleString("en-IN")}
                            </span>
                          </div>
                          <p className="text-[#576059]">{corr.reason}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-12 text-center border border-[#E5EEE8]">
                <p className="text-sm text-[#7B857E]">Select an order from the queue to begin review.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
