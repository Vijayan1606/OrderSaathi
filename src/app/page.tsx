"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/lib/auth/auth-context";
import { useCart } from "@/lib/cart/cart-context";
import { Product, Order, Scheme } from "@/types";
import {
  ShoppingBag,
  Sparkles,
  TrendingUp,
  CreditCard,
  Clock,
  ArrowRight,
  Gift,
  Percent,
  CheckCircle2,
  AlertCircle,
  PackageCheck,
  RefreshCw,
  Plus,
  Store,
} from "lucide-react";

export default function RetailerDashboard() {
  const { profile, retailer } = useAuth();
  const { addToCart, items: cartItems, calculation } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const prodRes = await fetch("/api/products");
        const prodJson = await prodRes.json();
        if (prodJson.success) {
          setProducts(prodJson.products);
          setSchemes(prodJson.schemes);
        }

        const ordRes = await fetch("/api/orders?retailer_id=" + (retailer?.id || ""));
        const ordJson = await ordRes.json();
        if (ordJson.success) {
          setOrders(ordJson.orders);
        }
      } catch (err) {
        console.error("Dashboard data fetch failed", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [retailer?.id]);

  const creditLimit = retailer?.credit_limit || 75000;
  const outstanding = retailer?.outstanding_balance || 14250;
  const availableCredit = creditLimit - outstanding;
  const creditUsagePercentage = Math.min(100, Math.round((outstanding / creditLimit) * 100));

  const recentOrder = orders[0];

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F8F3]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Retailer Welcome Banner */}
        <section className="bg-gradient-to-r from-[#173F35] to-[#244d3e] rounded-2xl p-6 sm:p-8 text-white shadow-card relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-[#E9A83B] backdrop-blur-sm">
                <Store className="w-3.5 h-3.5" />
                <span>{retailer?.store_name || "Mahakaushal Kirana Store"}</span>
                <span>•</span>
                <span>Jabalpur Mandi Route</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Namaste, {profile?.full_name || "Rajesh Sharma"} Ji!
              </h1>
              <p className="text-[#cbded2] text-sm max-w-xl">
                Ready to place today's shop order? Today's dispatch window closes at 6:00 PM for tomorrow morning delivery.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/ai-order"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#E9A83B] hover:bg-[#ca7f1f] text-[#202923] font-bold text-sm shadow-md transition-all transform hover:-translate-y-0.5"
              >
                <Sparkles className="w-4 h-4 text-[#202923]" />
                <span>Turn Message to Order</span>
              </Link>
              <Link
                href="/catalogue"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm backdrop-blur-sm border border-white/20 transition-all"
              >
                <ShoppingBag className="w-4 h-4 text-[#E9A83B]" />
                <span>Browse Catalogue</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Financial Credit Health Widget & Schemes Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Credit Health Card */}
          <div className="bg-white rounded-2xl p-6 border border-[#E5EEE8] shadow-subtle flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#7B857E] uppercase tracking-wider">
                  Distributor Credit Line
                </span>
                <CreditCard className="w-4 h-4 text-[#173F35]" />
              </div>
              <div>
                <p className="text-xs text-[#7B857E]">Available Credit</p>
                <p className="text-2xl sm:text-3xl font-extrabold text-emerald-800">
                  ₹{availableCredit.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </p>
              </div>

              {/* Progress bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-[#7B857E]">
                  <span>Used: ₹{outstanding.toLocaleString("en-IN")}</span>
                  <span>Limit: ₹{creditLimit.toLocaleString("en-IN")}</span>
                </div>
                <div className="w-full bg-[#E5EEE8] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#173F35] h-full rounded-full transition-all"
                    style={{ width: `${creditUsagePercentage}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#E5EEE8] flex items-center justify-between text-xs">
              <span className="text-[#576059]">Billing Status:</span>
              <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Good Standing (7-day cycle)
              </span>
            </div>
          </div>

          {/* Active Schemes Highlights */}
          <div className="md:col-span-2 bg-[#E5EEE8]/50 rounded-2xl p-6 border border-[#E5EEE8] shadow-subtle flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Gift className="w-5 h-5 text-[#E9A83B]" />
                  <h2 className="text-base font-bold text-[#173F35]">
                    Active Distributor Schemes in Jabalpur
                  </h2>
                </div>
                <Link
                  href="/catalogue"
                  className="text-xs font-bold text-[#173F35] hover:text-[#E9A83B] flex items-center gap-1"
                >
                  <span>View in Catalogue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {schemes.slice(0, 2).map((scheme) => (
                  <div
                    key={scheme.id}
                    className="bg-white rounded-xl p-4 border border-[#cbded2] shadow-sm space-y-2"
                  >
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#E9A83B]/20 text-[#ca7f1f]">
                        {scheme.scheme_type === "buy_x_get_y" ? "BUY X GET Y FREE" : "SLAB DISCOUNT"}
                      </span>
                    </div>
                    <p className="font-bold text-sm text-[#173F35]">{scheme.name}</p>
                    <p className="text-xs text-[#576059] leading-relaxed">
                      {scheme.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#cbded2] flex items-center justify-between text-xs text-[#576059]">
              <span>Verified with billing desk • Auto-applied at server checkout</span>
              <span className="font-semibold text-[#173F35]">Valid till 31 Dec 2026</span>
            </div>
          </div>
        </div>

        {/* Popular Fast-Moving Products (Quick Add) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#173F35]" />
              <h2 className="text-lg font-bold text-[#173F35]">
                Fast Moving Kirana Products
              </h2>
            </div>
            <Link
              href="/catalogue"
              className="text-sm font-semibold text-[#173F35] hover:text-[#E9A83B] flex items-center gap-1"
            >
              <span>See Full Catalogue ({products.length})</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.slice(0, 3).map((product) => {
              const isOutOfStock = product.stock_cases <= 0;
              return (
                <div
                  key={product.id}
                  className={`bg-white rounded-2xl border p-5 shadow-card transition-all flex flex-col justify-between ${
                    isOutOfStock ? "border-amber-200 opacity-80" : "border-[#E5EEE8] hover:border-[#173F35]/30"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-0.5">
                        <span className="text-[11px] font-mono text-[#7B857E] tracking-wider uppercase">
                          {product.sku}
                        </span>
                        <h3 className="font-bold text-base text-[#202923]">{product.name}</h3>
                        <p className="text-xs text-[#7B857E]">{product.brand} • {product.packaging}</p>
                      </div>

                      {product.active_scheme && (
                        <span className="bg-[#fef9ee] border border-[#fbe0aa] text-[#ca7f1f] text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                          {product.active_scheme.scheme_type === "buy_x_get_y" ? "1 Free" : "3% Off"}
                        </span>
                      )}
                    </div>

                    <div className="flex items-baseline gap-2">
                      <span className="text-xs text-[#7B857E]">Dealer Price:</span>
                      <span className="text-xl font-extrabold text-[#173F35]">
                        ₹{product.dealer_price.toFixed(2)}
                      </span>
                      <span className="text-xs text-[#7B857E]">/ case</span>
                      <span className="text-xs line-through text-[#aab2ab]">MRP ₹{product.mrp.toFixed(2)}</span>
                    </div>

                    <div className="text-xs flex items-center gap-2">
                      <span className="text-[#7B857E]">Jabalpur Stock:</span>
                      {isOutOfStock ? (
                        <span className="font-semibold text-rose-600">Out of Stock</span>
                      ) : (
                        <span className="font-semibold text-emerald-700">
                          {product.stock_cases} cases available
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-[#E5EEE8] flex items-center justify-between">
                    <span className="text-xs text-[#576059]">GST Rate: {product.gst_rate}%</span>
                    <button
                      disabled={isOutOfStock}
                      onClick={() => addToCart(product, 1)}
                      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        isOutOfStock
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-[#173F35] hover:bg-[#244d3e] text-white shadow-sm"
                      }`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{isOutOfStock ? "Unavailable" : "Add Case"}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Recent Order & Quick Reorder */}
        {recentOrder && (
          <section className="bg-white rounded-2xl p-6 border border-[#E5EEE8] shadow-subtle space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#173F35]" />
                <h2 className="text-base font-bold text-[#173F35]">Previous Order Snapshot</h2>
              </div>
              <Link
                href="/orders"
                className="text-xs font-bold text-[#173F35] hover:text-[#E9A83B]"
              >
                View All Orders
              </Link>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#F8F8F3] border border-[#E5EEE8]">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-[#202923]">{recentOrder.order_number}</span>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      recentOrder.status === "confirmed"
                        ? "bg-emerald-100 text-emerald-800"
                        : recentOrder.status === "on_hold"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {recentOrder.status.replace("_", " ").toUpperCase()}
                  </span>
                </div>
                <p className="text-xs text-[#7B857E]">
                  Placed on {new Date(recentOrder.created_at).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })} • {recentOrder.items?.length || 1} product lines
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs text-[#7B857E]">Total Bill</p>
                  <p className="text-base font-bold text-[#173F35]">
                    ₹{recentOrder.grand_total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <Link
                  href="/orders"
                  className="px-4 py-2 rounded-xl bg-white border border-[#cbded2] text-[#173F35] hover:bg-[#E5EEE8] font-bold text-xs transition-colors"
                >
                  Order Details
                </Link>
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
