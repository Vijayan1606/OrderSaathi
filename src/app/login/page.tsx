"use client";

import React, { Suspense } from "react";
import RetailerLoginPage from "../retailer/login/page";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F8F8F3]">
          <div className="text-sm font-bold text-[#173F35]">Loading OrderSaathi Portal...</div>
        </div>
      }
    >
      <RetailerLoginPage />
    </Suspense>
  );
}
