import { describe, it, expect } from "vitest";
import { parseHinglishOrder } from "@/lib/ai/extractor";
import { Product, RetailerProductAlias } from "@/types";

describe("AI Natural Language Order Capture", () => {
  const catalogProducts: Product[] = [
    {
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
    },
    {
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
    },
    {
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
      stock_cases: 0, // Out of stock
      is_active: true,
      gst_rate: 5.0,
    },
  ];

  const aliases: RetailerProductAlias[] = [
    {
      id: "a1",
      retailer_id: "ret-1",
      alias: "biscuit chhota",
      product_id: "p111",
      confidence: 1.0,
      created_at: "2026-01-01",
      updated_at: "2026-01-01",
    },
  ];

  it("Accurately parses the exact prompt example: 'Bhaiya 5 peti biscuit chhota, 2 peti washing powder 1 kilo, chai patti 250 wala 1 peti'", () => {
    const input =
      "Bhaiya 5 peti biscuit chhota, 2 peti washing powder 1 kilo, chai patti 250 wala 1 peti";
    const result = parseHinglishOrder(input, catalogProducts, aliases);

    expect(result.items).toHaveLength(3);

    // Item 1: Glucose biscuit 75 g
    const item1 = result.items[0];
    expect(item1.sku).toBe("SKU-BS-075");
    expect(item1.quantity).toBe(5);
    expect(item1.unit).toBe("case");
    expect(item1.confidence_level).toBe("high");
    expect(item1.requires_unit_clarification).toBe(false);

    // Item 2: Detergent powder 1 kg
    const item2 = result.items[1];
    expect(item2.sku).toBe("SKU-DT-1KG");
    expect(item2.quantity).toBe(2);
    expect(item2.unit).toBe("case");
    expect(item2.confidence_level).toBe("high");

    // Item 3: Tea leaf 250 g (Out of stock warning triggered)
    const item3 = result.items[2];
    expect(item3.sku).toBe("SKU-TE-250");
    expect(item3.quantity).toBe(1);
    expect(item3.unit).toBe("case");
    expect(item3.is_out_of_stock).toBe(true);
    expect(item3.notes).toContain("out of stock");
  });

  it("Detects ambiguous units when retailer specifies packets instead of wholesale cases", () => {
    const input = "10 packet biscuit";
    const result = parseHinglishOrder(input, catalogProducts, aliases);

    expect(result.items).toHaveLength(1);
    const item = result.items[0];
    expect(item.quantity).toBe(10);
    expect(item.unit).toBe("piece");
    expect(item.requires_unit_clarification).toBe(true);
    expect(item.unit_clarification_message).toContain("Standard wholesale packaging is in cases");
  });

  it("Handles unknown product and flags unmatched state with alternatives", () => {
    const input = "3 peti unknown luxury chocolate foreign brand";
    const result = parseHinglishOrder(input, catalogProducts, aliases);

    expect(result.items).toHaveLength(1);
    const item = result.items[0];
    expect(item.matched_product_id).toBeUndefined();
    expect(item.confidence_level).toBe("low");
    expect(item.alternatives.length).toBeGreaterThan(0);
    expect(result.has_unmatched_items).toBe(true);
  });

  it("Parses Hindi transliterated number words (paanch, do)", () => {
    const input = "paanch peti biscuit chhota aur do peti washing powder";
    const result = parseHinglishOrder(input, catalogProducts, aliases);

    expect(result.items).toHaveLength(2);
    expect(result.items[0].quantity).toBe(5);
    expect(result.items[1].quantity).toBe(2);
  });
});
