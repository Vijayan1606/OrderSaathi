// OrderSaathi Server-Side Promotional Scheme Engine
// Implements Buy X Get Y Free, Percentage Slab Discounts, Multi-scheme checks, and GST calculations.

import { Product, Scheme, SchemeCalculationItem, SchemeCalculationResult } from "@/types";

/**
 * Standard 2-decimal place precision helper to avoid floating point inaccuracies
 */
export function roundToTwo(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

export interface CalculateOrderInputItem {
  product: Product;
  quantity: number;
  custom_dealer_price?: number;
}

/**
 * Checks if a scheme is currently active based on status and dates
 */
export function isSchemeValid(scheme: Scheme, checkDate = new Date()): boolean {
  if (!scheme.is_active) return false;
  
  const today = checkDate.toISOString().split("T")[0];
  const startDate = scheme.start_date.split("T")[0];
  const endDate = scheme.end_date.split("T")[0];

  return today >= startDate && today <= endDate;
}

/**
 * Core scheme calculation function.
 * Pure, deterministic, server-executable, and unit-tested.
 */
export function calculateOrderSchemes(
  items: CalculateOrderInputItem[],
  activeSchemes: Scheme[],
  referenceDate = new Date()
): SchemeCalculationResult {
  const calculatedItems: SchemeCalculationItem[] = [];
  const appliedSchemesSummary: Map<
    string,
    {
      scheme_id: string;
      scheme_name: string;
      description: string;
      benefit_description: string;
    }
  > = new Map();

  let subtotal = 0;
  let totalDiscount = 0;
  let totalTaxable = 0;
  let totalGst = 0;
  let totalFreeValue = 0;
  let totalFreeItemsCount = 0;

  // Filter schemes that are valid today
  const validSchemes = activeSchemes.filter((s) => isSchemeValid(s, referenceDate));

  for (const item of items) {
    const { product, quantity } = item;

    // Safety checks
    if (!product || quantity <= 0) {
      continue;
    }

    const unitPrice = item.custom_dealer_price ?? product.dealer_price;
    const baseAmount = roundToTwo(unitPrice * quantity);

    // Find applicable scheme for this specific product
    const eligibleScheme = validSchemes.find(
      (s) => Array.isArray(s.eligible_product_ids) && s.eligible_product_ids.includes(product.id)
    );

    let freeQuantity = 0;
    let discountPercentage = 0;
    let discountAmount = 0;
    let appliedScheme: Scheme | undefined = undefined;
    let schemeNotes: string | undefined = undefined;

    if (eligibleScheme) {
      if (eligibleScheme.scheme_type === "buy_x_get_y") {
        if (eligibleScheme.min_quantity > 0 && quantity >= eligibleScheme.min_quantity) {
          const sets = Math.floor(quantity / eligibleScheme.min_quantity);
          freeQuantity = sets * (eligibleScheme.free_quantity || 1);
          appliedScheme = eligibleScheme;
          schemeNotes = `Buy ${eligibleScheme.min_quantity} Get ${eligibleScheme.free_quantity} Free: ${freeQuantity} free case(s) earned`;

          appliedSchemesSummary.set(eligibleScheme.id, {
            scheme_id: eligibleScheme.id,
            scheme_name: eligibleScheme.name,
            description: eligibleScheme.description,
            benefit_description: `${freeQuantity} free case(s) of ${product.name} unlocked.`,
          });
        }
      } else if (eligibleScheme.scheme_type === "slab_discount") {
        if (eligibleScheme.min_quantity > 0 && quantity >= eligibleScheme.min_quantity) {
          discountPercentage = eligibleScheme.discount_percentage;
          discountAmount = roundToTwo(baseAmount * (discountPercentage / 100));
          appliedScheme = eligibleScheme;
          schemeNotes = `${discountPercentage}% Slab Discount applied on ${quantity} cases`;

          appliedSchemesSummary.set(eligibleScheme.id, {
            scheme_id: eligibleScheme.id,
            scheme_name: eligibleScheme.name,
            description: eligibleScheme.description,
            benefit_description: `${discountPercentage}% discount saved ₹${discountAmount.toFixed(2)} on ${product.name}.`,
          });
        }
      }
    }

    // Calculate line taxes and totals
    // Taxable amount = base amount minus discount
    const taxableAmount = roundToTwo(Math.max(0, baseAmount - discountAmount));
    const gstRate = product.gst_rate ?? 18;
    const gstAmount = roundToTwo(taxableAmount * (gstRate / 100));
    const lineTotal = roundToTwo(taxableAmount + gstAmount);

    // Free items value (recorded for inventory and scheme transparency, but NEVER charged)
    const freeItemValue = roundToTwo(freeQuantity * unitPrice);

    // Accumulate totals
    subtotal = roundToTwo(subtotal + baseAmount);
    totalDiscount = roundToTwo(totalDiscount + discountAmount);
    totalTaxable = roundToTwo(totalTaxable + taxableAmount);
    totalGst = roundToTwo(totalGst + gstAmount);
    totalFreeValue = roundToTwo(totalFreeValue + freeItemValue);
    totalFreeItemsCount += freeQuantity;

    calculatedItems.push({
      product,
      quantity,
      unit_price: unitPrice,
      base_amount: baseAmount,
      free_quantity: freeQuantity,
      discount_percentage: discountPercentage,
      discount_amount: discountAmount,
      taxable_amount: taxableAmount,
      gst_rate: gstRate,
      gst_amount: gstAmount,
      line_total: lineTotal,
      free_item_value: freeItemValue,
      applied_scheme: appliedScheme,
      scheme_notes: schemeNotes,
    });
  }

  const grandTotal = roundToTwo(totalTaxable + totalGst);

  return {
    items: calculatedItems,
    subtotal,
    total_discount: totalDiscount,
    total_taxable: totalTaxable,
    total_gst: totalGst,
    grand_total: grandTotal,
    total_free_value: totalFreeValue,
    total_free_items_count: totalFreeItemsCount,
    schemes_applied: Array.from(appliedSchemesSummary.values()),
  };
}
