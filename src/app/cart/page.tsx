"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/lib/auth/auth-context";
import { useCart } from "@/lib/cart/cart-context";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  Gift,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  CreditCard,
  Sparkles,
} from "lucide-react";

export default function CartPage() {
  const router = useRouter();
  const { retailer } = useAuth();
  const {
    items,
    updateQuantity,
    removeFromCart,
    clearCart,
    calculation,
    notes,
    setNotes,
  } = useCart();

  const [submitting, setSubmitting] = useState(false);
  const [submissionFeedback, setSubmissionFeedback] = useState<{
    success: boolean;
    message: string;
    orderNumber?: string;
    isHold?: boolean;
  } | null>(null);

  const availableCredit = retailer
    ? retailer.credit_limit - retailer.outstanding_balance
    : 60750;

  const isExceedingCredit = calculation.grand_total > availableCredit;

  const handleCheckout = async () => {
    if (items.length === 0 || submitting) return;

    setSubmitting(true);
    setSubmissionFeedback(null);

    try {
      const payload = {
        retailer_id: retailer?.id || "aa111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
        items: items.map((it) => ({
          product_id: it.product.id,
          quantity: it.quantity,
        })),
        notes,
        source: "web_portal",
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (json.success) {
        clearCart();
        setSubmissionFeedback({
          success: true,
          message: json.message,
          orderNumber: json.order.order_number,
          isHold: json.order.status === "on_hold",
        });
      } else {
        setSubmissionFeedback({
          success: false,
          message: json.error || "Failed to submit order.",
        });
      }
    } catch (err) {
      console.error("Order submission failed", err);
      setSubmissionFeedback({
        success: false,
        message: "Network or server connection failed. Please retry.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F8F3]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Breadcrumb / Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5EEE8] pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#173F35] tracking-tight">
              Retailer Order Basket
            </h1>
            <p className="text-sm text-[#7B857E] mt-1">
              Review promotional scheme benefits, free goods allocation, and credit check before placing.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/ai-order"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[#cbded2] text-[#173F35] hover:bg-[#E5EEE8] text-xs font-bold transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#E9A83B]" />
              <span>Voice / Text Order</span>
            </Link>
            <Link
              href="/catalogue"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#173F35] text-white text-xs font-bold hover:bg-[#244d3e] transition-colors"
            >
              <span>+ Add More Items</span>
            </Link>
          </div>
        </div>

        {/* Successful / Hold Feedback Modal State */}
        {submissionFeedback && (
          <div
            className={`p-6 rounded-2xl border shadow-card animate-in fade-in zoom-in-95 duration-300 ${
              submissionFeedback.success
                ? submissionFeedback.isHold
                  ? "bg-amber-50 border-amber-300 text-amber-900"
                  : "bg-emerald-50 border-emerald-300 text-emerald-950"
                : "bg-rose-50 border-rose-300 text-rose-950"
            }`}
          >
            <div className="flex items-start gap-4">
              {submissionFeedback.success ? (
                submissionFeedback.isHold ? (
                  <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                )
              ) : (
                <ShieldAlert className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
              )}

              <div className="space-y-2 flex-1">
                <h3 className="font-extrabold text-lg">
                  {submissionFeedback.success
                    ? submissionFeedback.isHold
                      ? `Order ${submissionFeedback.orderNumber} Placed on Credit Hold`
                      : `Order ${submissionFeedback.orderNumber} Submitted Successfully!`
                    : "Order Submission Failed"}
                </h3>
                <p className="text-sm leading-relaxed">{submissionFeedback.message}</p>

                <div className="pt-3 flex items-center gap-3">
                  <Link
                    href="/orders"
                    className="px-4 py-2 rounded-xl bg-[#173F35] text-white text-xs font-bold hover:bg-[#244d3e]"
                  >
                    View in Order History
                  </Link>
                  <Link
                    href="/catalogue"
                    className="px-4 py-2 rounded-xl bg-white border border-[#cbded2] text-[#173F35] text-xs font-bold hover:bg-[#E5EEE8]"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty Cart State */}
        {items.length === 0 && !submissionFeedback ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-[#E5EEE8] shadow-subtle space-y-4">
            <ShoppingBag className="w-16 h-16 text-[#cbded2] mx-auto" />
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-[#173F35]">Your Basket is Currently Empty</h2>
              <p className="text-sm text-[#7B857E] max-w-md mx-auto">
                Select items from our live Jabalpur catalogue or use AI natural text capture to transcribe your order.
              </p>
            </div>
            <div className="pt-2 flex justify-center gap-3">
              <Link
                href="/catalogue"
                className="px-6 py-2.5 rounded-xl bg-[#173F35] hover:bg-[#244d3e] text-white text-sm font-bold shadow-md"
              >
                Browse Catalogue
              </Link>
              <Link
                href="/ai-order"
                className="px-6 py-2.5 rounded-xl bg-[#E9A83B] hover:bg-[#ca7f1f] text-[#202923] text-sm font-bold shadow-md"
              >
                Turn Message to Order
              </Link>
            </div>
          </div>
        ) : items.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Cart Items List */}
            <div className="lg:col-span-8 space-y-4">
              <div className="bg-white rounded-2xl border border-[#E5EEE8] shadow-subtle overflow-hidden">
                <div className="p-4 sm:p-5 bg-[#F8F8F3] border-b border-[#E5EEE8] flex justify-between items-center">
                  <h2 className="font-bold text-sm text-[#173F35]">
                    Ordered Items ({items.length} Product Lines)
                  </h2>
                  <button
                    onClick={clearCart}
                    className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear Basket</span>
                  </button>
                </div>

                <div className="divide-y divide-[#E5EEE8]">
                  {calculation.items.map((calculatedLine) => {
                    const { product, quantity, unit_price, base_amount, free_quantity, discount_amount, line_total, scheme_notes } = calculatedLine;

                    return (
                      <div key={product.id} className="p-4 sm:p-6 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[11px] font-bold text-[#7B857E] bg-[#F8F8F3] px-2 py-0.5 rounded border border-[#E5EEE8]">
                                {product.sku}
                              </span>
                              <span className="text-xs text-[#576059]">{product.brand}</span>
                            </div>
                            <h3 className="font-bold text-base text-[#202923]">{product.name}</h3>
                            <p className="text-xs text-[#7B857E]">{product.packaging}</p>
                          </div>

                          <div className="flex items-center gap-4">
                            {/* Quantity Stepper */}
                            <div className="flex items-center border border-[#cbded2] rounded-xl bg-[#F8F8F3] p-1">
                              <button
                                onClick={() => updateQuantity(product.id, quantity - 1)}
                                className="p-1 rounded text-[#173F35] hover:bg-white"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="w-8 text-center font-bold text-xs text-[#173F35]">
                                {quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(product.id, quantity + 1)}
                                className="p-1 rounded text-[#173F35] hover:bg-white"
                                aria-label="Increase quantity"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <button
                              onClick={() => removeFromCart(product.id)}
                              className="p-1.5 text-[#7B857E] hover:text-rose-600 transition-colors"
                              aria-label="Remove item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Scheme Benefits Alert for this Item */}
                        {scheme_notes && (
                          <div className="p-2.5 rounded-xl bg-[#fef9ee] border border-[#fbe0aa] flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2 text-[#ca7f1f] font-bold">
                              <Gift className="w-4 h-4 shrink-0" />
                              <span>{scheme_notes}</span>
                            </div>
                            {free_quantity > 0 && (
                              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                {free_quantity} FREE Case (₹0.00)
                              </span>
                            )}
                          </div>
                        )}

                        {/* Line Item Financial Breakdown */}
                        <div className="pt-2 flex flex-wrap items-center justify-between text-xs text-[#576059] border-t border-dashed border-[#E5EEE8]">
                          <div className="space-x-3">
                            <span>Base: {quantity} × ₹{unit_price.toFixed(2)} = ₹{base_amount.toFixed(2)}</span>
                            {discount_amount > 0 && (
                              <span className="text-emerald-700 font-semibold">
                                Discount: -₹{discount_amount.toFixed(2)}
                              </span>
                            )}
                            {free_quantity > 0 && (
                              <span className="text-emerald-800 font-semibold">
                                Total Delivered: {quantity + free_quantity} cases
                              </span>
                            )}
                          </div>

                          <div className="text-right">
                            <span className="text-[#7B857E] mr-1.5">Line Total (inc. GST):</span>
                            <span className="font-extrabold text-sm text-[#173F35]">
                              ₹{line_total.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Order Notes Field */}
              <div className="bg-white p-5 rounded-2xl border border-[#E5EEE8] shadow-subtle space-y-2">
                <label className="block text-xs font-bold text-[#173F35] uppercase tracking-wider">
                  Delivery Notes / Dispatch Instructions for Jabalpur Hub
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Please deliver along with evening tempo route before 7 PM..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-3 rounded-xl border border-[#cbded2] bg-[#F8F8F3] text-sm focus:bg-white focus:border-[#173F35]"
                />
              </div>
            </div>

            {/* Right: Order Summary & Credit Check */}
            <div className="lg:col-span-4 space-y-6 sticky top-24">
              <div className="bg-white rounded-2xl border border-[#E5EEE8] shadow-card p-6 space-y-6">
                <div className="flex items-center gap-2 border-b border-[#E5EEE8] pb-4">
                  <Receipt className="w-5 h-5 text-[#173F35]" />
                  <h2 className="font-extrabold text-base text-[#173F35]">Order Summary</h2>
                </div>

                {/* Subtotals & Taxes */}
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-[#576059]">
                    <span>Item Subtotal ({calculation.items.length} lines):</span>
                    <span className="font-medium text-[#202923]">₹{calculation.subtotal.toFixed(2)}</span>
                  </div>

                  {calculation.total_discount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-medium">
                      <span>Promotional Slab Discounts:</span>
                      <span>-₹{calculation.total_discount.toFixed(2)}</span>
                    </div>
                  )}

                  {calculation.total_free_value > 0 && (
                    <div className="flex justify-between text-emerald-800 text-xs bg-emerald-50 p-2 rounded-lg">
                      <span>Promotional Free Goods Value:</span>
                      <span className="font-bold">
                        ₹{calculation.total_free_value.toFixed(2)} (FREE)
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-[#576059]">
                    <span>Taxable Amount:</span>
                    <span className="font-medium text-[#202923]">₹{calculation.total_taxable.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between text-[#576059]">
                    <span>Estimated GST (5% / 18%):</span>
                    <span className="font-medium text-[#202923]">₹{calculation.total_gst.toFixed(2)}</span>
                  </div>

                  <div className="pt-3 border-t-2 border-[#173F35] flex justify-between items-baseline">
                    <span className="font-bold text-base text-[#173F35]">Grand Order Total:</span>
                    <div className="text-right">
                      <span className="text-2xl font-black text-[#173F35]">
                        ₹{calculation.grand_total.toFixed(2)}
                      </span>
                      <p className="text-[10px] text-[#7B857E]">Inclusive of all taxes</p>
                    </div>
                  </div>
                </div>

                {/* Distributor Credit Check Alert */}
                <div
                  className={`p-4 rounded-xl border text-xs space-y-2 ${
                    isExceedingCredit
                      ? "bg-amber-50 border-amber-300 text-amber-900"
                      : "bg-[#E5EEE8] border-[#cbded2] text-[#173F35]"
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span className="flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-[#E9A83B]" />
                      Available Credit Line:
                    </span>
                    <span>₹{availableCredit.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                  </div>

                  {isExceedingCredit ? (
                    <p className="text-[11px] leading-relaxed font-medium text-amber-800">
                      ⚠️ This order total (₹{calculation.grand_total.toFixed(2)}) exceeds your available credit (₹{availableCredit.toFixed(2)}). Submitting this order will place it into <strong>Credit Hold</strong> status for Order Desk authorization.
                    </p>
                  ) : (
                    <p className="text-[11px] text-emerald-800 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Order fits within your credit limit. Immediate dispatch eligible.
                    </p>
                  )}
                </div>

                {/* Primary Action Button */}
                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={submitting}
                  className="w-full py-3.5 px-4 rounded-xl bg-[#173F35] hover:bg-[#244d3e] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting ? (
                    <span>Submitting to Jabalpur Desk...</span>
                  ) : (
                    <>
                      <span>Confirm & Place Order</span>
                      <ArrowRight className="w-4 h-4 text-[#E9A83B]" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </main>

      <Footer />
    </div>
  );
}
