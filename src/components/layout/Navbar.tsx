"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  LogOut,
  Menu,
  X,
  CreditCard,
  Building2,
  FileText,
  Settings,
  ShieldAlert,
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { role, profile, retailer, logout, isAuthenticated } = useAuth();
  const { itemCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isRetailer = role === "retailer";
  const isDesk = role === "order_desk";

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  interface NavLinkItem {
    href: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }

  const retailerLinks: NavLinkItem[] = [
    { href: "/retailer/dashboard", label: "Dashboard", icon: Layers },
    { href: "/retailer/catalogue", label: "Catalogue", icon: ShoppingBag },
    { href: "/retailer/ai-order", label: "AI Order Capture", icon: Sparkles, badge: "AI" },
    { href: "/retailer/orders", label: "My Orders", icon: Clock },
  ];

  const orderDeskLinks: NavLinkItem[] = [
    { href: "/desk/dashboard", label: "Operations Desk", icon: Layers },
    { href: "/desk/orders", label: "Review Orders", icon: ShieldCheck },
    { href: "/desk/exports", label: "Tally CSV Export", icon: FileSpreadsheet },
    { href: "/desk/audit-logs", label: "Audit Logs", icon: FileText },
  ];

  const navLinks = isRetailer ? retailerLinks : isDesk ? orderDeskLinks : [];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#E5EEE8] bg-[#FFFFFF]/95 backdrop-blur supports-[backdrop-filter]:bg-[#FFFFFF]/80">
      {/* Top Banner: Authenticated Hub Status */}
      <div className="bg-[#173F35] text-white text-xs px-4 py-1.5 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Building2 className="w-3.5 h-3.5 text-[#E9A83B]" />
          <span>
            <strong>Jabalpur Distribution Hub</strong> • 1,800+ Kirana Shops Connected • Live FMCG Dispatch
          </span>
        </div>

        {/* User Session Info / Role Badge */}
        {isAuthenticated && profile ? (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#cbded2] hidden sm:inline">Signed in as:</span>
            <span className="font-bold text-[#E9A83B]">{profile.full_name}</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-white/10 text-white border border-white/20">
              {role === "order_desk" ? "Order Desk" : "Retailer"}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs">
            <Link
              href="/retailer/login"
              className="text-[#E9A83B] hover:text-white font-semibold transition-colors"
            >
              Retailer Login
            </Link>
            <span>•</span>
            <Link
              href="/desk/login"
              className="text-[#cbded2] hover:text-white font-semibold transition-colors"
            >
              Desk Sign In
            </Link>
          </div>
        )}
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <Link
              href={isRetailer ? "/retailer/dashboard" : isDesk ? "/desk/dashboard" : "/login"}
              className="flex items-center gap-2.5"
            >
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

          {/* Right Section: Shop info, Cart, Account Profile Dropdown */}
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

            {isDesk && (
              <div className="hidden lg:flex items-center gap-2 bg-[#E5EEE8] px-3 py-1.5 rounded-lg text-xs font-semibold text-[#173F35]">
                <ShieldCheck className="w-4 h-4 text-[#173F35]" />
                <span>Desk Agent: {profile?.full_name || "Vikram Patel"}</span>
              </div>
            )}

            {/* Shopping Cart button (for Retailer) */}
            {isRetailer && (
              <Link
                href="/retailer/cart"
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

            {/* Authenticated User Profile Menu Dropdown */}
            {isAuthenticated && profile ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-2 rounded-xl border border-[#cbded2] bg-[#F8F8F3] hover:bg-[#E5EEE8] transition-colors text-xs font-bold text-[#173F35]"
                >
                  <div className="w-7 h-7 rounded-lg bg-[#173F35] text-white flex items-center justify-center font-bold text-xs">
                    {profile.full_name.charAt(0)}
                  </div>
                  <span className="hidden sm:inline">{profile.full_name}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#7B857E]" />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl border border-[#cbded2] shadow-float p-3 space-y-2 z-50 animate-in fade-in zoom-in-95">
                    {/* User Profile Header */}
                    <div className="p-3 bg-[#F8F8F3] rounded-xl space-y-1">
                      <p className="font-bold text-sm text-[#173F35]">{profile.full_name}</p>
                      <p className="text-xs text-[#7B857E]">{profile.email}</p>
                      <div className="pt-1 flex items-center justify-between">
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-[#173F35] text-[#E9A83B]">
                          {profile.role.replace("_", " ")}
                        </span>
                        {retailer && (
                          <span className="text-[11px] font-semibold text-emerald-800">
                            Credit: ₹{(retailer.credit_limit - retailer.outstanding_balance).toLocaleString("en-IN")}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Account Links */}
                    <div className="space-y-1 text-xs">
                      {isRetailer ? (
                        <>
                          <Link
                            href="/retailer/profile"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg font-semibold text-[#576059] hover:bg-[#F8F8F3] hover:text-[#173F35]"
                          >
                            <Store className="w-4 h-4 text-[#E9A83B]" />
                            <span>Kirana Profile & Credit Limit</span>
                          </Link>
                          <Link
                            href="/retailer/orders"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg font-semibold text-[#576059] hover:bg-[#F8F8F3] hover:text-[#173F35]"
                          >
                            <Clock className="w-4 h-4 text-[#173F35]" />
                            <span>My Order History</span>
                          </Link>
                        </>
                      ) : (
                        <>
                          <Link
                            href="/desk/audit-logs"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg font-semibold text-[#576059] hover:bg-[#F8F8F3] hover:text-[#173F35]"
                          >
                            <FileText className="w-4 h-4 text-[#E9A83B]" />
                            <span>Security & Audit Trail</span>
                          </Link>
                          <Link
                            href="/desk/settings"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg font-semibold text-[#576059] hover:bg-[#F8F8F3] hover:text-[#173F35]"
                          >
                            <Settings className="w-4 h-4 text-[#173F35]" />
                            <span>Desk Configuration</span>
                          </Link>
                        </>
                      )}
                    </div>

                    {/* Logout Button */}
                    <div className="pt-2 border-t border-[#E5EEE8]">
                      <button
                        type="button"
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg font-bold text-xs text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out (End Session)</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 rounded-xl bg-[#173F35] text-white text-xs font-bold hover:bg-[#244d3e] transition-colors"
              >
                Sign In
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

          {isAuthenticated && (
            <div className="pt-2 border-t border-[#E5EEE8]">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-rose-600 font-bold text-xs"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
