import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { calculateOrderSchemes } from "@/lib/schemes/engine";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items } = body;

    if (!Array.isArray(items)) {
      return NextResponse.json(
        { success: false, error: "Invalid items payload" },
        { status: 400 }
      );
    }

    const allProducts = await db.getProducts();
    const activeSchemes = await db.getSchemes();

    // Map requested items to genuine catalogue products
    const calculationInput = items
      .map((it: { product_id: string; quantity: number }) => {
        const prod = allProducts.find((p) => p.id === it.product_id);
        if (!prod) return null;
        return {
          product: prod,
          quantity: it.quantity,
        };
      })
      .filter(Boolean) as { product: any; quantity: number }[];

    const result = calculateOrderSchemes(calculationInput, activeSchemes);

    return NextResponse.json({
      success: true,
      calculation: result,
    });
  } catch (error) {
    console.error("Scheme calculation error:", error);
    return NextResponse.json(
      { success: false, error: "Calculation failed" },
      { status: 500 }
    );
  }
}
