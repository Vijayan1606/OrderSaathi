// OrderSaathi Tally-Compatible CSV Generation Engine
// Formats confirmed distribution orders into a standardized Tally accounting import format

import { Order, OrderItem } from "@/types";

export interface TallyCSVRow {
  "Order ID": string;
  "Order Date": string;
  "Retailer ID": string;
  "Retailer Name": string;
  "Retailer GST": string;
  "SKU Code": string;
  "Product Name": string;
  "Quantity (Cases)": number;
  "Free Quantity": number;
  "Unit Dealer Price": number;
  "Scheme Discount (INR)": number;
  "Taxable Amount (INR)": number;
  "GST Rate (%)": number;
  "GST Amount (INR)": number;
  "Total Line Amount (INR)": number;
}

/**
 * Escapes CSV values with commas, quotes, or newlines
 */
function escapeCSVField(val: string | number | undefined | null): string {
  if (val === undefined || val === null) return "";
  const str = String(val);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Generates Tally CSV string from approved/confirmed orders
 * Enforces business rule: Non-confirmed/unapproved orders cannot be exported!
 */
export function generateTallyCSV(orders: Order[]): {
  csvContent: string;
  exportedOrdersCount: number;
  totalExportValue: number;
} {
  // Business rule: Only confirmed or processing orders are eligible for Tally accounting export
  const eligibleOrders = orders.filter(
    (o) => o.status === "confirmed" || o.status === "processing"
  );

  const headers: (keyof TallyCSVRow)[] = [
    "Order ID",
    "Order Date",
    "Retailer ID",
    "Retailer Name",
    "Retailer GST",
    "SKU Code",
    "Product Name",
    "Quantity (Cases)",
    "Free Quantity",
    "Unit Dealer Price",
    "Scheme Discount (INR)",
    "Taxable Amount (INR)",
    "GST Rate (%)",
    "GST Amount (INR)",
    "Total Line Amount (INR)",
  ];

  const rows: string[] = [headers.join(",")];
  let grandExportTotal = 0;

  for (const order of eligibleOrders) {
    const retailerName = order.retailer?.store_name ?? "Retailer";
    const retailerGst = order.retailer?.gst_number ?? "Unregistered";
    const orderDate = new Date(order.created_at).toISOString().split("T")[0];

    const items = order.items || [];
    for (const item of items) {
      const productName = item.product?.name ?? "FMCG Product";
      const sku = item.product?.sku ?? "SKU";

      const rowData: Record<keyof TallyCSVRow, string | number> = {
        "Order ID": order.order_number,
        "Order Date": orderDate,
        "Retailer ID": order.retailer_id,
        "Retailer Name": retailerName,
        "Retailer GST": retailerGst,
        "SKU Code": sku,
        "Product Name": productName,
        "Quantity (Cases)": item.quantity,
        "Free Quantity": item.free_quantity,
        "Unit Dealer Price": item.unit_price,
        "Scheme Discount (INR)": item.discount_amount,
        "Taxable Amount (INR)": item.taxable_amount,
        "GST Rate (%)": item.gst_rate,
        "GST Amount (INR)": item.gst_amount,
        "Total Line Amount (INR)": item.line_total,
      };

      const lineCsv = headers.map((h) => escapeCSVField(rowData[h])).join(",");
      rows.push(lineCsv);
    }

    grandExportTotal += order.grand_total;
  }

  return {
    csvContent: rows.join("\r\n"),
    exportedOrdersCount: eligibleOrders.length,
    totalExportValue: Math.round(grandExportTotal * 100) / 100,
  };
}
