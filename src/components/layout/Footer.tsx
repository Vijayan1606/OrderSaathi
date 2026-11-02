import React from "react";
import Link from "next/link";
import { Building2, Phone, Mail, MapPin, ShieldCheck } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-[#E5EEE8] bg-[#FFFFFF] text-[#202923] text-sm mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#173F35] flex items-center justify-center text-white font-bold text-base">
                <span className="text-[#E9A83B]">O</span>S
              </div>
              <span className="text-lg font-bold text-[#173F35]">OrderSaathi</span>
            </div>
            <p className="text-xs text-[#7B857E] leading-relaxed">
              Unified B2B FMCG distribution ordering platform empowering 1,800+ kirana stores across Jabalpur and Mahakaushal region with instant orders, dealer pricing, and AI order capture.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-semibold">
              <ShieldCheck className="w-4 h-4 text-[#173F35]" />
              <span>Jabalpur FMCG Hub Certified</span>
            </div>
          </div>

          {/* Quick Retailer Links */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-[#173F35] mb-3">
              Retailer Services
            </h4>
            <ul className="space-y-2 text-xs text-[#576059]">
              <li>
                <Link href="/catalogue" className="hover:text-[#173F35]">
                  Live Wholesale Catalogue
                </Link>
              </li>
              <li>
                <Link href="/ai-order" className="hover:text-[#173F35]">
                  AI Natural Order Capture
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-[#173F35]">
                  Active Scheme Cart
                </Link>
              </li>
              <li>
                <Link href="/orders" className="hover:text-[#173F35]">
                  Order History & Re-orders
                </Link>
              </li>
            </ul>
          </div>

          {/* Operations Hub */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-[#173F35] mb-3">
              Distribution Operations
            </h4>
            <ul className="space-y-2 text-xs text-[#576059]">
              <li>
                <Link href="/order-desk" className="hover:text-[#173F35]">
                  Order Desk Control Room
                </Link>
              </li>
              <li>
                <Link href="/order-desk/orders" className="hover:text-[#173F35]">
                  Review & Credit Hold Queue
                </Link>
              </li>
              <li>
                <Link href="/order-desk/export" className="hover:text-[#173F35]">
                  Tally CSV Export Center
                </Link>
              </li>
            </ul>
          </div>

          {/* Distributor Contact */}
          <div className="space-y-2 text-xs text-[#576059]">
            <h4 className="font-bold uppercase tracking-wider text-[#173F35] mb-3">
              Jabalpur Head Office
            </h4>
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-[#E9A83B] shrink-0 mt-0.5" />
              <span>Lordganj Wholesale Mandi, Near Supermarket, Jabalpur, MP 482002</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#E9A83B] shrink-0" />
              <span>+91 761 240 5500 / +91 98261 12345</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#E9A83B] shrink-0" />
              <span>dispatch@ordersaathi.in</span>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-[#E5EEE8] flex flex-col sm:flex-row justify-between items-center text-xs text-[#7B857E] gap-2">
          <p>© 2026 OrderSaathi Distribution Systems. All rights reserved.</p>
          <p>Tally is a registered trademark of Tally Solutions Pvt. Ltd. OrderSaathi exports standard compatible CSV formats.</p>
        </div>
      </div>
    </footer>
  );
}
