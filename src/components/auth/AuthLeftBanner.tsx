"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  PackageCheck,
  Gift,
  Truck,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Store,
} from "lucide-react";

export function AuthLeftBanner() {
  return (
    <div className="relative hidden lg:flex flex-col justify-between w-1/2 bg-[#173F35] p-12 text-white overflow-hidden select-none">
      {/* Decorative ambient background accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#244d3e] rounded-full filter blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#0b201a] rounded-full filter blur-2xl opacity-60 translate-y-1/3 -translate-x-1/4" />

      {/* Top: Logo & Distribution Hub Tag */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-[#E9A83B]/30 flex items-center justify-center font-bold text-2xl shadow-lg">
            <span className="text-[#E9A83B]">O</span>S
          </div>
          <div>
            <span className="text-2xl font-extrabold tracking-tight block">
              Order<span className="text-[#E9A83B]">Saathi</span>
            </span>
            <span className="text-[11px] text-[#cbded2] uppercase tracking-wider font-semibold block">
              Smarter Orders. Faster Distribution.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-[#E9A83B] backdrop-blur-md border border-white/10">
          <Store className="w-3.5 h-3.5" />
          <span>Jabalpur Mandi Hub</span>
        </div>
      </div>

      {/* Middle: Value Prop & Floating FMCG Elements */}
      <div className="relative z-10 my-auto py-8 space-y-8 max-w-lg">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-xs font-bold text-white border border-white/15 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#E9A83B]" />
            <span>AI-Powered B2B Distribution Platform</span>
          </div>

          <h1 className="text-4xl xl:text-5xl font-extrabold leading-tight tracking-tight text-white">
            Your daily orders,{" "}
            <span className="text-[#E9A83B] italic">made effortless.</span>
          </h1>

          <p className="text-base text-[#cbded2] leading-relaxed">
            Discover products, unlock distributor schemes and place your orders in seconds. Direct wholesale pricing for 1,800+ kirana shops across Jabalpur.
          </p>
        </div>

        {/* Animated Floating FMCG Cards */}
        <div className="relative h-64 w-full">
          {/* Floating Element 1: Glucose Biscuit Scheme Card */}
          <motion.div
            animate={{
              y: [0, -10, 0],
              rotate: [0, 1, 0],
            }}
            transition={{
              duration: 4.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute top-2 left-4 w-72 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 shadow-xl space-y-2"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono text-[#E9A83B] font-bold">SKU-BS-075</span>
              <span className="bg-[#E9A83B] text-[#202923] text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                <Gift className="w-3 h-3" />
                Buy 10 + 1 Free
              </span>
            </div>
            <p className="font-bold text-sm text-white">Glucose biscuit 75 g (Case of 96)</p>
            <div className="flex justify-between items-baseline text-xs text-[#cbded2]">
              <span>Dealer Price: ₹8.10/case</span>
              <span className="text-emerald-400 font-bold">Stock: 340 cases</span>
            </div>
          </motion.div>

          {/* Floating Element 2: Detergent Slab Discount Card */}
          <motion.div
            animate={{
              y: [0, 12, 0],
              rotate: [0, -1.5, 0],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.8,
            }}
            className="absolute bottom-2 right-2 w-72 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 shadow-xl space-y-2"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono text-[#E9A83B] font-bold">SKU-DT-1KG</span>
              <span className="bg-emerald-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                3% Slab Off
              </span>
            </div>
            <p className="font-bold text-sm text-white">Detergent powder 1 kg (Case of 20)</p>
            <div className="flex justify-between items-baseline text-xs text-[#cbded2]">
              <span>Dealer Price: ₹101.50</span>
              <span className="text-emerald-300 font-bold">In Stock</span>
            </div>
          </motion.div>

          {/* Floating Element 3: Dispatch & AI Notice */}
          <motion.div
            animate={{
              scale: [1, 1.02, 1],
            }}
            transition={{
              duration: 3.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1.5,
            }}
            className="absolute top-28 left-20 bg-[#0b201a]/80 backdrop-blur-md px-4 py-2.5 rounded-xl border border-[#E9A83B]/40 shadow-lg flex items-center gap-3 text-xs"
          >
            <Truck className="w-4 h-4 text-[#E9A83B]" />
            <div>
              <p className="font-bold text-white">Daily 6 PM Dispatch Route</p>
              <p className="text-[10px] text-[#cbded2]">Lordganj & Wright Town beat</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom: Distributor Trust Credentials */}
      <div className="relative z-10 pt-6 border-t border-white/10 flex items-center justify-between text-xs text-[#cbded2]">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#E9A83B]" />
          <span>FMCG Distribution Network • Jabalpur, MP</span>
        </div>
        <span>Tally ERP Integrated</span>
      </div>
    </div>
  );
}
