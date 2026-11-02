import { describe, it, expect } from "vitest";
import { calculateOrderSchemes, roundToTwo, isSchemeValid } from "@/lib/schemes/engine";
import { Product, Scheme } from "@/types";

describe("Promotional Scheme Engine", () => {
  // Test products matching the brief
  const glucoseBiscuit: Product = {
    id: "p111",
    sku: "SKU-BS-075",
    name: "Glucose biscuit 75 g",
    category_id: "cat1",
    brand: "Parle-G / Shakti",
    packaging: "Case of 96",
    pieces_per_case: 96,
    unit: "case",
    dealer_price: 8.1,
    mrp: 10.0,
    stock_cases: 340,
    is_active: true,
    gst_rate: 18.0,
  };

  const detergentPowder: Product = {
    id: "p222",
    sku: "SKU-DT-1KG",
    name: "Detergent powder 1 kg",
    category_id: "cat2",
    brand: "Safed Shine",
    packaging: "Case of 20",
    pieces_per_case: 20,
    unit: "case",
    dealer_price: 101.5,
    mrp: 125.0,
    stock_cases: 85,
    is_active: true,
    gst_rate: 18.0,
  };

  const teaLeaf: Product = {
    id: "p333",
    sku: "SKU-TE-250",
    name: "Tea leaf 250 g",
    category_id: "cat3",
    brand: "Taj Mahal",
    packaging: "Case of 40",
    pieces_per_case: 40,
    unit: "case",
    dealer_price: 118.0,
    mrp: 145.0,
    stock_cases: 0, // out of stock
    is_active: true,
    gst_rate: 5.0,
  };

  // Test schemes
  const buy10Get1FreeScheme: Scheme = {
    id: "s111",
    name: "Buy 10 Cases Get 1 Free",
    description: "Buy 10 cases of glucose biscuits and receive 1 free case",
    scheme_type: "buy_x_get_y",
    eligible_product_ids: ["p111"],
    min_quantity: 10,
    free_quantity: 1,
    discount_percentage: 0,
    start_date: "2026-01-01",
    end_date: "2026-12-31",
    is_active: true,
  };

  const slab3PercentScheme: Scheme = {
    id: "s222",
    name: "3% Off 5+ Cases",
    description: "Buy 5 or more detergent cases and receive a 3% discount",
    scheme_type: "slab_discount",
    eligible_product_ids: ["p222"],
    min_quantity: 5,
    free_quantity: 0,
    discount_percentage: 3.0,
    start_date: "2026-01-01",
    end_date: "2026-12-31",
    is_active: true,
  };

  it("Buy 10 biscuit cases earns exactly 1 free case and free item is not charged", () => {
    const result = calculateOrderSchemes(
      [{ product: glucoseBiscuit, quantity: 10 }],
      [buy10Get1FreeScheme],
      new Date("2026-06-01")
    );

    expect(result.items).toHaveLength(1);
    const item = result.items[0];

    // 10 cases * 8.10 = 81.00 base amount
    expect(item.base_amount).toBe(81.0);
    expect(item.free_quantity).toBe(1);
    expect(item.discount_amount).toBe(0);

    // Free item value is tracked: 1 * 8.10 = 8.10
    expect(item.free_item_value).toBe(8.1);

    // Taxable amount is 81.00 (NOT 81 + 8.10!)
    expect(item.taxable_amount).toBe(81.0);
    // GST @ 18% on 81.00 is 14.58
    expect(item.gst_amount).toBe(14.58);
    // Line total = 81.00 + 14.58 = 95.58
    expect(item.line_total).toBe(95.58);
    expect(result.grand_total).toBe(95.58);
    expect(result.total_free_items_count).toBe(1);
  });

  it("Buy 20 biscuit cases earns exactly 2 free cases", () => {
    const result = calculateOrderSchemes(
      [{ product: glucoseBiscuit, quantity: 20 }],
      [buy10Get1FreeScheme],
      new Date("2026-06-01")
    );

    const item = result.items[0];
    expect(item.free_quantity).toBe(2);
    expect(item.base_amount).toBe(162.0);
    expect(item.free_item_value).toBe(16.2);
    expect(result.total_free_items_count).toBe(2);
  });

  it("Buy 9 biscuit cases earns 0 free cases", () => {
    const result = calculateOrderSchemes(
      [{ product: glucoseBiscuit, quantity: 9 }],
      [buy10Get1FreeScheme],
      new Date("2026-06-01")
    );

    const item = result.items[0];
    expect(item.free_quantity).toBe(0);
    expect(result.total_free_items_count).toBe(0);
    expect(item.base_amount).toBe(72.9);
  });

  it("Buy 5 detergent cases applies 3% slab discount correctly", () => {
    const result = calculateOrderSchemes(
      [{ product: detergentPowder, quantity: 5 }],
      [slab3PercentScheme],
      new Date("2026-06-01")
    );

    const item = result.items[0];
    // Base amount: 5 * 101.50 = 507.50
    expect(item.base_amount).toBe(507.5);
    // 3% discount on 507.50 = 15.225 -> rounded to 15.23
    expect(item.discount_percentage).toBe(3.0);
    expect(item.discount_amount).toBe(15.23);
    // Taxable amount: 507.50 - 15.23 = 492.27
    expect(item.taxable_amount).toBe(492.27);
    // GST @ 18% on 492.27 = 88.6086 -> 88.61
    expect(item.gst_amount).toBe(88.61);
    // Line total: 492.27 + 88.61 = 580.88
    expect(item.line_total).toBe(580.88);
    expect(result.grand_total).toBe(580.88);
  });

  it("Buy 4 detergent cases does not receive slab discount", () => {
    const result = calculateOrderSchemes(
      [{ product: detergentPowder, quantity: 4 }],
      [slab3PercentScheme],
      new Date("2026-06-01")
    );

    const item = result.items[0];
    expect(item.discount_percentage).toBe(0);
    expect(item.discount_amount).toBe(0);
    expect(item.base_amount).toBe(406.0);
  });

  it("Expired scheme is not applied", () => {
    const expiredScheme: Scheme = {
      ...buy10Get1FreeScheme,
      start_date: "2025-01-01",
      end_date: "2025-06-01",
    };

    const result = calculateOrderSchemes(
      [{ product: glucoseBiscuit, quantity: 10 }],
      [expiredScheme],
      new Date("2026-06-01")
    );

    expect(result.items[0].free_quantity).toBe(0);
    expect(result.schemes_applied).toHaveLength(0);
  });

  it("Ignores invalid or zero quantities gracefully", () => {
    const result = calculateOrderSchemes(
      [
        { product: glucoseBiscuit, quantity: 0 },
        { product: detergentPowder, quantity: -5 },
      ],
      [buy10Get1FreeScheme, slab3PercentScheme],
      new Date("2026-06-01")
    );

    expect(result.items).toHaveLength(0);
    expect(result.grand_total).toBe(0);
  });

  it("Calculates multi-product mixed order with both schemes simultaneously", () => {
    const result = calculateOrderSchemes(
      [
        { product: glucoseBiscuit, quantity: 15 }, // earns 1 free case
        { product: detergentPowder, quantity: 6 }, // earns 3% discount
      ],
      [buy10Get1FreeScheme, slab3PercentScheme],
      new Date("2026-06-01")
    );

    expect(result.items).toHaveLength(2);
    expect(result.total_free_items_count).toBe(1);
    expect(result.schemes_applied).toHaveLength(2);
    expect(result.grand_total).toBeGreaterThan(0);
  });
});
