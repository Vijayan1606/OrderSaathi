"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/lib/auth/auth-context";
import { useCart } from "@/lib/cart/cart-context";
import { Product, AIExtractionResponse, AIExtractedLineItem } from "@/types";
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Trash2,
  Edit2,
  BookmarkPlus,
  ShoppingBag,
  Mic,
  MessageSquare,
  RefreshCw,
  Layers,
  ChevronDown,
} from "lucide-react";

export default function AIOrderCapturePage() {
  const router = useRouter();
  const { retailer } = useAuth();
  const { addToCart } = useCart();

  const [inputMessage, setInputMessage] = useState(
    "Bhaiya 5 peti biscuit chhota, 2 peti washing powder 1 kilo, chai patti 250 wala 1 peti"
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState(0);
  const [extractionResult, setExtractionResult] = useState<AIExtractionResponse | null>(null);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [aliasSaveNotice, setAliasSaveNotice] = useState<string | null>(null);

  // Editable lines state
  const [editableLines, setEditableLines] = useState<AIExtractedLineItem[]>([]);

  // Suggested prompt snippets
  const samplePrompts = [
    "Bhaiya 5 peti biscuit chhota, 2 peti washing powder 1 kilo, chai patti 250 wala 1 peti",
    "10 peti glucose biscuit aur 6 peti washing powder",
    "Sarso tel 1 litre 2 peti, 4 peti bathing soap neem",
    "biscuit 10 packet aur 2 peti surf", // triggers ambiguous unit clarification
  ];

  const handleUnderstandOrder = async () => {
    if (!inputMessage.trim()) return;

    setIsProcessing(true);
    setExtractionResult(null);
    setAliasSaveNotice(null);

    // Multi-stage visual feedback simulation
    setProcessingStage(1);
    await new Promise((r) => setTimeout(r, 400));
    setProcessingStage(2);
    await new Promise((r) => setTimeout(r, 400));
    setProcessingStage(3);

    try {
      // Fetch fresh products first for alternative selection
      const prodRes = await fetch("/api/products");
      const prodJson = await prodRes.json();
      if (prodJson.success) {
        setAvailableProducts(prodJson.products);
      }

      const res = await fetch("/api/ai/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: inputMessage,
          retailer_id: retailer?.id,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setExtractionResult(json.data);
        setEditableLines(json.data.items);
      } else {
        alert(json.error || "Failed to process message");
      }
    } catch (err) {
      console.error("AI Order Extraction failed", err);
      alert("Error contacting AI processing service.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateLineQty = (id: string, qty: number) => {
    setEditableLines((prev) =>
      prev.map((line) => (line.id === id ? { ...line, quantity: Math.max(1, qty) } : line))
    );
  };

  const handleUpdateLineUnit = (id: string, unit: "case" | "piece") => {
    setEditableLines((prev) =>
      prev.map((line) =>
        line.id === id
          ? {
              ...line,
              unit,
              requires_unit_clarification: false,
              unit_clarification_message: undefined,
            }
          : line
      )
    );
  };

  const handleUpdateProductMapping = (id: string, productId: string) => {
    const selectedProd = availableProducts.find((p) => p.id === productId);
    if (!selectedProd) return;

    setEditableLines((prev) =>
      prev.map((line) =>
        line.id === id
          ? {
              ...line,
              matched_product_id: selectedProd.id,
              matched_product_name: selectedProd.name,
              sku: selectedProd.sku,
              confidence_level: "high",
              confidence_score: 1.0,
              is_out_of_stock: selectedProd.stock_cases <= 0,
              notes: selectedProd.stock_cases <= 0 ? "Warning: Currently out of stock." : undefined,
            }
          : line
      )
    );
  };

  const handleRemoveLine = (id: string) => {
    setEditableLines((prev) => prev.filter((l) => l.id !== id));
  };

  // Learning from corrections: save custom alias
  const handleSaveAlias = async (rawSegment: string, productId: string) => {
    if (!retailer?.id) return;
    try {
      const res = await fetch("/api/retailer/aliases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          retailer_id: retailer.id,
          alias: rawSegment,
          product_id: productId,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setAliasSaveNotice(json.message);
        setTimeout(() => setAliasSaveNotice(null), 4000);
      }
    } catch (e) {
      console.error("Failed to save alias", e);
    }
  };

  // Confirm and push to shopping cart
  const handleTransferToCart = () => {
    let addedCount = 0;
    for (const line of editableLines) {
      if (!line.matched_product_id) continue;
      const product = availableProducts.find((p) => p.id === line.matched_product_id);
      if (product) {
        addToCart(product, line.quantity);
        addedCount++;
      }
    }

    if (addedCount > 0) {
      router.push("/cart");
    } else {
      alert("Please ensure at least one product is matched before transferring to basket.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F8F3]">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Title Header */}
        <div className="space-y-2 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E5EEE8] text-[#173F35] text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-[#E9A83B]" />
            <span>FMCG Conversational Order Engine</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#173F35] tracking-tight">
            Turn your message into an order.
          </h1>
          <p className="text-sm text-[#7B857E]">
            Send the order the way you normally would. OrderSaathi understands Jabalpur Kirana terms, Hindi, and Hinglish.
          </p>
        </div>

        {/* Input Workspace Card */}
        <div className="bg-white rounded-2xl border border-[#cbded2] shadow-card p-6 sm:p-8 space-y-5">
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-[#173F35]">
              <span className="flex items-center gap-1.5 uppercase tracking-wider">
                <MessageSquare className="w-4 h-4 text-[#E9A83B]" />
                WhatsApp Message / Voice Note Transcript
              </span>
              <span className="text-[#7B857E] font-normal">Hinglish / Hindi / English Supported</span>
            </div>

            <textarea
              rows={4}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="e.g. Bhaiya 5 peti biscuit chhota, 2 peti washing powder 1 kilo..."
              className="w-full p-4 rounded-xl border-2 border-[#E5EEE8] focus:border-[#173F35] bg-[#F8F8F3] focus:bg-white text-base text-[#202923] transition-all font-medium leading-relaxed"
            />
          </div>

          {/* Sample Prompts */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-[#7B857E]">
              Tap a sample Kirana message to test:
            </span>
            <div className="flex flex-wrap gap-2">
              {samplePrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setInputMessage(prompt)}
                  className="text-xs px-3 py-1.5 rounded-lg bg-[#F8F8F3] hover:bg-[#E5EEE8] border border-[#cbded2] text-[#202923] text-left transition-colors"
                >
                  "{prompt}"
                </button>
              ))}
            </div>
          </div>

          {/* Action Button & Processing Stages */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#E5EEE8]">
            <div className="text-xs text-[#7B857E] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Jabalpur Mandi SKU Index Ready</span>
            </div>

            <button
              type="button"
              onClick={handleUnderstandOrder}
              disabled={isProcessing || !inputMessage.trim()}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#173F35] hover:bg-[#244d3e] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2.5 disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-[#E9A83B]" />
                  <span>Processing Stage {processingStage}/3...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#E9A83B]" />
                  <span>Understand My Order</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Alias Saved Toast */}
        {aliasSaveNotice && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{aliasSaveNotice}</span>
          </div>
        )}

        {/* AI REVIEW INTERFACE (Editable Order Review) */}
        {extractionResult && (
          <div className="bg-white rounded-2xl border border-[#cbded2] shadow-card p-6 sm:p-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5EEE8] pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-[#173F35]">
                    AI Extraction Review & Confirmation
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#E5EEE8] text-[#173F35]">
                    {Math.round(extractionResult.overall_confidence * 100)}% Match Confidence
                  </span>
                </div>
                <p className="text-xs text-[#7B857E] mt-1">
                  Human verification required before items can enter your basket. Review quantities and units below.
                </p>
              </div>

              <span className="text-xs text-[#576059] font-medium">
                {editableLines.length} item lines identified
              </span>
            </div>

            {/* Line Items List */}
            <div className="space-y-4">
              {editableLines.map((line) => {
                const isHigh = line.confidence_level === "high";
                const isMedium = line.confidence_level === "medium";
                const isLow = line.confidence_level === "low";

                return (
                  <div
                    key={line.id}
                    className={`p-4 sm:p-5 rounded-xl border transition-all space-y-3 ${
                      line.is_out_of_stock
                        ? "bg-amber-50/50 border-amber-300"
                        : line.requires_unit_clarification
                        ? "bg-blue-50/50 border-blue-300"
                        : "bg-[#F8F8F3] border-[#E5EEE8]"
                    }`}
                  >
                    {/* Top line metadata */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-[#7B857E] italic">Original text:</span>
                          <span className="text-xs font-bold text-[#202923] bg-white px-2 py-0.5 rounded border border-[#cbded2]">
                            "{line.raw_segment}"
                          </span>
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                          <span className="text-sm font-extrabold text-[#173F35]">
                            {line.matched_product_name || "Unmatched Product"}
                          </span>
                          {line.sku && (
                            <span className="text-[11px] font-mono font-bold text-[#7B857E] bg-white px-1.5 py-0.2 rounded border">
                              {line.sku}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Confidence Badge */}
                      <div className="flex items-center gap-2">
                        {isHigh && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            High Confidence ({(line.confidence_score * 100).toFixed(0)}%)
                          </span>
                        )}
                        {isMedium && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-full">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                            Verify Mapping ({(line.confidence_score * 100).toFixed(0)}%)
                          </span>
                        )}
                        {isLow && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-800 bg-rose-100 px-2.5 py-1 rounded-full">
                            <HelpCircle className="w-3.5 h-3.5 text-rose-600" />
                            Manual Match Required
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Ambiguous Unit Alert */}
                    {line.requires_unit_clarification && (
                      <div className="p-3 bg-blue-100/70 border border-blue-200 rounded-lg text-xs space-y-2">
                        <p className="text-blue-900 font-semibold flex items-center gap-1.5">
                          <HelpCircle className="w-4 h-4 text-blue-700" />
                          <span>{line.unit_clarification_message}</span>
                        </p>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleUpdateLineUnit(line.id, "case")}
                            className="px-3 py-1 bg-white border border-blue-300 rounded font-bold text-[#173F35] hover:bg-blue-50"
                          >
                            ✓ Wholesale Cases (Recommended)
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateLineUnit(line.id, "piece")}
                            className="px-3 py-1 bg-white border border-blue-300 rounded font-bold text-[#576059] hover:bg-blue-50"
                          >
                            Individual Pieces
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Out of stock warning */}
                    {line.is_out_of_stock && (
                      <div className="p-2.5 bg-amber-100/80 border border-amber-300 rounded-lg text-xs font-bold text-amber-900 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                        <span>This item is currently out of stock at Jabalpur warehouse. It will be backordered.</span>
                      </div>
                    )}

                    {/* Quantity & SKU Controls */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2 items-center">
                      {/* Quantity input */}
                      <div className="sm:col-span-3 flex items-center gap-2">
                        <label className="text-xs text-[#7B857E] font-medium">Quantity:</label>
                        <input
                          type="number"
                          min={1}
                          value={line.quantity}
                          onChange={(e) =>
                            handleUpdateLineQty(line.id, parseInt(e.target.value, 10) || 1)
                          }
                          className="w-20 px-2 py-1 rounded-lg border border-[#cbded2] bg-white font-bold text-sm text-[#173F35]"
                        />
                        <span className="text-xs text-[#7B857E] font-semibold">{line.unit}s</span>
                      </div>

                      {/* Product Selector / Change Mapping */}
                      <div className="sm:col-span-6">
                        <select
                          value={line.matched_product_id || ""}
                          onChange={(e) => handleUpdateProductMapping(line.id, e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg border border-[#cbded2] bg-white text-xs font-semibold text-[#202923] focus:border-[#173F35]"
                        >
                          <option value="">-- Choose Catalogue SKU --</option>
                          {availableProducts.map((prod) => (
                            <option key={prod.id} value={prod.id}>
                              {prod.sku} — {prod.name} (Stock: {prod.stock_cases})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Save Alias & Remove Line Buttons */}
                      <div className="sm:col-span-3 flex items-center justify-end gap-2">
                        {line.matched_product_id && (
                          <button
                            type="button"
                            onClick={() =>
                              handleSaveAlias(line.raw_segment, line.matched_product_id!)
                            }
                            title="Save this phrase as your custom alias for future orders"
                            className="text-[11px] font-semibold text-[#173F35] hover:text-[#E9A83B] flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-[#cbded2]"
                          >
                            <BookmarkPlus className="w-3.5 h-3.5" />
                            <span>Save Alias</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleRemoveLine(line.id)}
                          className="text-xs text-rose-600 hover:text-rose-700 p-1"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Confirm & Transfer to Basket Action */}
            <div className="pt-4 border-t border-[#E5EEE8] flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-[#576059]">
                💡 <strong>Important:</strong> Confirmed items will be calculated with active Jabalpur promotional schemes in your cart.
              </p>

              <button
                type="button"
                onClick={handleTransferToCart}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#173F35] hover:bg-[#244d3e] text-white font-bold text-sm shadow-md flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4 text-[#E9A83B]" />
                <span>Add Confirmed Lines to Basket</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
