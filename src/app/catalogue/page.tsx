"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useCart } from "@/lib/cart/cart-context";
import { Product, Scheme } from "@/types";
import {
  Search,
  Filter,
  ShoppingBag,
  Gift,
  Check,
  AlertTriangle,
  Plus,
  Minus,
  Sparkles,
  Info,
  PackageCheck,
  PackageX,
} from "lucide-react";

export default function CataloguePage() {
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [stockFilter, setStockFilter] = useState<"all" | "in_stock" | "out_of_stock">("all");
  const [schemeOnly, setSchemeOnly] = useState(false);

  // Quantities per product card
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [addedAlert, setAddedAlert] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCatalogue() {
      try {
        const res = await fetch("/api/products");
        const json = await res.json();
        if (json.success) {
          setProducts(json.products);
          setSchemes(json.schemes);

          // default quantity map to 1 for all items
          const initialQ: Record<string, number> = {};
          json.products.forEach((p: Product) => {
            initialQ[p.id] = 1;
          });
          setQuantities(initialQ);
        }
      } catch (err) {
        console.error("Failed to load products", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCatalogue();
  }, []);

  const handleQtyChange = (productId: string, delta: number, maxStock: number) => {
    setQuantities((prev) => {
      const current = prev[productId] || 1;
      const updated = Math.max(1, Math.min(maxStock, current + delta));
      return { ...prev, [productId]: updated };
    });
  };

  const handleAddToCart = (product: Product) => {
    const qty = quantities[product.id] || 1;
    addToCart(product, qty);
    setAddedAlert(`${qty} case(s) of ${product.name} added to cart`);
    setTimeout(() => setAddedAlert(null), 3000);
  };

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStock =
        stockFilter === "all"
          ? true
          : stockFilter === "in_stock"
          ? p.stock_cases > 0
          : p.stock_cases <= 0;

      const matchesScheme = schemeOnly ? !!p.active_scheme : true;

      return matchesSearch && matchesStock && matchesScheme;
    });
  }, [products, searchQuery, stockFilter, schemeOnly]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F8F3]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Added to cart toast */}
        {addedAlert && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#173F35] text-white px-5 py-3 rounded-xl shadow-float flex items-center gap-3 border border-[#E9A83B] animate-in fade-in slide-in-from-bottom-4 duration-300">
            <Check className="w-5 h-5 text-[#E9A83B]" />
            <span className="text-sm font-semibold">{addedAlert}</span>
          </div>
        )}

        {/* Header & Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5EEE8] pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#173F35] tracking-tight">
              Distributor Product Catalogue
            </h1>
            <p className="text-sm text-[#7B857E] mt-1">
              Live Jabalpur warehouse stock, dealer trade pricing, and active FMCG bulk schemes.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs bg-[#E5EEE8] text-[#173F35] px-3 py-1.5 rounded-lg font-bold">
              {filteredProducts.length} Products Found
            </span>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E5EEE8] shadow-subtle space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* Search Input */}
            <div className="md:col-span-6 relative">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-[#7B857E]" />
              <input
                type="text"
                placeholder="Search by product name, brand, or SKU (e.g. SKU-BS-075, biscuit)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#cbded2] bg-[#F8F8F3] text-sm focus:bg-white focus:border-[#173F35] transition-all"
              />
            </div>

            {/* Stock Availability Filter */}
            <div className="md:col-span-3">
              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#cbded2] bg-[#F8F8F3] text-sm font-medium text-[#202923] focus:bg-white focus:border-[#173F35]"
              >
                <option value="all">Stock: All Products</option>
                <option value="in_stock">In Stock Only (Ready for Dispatch)</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
            </div>

            {/* Schemes Filter Toggle */}
            <div className="md:col-span-3 flex items-center">
              <label className="flex items-center gap-2.5 px-3 py-2 rounded-xl border border-[#cbded2] bg-[#F8F8F3] hover:bg-[#E5EEE8] cursor-pointer w-full text-sm font-semibold text-[#173F35] transition-colors">
                <input
                  type="checkbox"
                  checked={schemeOnly}
                  onChange={(e) => setSchemeOnly(e.target.checked)}
                  className="rounded text-[#173F35] focus:ring-[#173F35] w-4 h-4"
                />
                <Gift className="w-4 h-4 text-[#E9A83B]" />
                <span>Active Schemes Only</span>
              </label>
            </div>
          </div>
        </div>

        {/* Product Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 border border-[#E5EEE8] animate-pulse space-y-4"
              >
                <div className="h-4 bg-gray-200 rounded w-1/3" />
                <div className="h-6 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
                <div className="h-10 bg-gray-200 rounded mt-4" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-[#E5EEE8] space-y-3">
            <PackageX className="w-12 h-12 text-[#7B857E] mx-auto" />
            <h3 className="text-lg font-bold text-[#202923]">No Products Matched Your Filter</h3>
            <p className="text-sm text-[#7B857E] max-w-md mx-auto">
              Try clearing your search query or enabling "All Products" to browse the entire catalogue.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setStockFilter("all");
                setSchemeOnly(false);
              }}
              className="px-4 py-2 rounded-xl bg-[#173F35] text-white text-xs font-bold"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => {
              const isOutOfStock = product.stock_cases <= 0;
              const selectedQty = quantities[product.id] || 1;

              return (
                <div
                  key={product.id}
                  className={`bg-white rounded-2xl border p-6 shadow-card flex flex-col justify-between transition-all ${
                    isOutOfStock
                      ? "border-amber-200 bg-[#fffdfa]"
                      : "border-[#E5EEE8] hover:border-[#173F35]/40 hover:shadow-float"
                  }`}
                >
                  <div className="space-y-4">
                    {/* Top Row: SKU & Scheme Tag */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <span className="inline-block px-2 py-0.5 rounded bg-[#F8F8F3] text-[11px] font-mono font-bold text-[#7B857E] border border-[#E5EEE8]">
                          {product.sku}
                        </span>
                        <p className="text-xs font-semibold text-[#576059]">{product.brand}</p>
                      </div>

                      {product.active_scheme ? (
                        <div className="flex items-center gap-1 bg-[#fef9ee] text-[#ca7f1f] border border-[#fbe0aa] text-[11px] font-bold px-2.5 py-1 rounded-full shadow-subtle">
                          <Gift className="w-3.5 h-3.5" />
                          <span>
                            {product.active_scheme.scheme_type === "buy_x_get_y"
                              ? `Buy ${product.active_scheme.min_quantity} + 1 Free`
                              : `${product.active_scheme.discount_percentage}% Slab Off`}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-[#7B857E] italic">Standard Scheme</span>
                      )}
                    </div>

                    {/* Product Name & Description */}
                    <div>
                      <h3 className="font-bold text-lg text-[#173F35] leading-snug">
                        {product.name}
                      </h3>
                      <p className="text-xs text-[#576059] mt-1 leading-relaxed">
                        {product.description || "Standard wholesale FMCG packaging."}
                      </p>
                    </div>

                    {/* Packaging Info & Tax status */}
                    <div className="p-3 rounded-xl bg-[#F8F8F3] border border-[#E5EEE8] space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-[#7B857E]">Packaging:</span>
                        <span className="font-bold text-[#202923]">{product.packaging}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#7B857E]">Pieces / Case:</span>
                        <span className="font-semibold text-[#202923]">{product.pieces_per_case} pcs</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#7B857E]">GST Category:</span>
                        <span className="font-semibold text-emerald-800">
                          {product.gst_rate}% (Tax Exclusive)
                        </span>
                      </div>
                    </div>

                    {/* Pricing Display */}
                    <div className="pt-2 border-t border-[#E5EEE8]">
                      <div className="flex items-baseline justify-between">
                        <div>
                          <p className="text-[11px] text-[#7B857E] font-medium">Retailer Dealer Price</p>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-2xl font-extrabold text-[#173F35]">
                              ₹{product.dealer_price.toFixed(2)}
                            </span>
                            <span className="text-xs text-[#7B857E]">/ case</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-[11px] text-[#7B857E]">Suggested MRP</p>
                          <p className="text-sm font-semibold text-[#7B857E] line-through">
                            ₹{product.mrp.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Stock Indicator */}
                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-[#7B857E]">Jabalpur Warehouse:</span>
                      {isOutOfStock ? (
                        <span className="inline-flex items-center gap-1 font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Out of Stock (0 cases)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          <PackageCheck className="w-3.5 h-3.5" />
                          {product.stock_cases} cases available
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quantity Selector & Add to Cart Action */}
                  <div className="mt-6 pt-4 border-t border-[#E5EEE8] space-y-3">
                    {!isOutOfStock ? (
                      <div className="flex items-center gap-3">
                        {/* Stepper */}
                        <div className="flex items-center border border-[#cbded2] rounded-xl bg-[#F8F8F3] p-1">
                          <button
                            type="button"
                            onClick={() => handleQtyChange(product.id, -1, product.stock_cases)}
                            disabled={selectedQty <= 1}
                            className="p-1.5 rounded-lg text-[#173F35] hover:bg-white disabled:opacity-40 transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-10 text-center font-bold text-sm text-[#173F35]">
                            {selectedQty}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleQtyChange(product.id, 1, product.stock_cases)}
                            disabled={selectedQty >= product.stock_cases}
                            className="p-1.5 rounded-lg text-[#173F35] hover:bg-white disabled:opacity-40 transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Add Button */}
                        <button
                          type="button"
                          onClick={() => handleAddToCart(product)}
                          className="flex-1 py-2.5 px-4 rounded-xl bg-[#173F35] hover:bg-[#244d3e] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all transform active:scale-95"
                        >
                          <ShoppingBag className="w-4 h-4 text-[#E9A83B]" />
                          <span>Add {selectedQty} {selectedQty > 1 ? "Cases" : "Case"}</span>
                        </button>
                      </div>
                    ) : (
                      <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-center">
                        <p className="text-xs font-semibold text-amber-800">
                          Unavailable for ordering. Next replenishment expected next Monday.
                        </p>
                      </div>
                    )}
                  </div>
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
