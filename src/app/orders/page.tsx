"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/lib/auth/auth-context";
import { useCart } from "@/lib/cart/cart-context";
import { Order, OrderStatus } from "@/types";
import {
  Clock,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ShoppingBag,
  Gift,
  ArrowRight,
  Filter,
  Eye,
} from "lucide-react";

export default function OrderHistoryPage() {
  const router = useRouter();
  const { retailer } = useAuth();
  const { addToCart, clearCart } = useCart();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    async function loadOrders() {
      try {
        const res = await fetch("/api/orders?retailer_id=" + (retailer?.id || ""));
        const json = await res.json();
        if (json.success) {
          setOrders(json.orders);
        }
      } catch (e) {
        console.error("Failed to load order history", e);
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, [retailer?.id]);

  const filteredOrders = orders.filter((o) =>
    statusFilter === "all" ? true : o.status === statusFilter
  );

  // Repeat order: recreates cart using latest catalogue products and active schemes
  const handleRepeatOrder = async (order: Order) => {
    try {
      const prodRes = await fetch("/api/products");
      const prodJson = await prodRes.json();
      if (!prodJson.success) return;

      clearCart();
      const catalogue = prodJson.products;

      for (const item of order.items || []) {
        const prod = catalogue.find((p: any) => p.id === item.product_id);
        if (prod && prod.stock_cases > 0) {
          addToCart(prod, item.quantity);
        }
      }

      router.push("/cart");
    } catch (e) {
      console.error("Repeat order error", e);
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "confirmed":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "on_hold":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "pending_review":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "rejected":
        return "bg-rose-100 text-rose-800 border-rose-200";
      case "processing":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F8F3]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5EEE8] pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#173F35] tracking-tight">
              Order History & Re-orders
            </h1>
            <p className="text-sm text-[#7B857E] mt-1">
              Track status of orders placed with Jabalpur distribution office and repeat orders with a single click.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-[#cbded2] bg-white text-xs font-semibold text-[#202923]"
            >
              <option value="all">All Statuses ({orders.length})</option>
              <option value="pending_review">Pending Review</option>
              <option value="confirmed">Confirmed / Approved</option>
              <option value="on_hold">On Credit Hold</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-[#E5EEE8] animate-pulse h-28" />
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-[#E5EEE8] shadow-subtle space-y-3">
            <Clock className="w-12 h-12 text-[#cbded2] mx-auto" />
            <h3 className="text-lg font-bold text-[#173F35]">No Orders Found</h3>
            <p className="text-sm text-[#7B857E] max-w-sm mx-auto">
              You haven't placed any orders matching this filter yet.
            </p>
            <Link
              href="/catalogue"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#173F35] text-white text-xs font-bold"
            >
              <span>Start an Order</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const dateStr = new Date(order.created_at).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl border border-[#E5EEE8] shadow-subtle hover:border-[#173F35]/30 p-5 sm:p-6 transition-all space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5">
                        <span className="font-extrabold text-base text-[#173F35]">
                          {order.order_number}
                        </span>
                        <span
                          className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadge(
                            order.status
                          )}`}
                        >
                          {order.status.replace("_", " ").toUpperCase()}
                        </span>
                        <span className="text-[11px] font-semibold text-[#7B857E] bg-[#F8F8F3] px-2 py-0.5 rounded">
                          Source: {order.source === "ai_capture" ? "AI Text/Voice" : "Web Portal"}
                        </span>
                      </div>
                      <p className="text-xs text-[#7B857E]">Placed on {dateStr}</p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-xs text-[#7B857E]">Total Value</p>
                        <p className="text-xl font-extrabold text-[#173F35]">
                          ₹{order.grand_total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </p>
                      </div>

                      <button
                        onClick={() => handleRepeatOrder(order)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#E5EEE8] hover:bg-[#cbded2] text-[#173F35] text-xs font-bold transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-[#E9A83B]" />
                        <span>Repeat Order</span>
                      </button>

                      <button
                        onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                        className="p-2 rounded-xl border border-[#cbded2] hover:bg-[#F8F8F3] text-[#173F35]"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Credit Hold Reason Alert */}
                  {order.credit_hold_reason && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <span>{order.credit_hold_reason}</span>
                    </div>
                  )}

                  {/* Scheme benefits summary */}
                  {(order.scheme_discount_total > 0 || order.free_items_total_value > 0) && (
                    <div className="p-2.5 bg-[#fef9ee] border border-[#fbe0aa] rounded-xl flex items-center gap-2 text-xs text-[#ca7f1f] font-bold">
                      <Gift className="w-4 h-4 shrink-0" />
                      <span>
                        Promotional Scheme Savings:{" "}
                        {order.scheme_discount_total > 0 &&
                          `₹${order.scheme_discount_total.toFixed(2)} discount applied. `}
                        {order.free_items_total_value > 0 &&
                          `₹${order.free_items_total_value.toFixed(2)} worth of free promotional cases awarded.`}
                      </span>
                    </div>
                  )}

                  {/* Expanded Order Items Drawer */}
                  {selectedOrder?.id === order.id && (
                    <div className="pt-4 border-t border-[#E5EEE8] space-y-3">
                      <h4 className="text-xs font-bold text-[#173F35] uppercase tracking-wider">
                        Ordered Line Items ({order.items?.length || 0})
                      </h4>
                      <div className="divide-y divide-[#E5EEE8] border border-[#E5EEE8] rounded-xl overflow-hidden text-xs">
                        {order.items?.map((item) => (
                          <div key={item.id} className="p-3 bg-[#F8F8F3] flex justify-between items-center">
                            <div>
                              <p className="font-bold text-[#202923]">
                                {item.product?.name || "Product"}
                              </p>
                              <p className="text-[11px] text-[#7B857E]">
                                SKU: {item.product?.sku} • {item.quantity} cases ordered
                                {item.free_quantity > 0 && (
                                  <span className="font-bold text-emerald-700 ml-1">
                                    (+{item.free_quantity} FREE case)
                                  </span>
                                )}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-[#173F35]">
                                ₹{item.line_total.toFixed(2)}
                              </p>
                              <p className="text-[10px] text-[#7B857E]">
                                Rate: ₹{item.unit_price.toFixed(2)} + GST
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
