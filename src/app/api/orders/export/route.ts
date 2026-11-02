import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateTallyCSV } from "@/lib/export/tally";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("start_date");
    const endDate = searchParams.get("end_date");

    let allOrders = await db.getOrders();

    if (startDate) {
      allOrders = allOrders.filter(
        (o) => new Date(o.created_at) >= new Date(startDate)
      );
    }
    if (endDate) {
      allOrders = allOrders.filter(
        (o) => new Date(o.created_at) <= new Date(`${endDate}T23:59:59Z`)
      );
    }

    const { csvContent, exportedOrdersCount, totalExportValue } =
      generateTallyCSV(allOrders);

    const fileName = `OrderSaathi_Tally_Export_${new Date().toISOString().split("T")[0]}.csv`;

    // Record export event in database history
    if (exportedOrdersCount > 0) {
      await db.recordExport({
        file_name: fileName,
        exported_by_name: "Vikram Patel (Order Desk)",
        order_count: exportedOrdersCount,
        total_value: totalExportValue,
      });
    }

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error("Export API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate CSV export" },
      { status: 500 }
    );
  }
}
