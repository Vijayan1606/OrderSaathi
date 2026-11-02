import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const history = await db.getExportHistory();
    return NextResponse.json({ success: true, history });
  } catch (error) {
    console.error("GET export history error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch export history" },
      { status: 500 }
    );
  }
}
