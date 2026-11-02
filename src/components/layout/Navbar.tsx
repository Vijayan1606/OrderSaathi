"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { useCart } from "@/lib/cart/cart-context";
import {
  ShoppingBag,
  Sparkles,
  Layers,
  FileSpreadsheet,
  Clock,
  ShieldCheck,
  Store,
  ChevronDown,
  User,
  Menu,
  X,
  CreditCard,
  Building2,
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const { role, switchRole, profile, retailer } = useAuth();
  const { itemCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  const isRetailer = role === "retailer";

  interface NavLinkItem {
    href: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }

  const retailerLinks: NavLinkItem[] = [
    { href: "/", label: "Dashboard", icon: Layers },
    { href: "/catalogue", label: "Catalogue", icon: ShoppingBag },
    { href: "/ai-order", label: "AI Order Capture", icon: Sparkles, badge: "AI" },
    { href: "/orders", label: "My Orders", icon: Clock },
  ];

  const orderDeskLinks: NavLinkItem[] = [
    { href: "/order-desk", label: "Operations Desk", icon: Layers },
    { href: "/order-desk/orders", label: "Review Orders", icon: ShieldCheck },
    { href: "/order-desk/export", label: "Tally CSV Export", icon: FileSpreadsheet },
  ];

  const navLinks = isRetailer ? retailerLinks : orderDeskLinks;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#E5EEE8] bg-[#FFFFFF]/95 backdrop-blur supports-[backdrop-filter]:bg-[#FFFFFF]/80">
      {/* Top Banner: Jabalpur Distribution Network & Role Switcher */}
      <div className="bg-[#173F35] text-white text-xs px-4 py-1.5 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Building2 className="w-3.5 h-3.5 text-[#E9A83B]" />
          <span>
            <strong>Jabalpur Distribution Hub</strong> • 1,800+ Kirana Shops Connected • Live FMCG Dispatch
          </span>
        </div>

        {/* Quick Role Toggle Bar for Reviewers & Users */}
        <div className="flex items-center gap-2">
          <span className="text-[#cbded2] hidden sm:inline">Active Mode:</span>
          <div className="inline-flex rounded-md bg-[#244d3e] p-0.5 border border-[#487d65]">
            <button
              onClick={() => switchRole("retailer")}
              className={`px-2.5 py-0.5 rounded text-xs font-semibold transition-all ${
                isRetailer
                  ? "bg-[#E9A83B] text-[#202923] shadow-sm"
                  : "text-white/80 hover:text-white"
              }`}
            >
              Retailer View
            </button>
            <button
              onClick={() => switchRole("order_desk")}
              className={`px-2.5 py-0.5 rounded text-xs font-semibold transition-all ${
                !isRetailer
                  ? "bg-[#E9A83B] text-[#202923] shadow-sm"
                  : "text-white/80 hover:text-white"
              }`}
            >
              Order Desk View
            </button>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Tagline */}
          <div className="flex items-center gap-8">
            <Link href={isRetailer ? "/" : "/order-desk"} className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#173F35] flex items-center justify-center text-white font-bold text-xl shadow-md border border-[#E9A83B]/30">
                <span className="text-[#E9A83B]">O</span>S
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight text-[#173F35]">
                  Order<span className="text-[#E9A83B]">Saathi</span>
                </span>
                <span className="text-[10px] text-[#7B857E] uppercase tracking-wider font-semibold">
                  Smarter Orders. Faster Distribution.
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                      isActive
                        ? "bg-[#E5EEE8] text-[#173F35]"
                        : "text-[#576059] hover:bg-[#F8F8F3] hover:text-[#173F35]"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{link.label}</span>
                    {link.badge && (
                      <span className="bg-[#E9A83B] text-[#202923] text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider animate-pulse">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Section: Shop info, Cart, Account */}
          <div className="flex items-center gap-3">
            {isRetailer && retailer && (
              <div className="hidden lg:flex flex-col items-end mr-2 text-right">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#173F35]">
                  <Store className="w-3.5 h-3.5 text-[#E9A83B]" />
                  <span>{retailer.store_name}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-[#7B857E]">
                  <span>Credit Limit: ₹{retailer.credit_limit.toLocaleString("en-IN")}</span>
                  <span>•</span>
                  <span className="text-emerald-700 font-semibold">
                    Avail: ₹{(retailer.credit_limit - retailer.outstanding_balance).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            )}

            {!isRetailer && (
              <div className="hidden lg:flex items-center gap-2 bg-[#E5EEE8] px-3 py-1.5 rounded-lg text-xs font-semibold text-[#173F35]">
                <ShieldCheck className="w-4 h-4 text-[#173F35]" />
                <span>Desk Agent: Vikram Patel</span>
              </div>
            )}

            {/* Shopping Cart button (for Retailer) */}
            {isRetailer && (
              <Link
                href="/cart"
                className="relative inline-flex items-center justify-center p-2 rounded-xl bg-[#E5EEE8] hover:bg-[#c2d9cb] text-[#173F35] transition-colors"
                aria-label="View Cart"
              >
                <ShoppingBag className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-[#E9A83B] text-[#202923] text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                    {itemCount}
                  </span>
                )}
              </Link>
            )}

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-[#202923] hover:bg-[#F8F8F3]"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E5EEE8] bg-white px-4 pt-2 pb-4 space-y-1">
          {isRetailer && retailer && (
            <div className="p-3 bg-[#F8F8F3] rounded-lg mb-2">
              <p className="font-bold text-sm text-[#173F35]">{retailer.store_name}</p>
              <p className="text-xs text-[#7B857E]">{retailer.address}, Jabalpur</p>
              <div className="mt-2 text-xs flex justify-between font-semibold">
                <span>Credit Avail: ₹{(retailer.credit_limit - retailer.outstanding_balance).toLocaleString("en-IN")}</span>
                <span className="text-[#E9A83B]">Limit: ₹{retailer.credit_limit.toLocaleString("en-IN")}</span>
              </div>
            </div>
          )}

          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold ${
                  isActive
                    ? "bg-[#E5EEE8] text-[#173F35]"
                    : "text-[#576059] hover:bg-[#F8F8F3]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </div>
                {link.badge && (
                  <span className="bg-[#E9A83B] text-[#202923] text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
