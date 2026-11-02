import { describe, it, expect } from "vitest";
import { generateTallyCSV } from "@/lib/export/tally";
import { Order } from "@/types";

describe("Tally CSV Export Engine", () => {
  const confirmedOrder: Order = {
    id: "ord-1",
    order_number: "ORD-202611-001",
    retailer_id: "ret-1",
    status: "confirmed",
    subtotal: 81.0,
    scheme_discount_total: 0,
    free_items_total_value: 8.1,
    taxable_amount: 81.0,
    gst_total: 14.58,
    grand_total: 95.58,
    credit_limit_at_order: 75000,
    outstanding_balance_at_order: 14250,
    source: "ai_capture",
    created_at: "2026-11-02T10:00:00Z",
    updated_at: "2026-11-02T10:00:00Z",
    retailer: {
      id: "ret-1",
      profile_id: "p-1",
      store_name: "Mahakaushal Kirana Store",
      owner_name: "Rajesh Sharma",
      phone: "+91 98261 12345",
      address: "Shop 14, Lordganj",
      city: "Jabalpur",
      state: "Madhya Pradesh",
      pincode: "482002",
      gst_number: "23AAAFM1234F1Z5",
      credit_limit: 75000,
      outstanding_balance: 14250,
      is_active: true,
      created_at: "2026-01-01",
      updated_at: "2026-01-01",
    },
    items: [
      {
        id: "item-1",
        order_id: "ord-1",
        product_id: "p111",
        quantity: 10,
        free_quantity: 1,
        unit_price: 8.1,
        discount_percentage: 0,
        discount_amount: 0,
        taxable_amount: 81.0,
        gst_rate: 18.0,
        gst_amount: 14.58,
        line_total: 95.58,
        product: {
          id: "p111",
          sku: "SKU-BS-075",
          name: "Glucose biscuit 75 g",
          category_id: "cat1",
          brand: "Parle-G",
          packaging: "Case of 96",
          pieces_per_case: 96,
          unit: "case",
          dealer_price: 8.1,
          mrp: 10.0,
          stock_cases: 340,
          is_active: true,
          gst_rate: 18.0,
        },
      },
    ],
  };

  const pendingOrder: Order = {
    ...confirmedOrder,
    id: "ord-2",
    order_number: "ORD-202611-002",
    status: "pending_review",
  };

  const onHoldOrder: Order = {
    ...confirmedOrder,
    id: "ord-3",
    order_number: "ORD-202611-003",
    status: "on_hold",
  };

  it("Exports confirmed and processing orders with all required Tally fields", () => {
    const result = generateTallyCSV([confirmedOrder]);

    expect(result.exportedOrdersCount).toBe(1);
    expect(result.totalExportValue).toBe(95.58);

    const lines = result.csvContent.split("\r\n");
    expect(lines).toHaveLength(2); // Header + 1 row

    // Verify header columns
    const header = lines[0];
    expect(header).toContain("Order ID");
    expect(header).toContain("Retailer ID");
    expect(header).toContain("Retailer Name");
    expect(header).toContain("SKU Code");
    expect(header).toContain("Quantity (Cases)");
    expect(header).toContain("Free Quantity");
    expect(header).toContain("Taxable Amount (INR)");
    expect(header).toContain("Total Line Amount (INR)");

    // Verify row content
    const row = lines[1];
    expect(row).toContain("ORD-202611-001");
    expect(row).toContain("Mahakaushal Kirana Store");
    expect(row).toContain("SKU-BS-075");
    expect(row).toContain("10"); // quantity
    expect(row).toContain("1"); // free quantity
    expect(row).toContain("95.58"); // total
  });

  it("Strictly excludes unapproved, pending review, and on-hold orders from CSV export", () => {
    const result = generateTallyCSV([pendingOrder, onHoldOrder]);

    expect(result.exportedOrdersCount).toBe(0);
    expect(result.totalExportValue).toBe(0);
    const lines = result.csvContent.split("\r\n");
    expect(lines).toHaveLength(1); // Only header row
  });
});
