import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const products = await db.getProducts();
    const schemes = await db.getSchemes();

    return NextResponse.json({
      success: true,
      products,
      schemes,
    });
  } catch (error) {
    console.error("Products API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch product catalogue" },
      { status: 500 }
    );
  }
}
