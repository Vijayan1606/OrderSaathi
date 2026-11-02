import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { calculateOrderSchemes } from "@/lib/schemes/engine";
import { OrderStatus, OrderSource } from "@/types";

export const dynamic = "force-dynamic";

const CreateOrderSchema = z.object({
  retailer_id: z.string(),
  items: z
    .array(
      z.object({
        product_id: z.string(),
        quantity: z.number().int().positive(),
      })
    )
    .min(1, "Order must contain at least 1 item"),
  notes: z.string().optional(),
  source: z.enum(["web_portal", "ai_capture"]).default("web_portal"),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const retailerId = searchParams.get("retailer_id") || undefined;
    const status = (searchParams.get("status") as OrderStatus) || undefined;

    const orders = await db.getOrders({ retailerId, status });
    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error("GET orders error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = CreateOrderSchema.parse(body);

    const retailer = await db.getRetailer(validated.retailer_id);
    if (!retailer) {
      return NextResponse.json(
        { success: false, error: "Retailer not found" },
        { status: 404 }
      );
    }

    const allProducts = await db.getProducts();
    const activeSchemes = await db.getSchemes();

    // Map input items to actual products and enforce server-side validation
    const calculationItems = validated.items
      .map((it) => {
        const product = allProducts.find((p) => p.id === it.product_id);
        if (!product) return null;
        return { product, quantity: it.quantity };
      })
      .filter(Boolean) as { product: any; quantity: number }[];

    if (calculationItems.length === 0) {
      return NextResponse.json(
        { success: false, error: "No valid products found in order request" },
        { status: 400 }
      );
    }

    // MANDATORY NON-NEGOTIABLE RULE: Recalculate everything on the server
    const serverCalculation = calculateOrderSchemes(calculationItems, activeSchemes);

    // Business Rule: Check Credit Limit and determine hold status
    const availableCredit = retailer.credit_limit - retailer.outstanding_balance;
    const isCreditHold = serverCalculation.grand_total > availableCredit;

    const orderData = {
      retailer_id: retailer.id,
      status: isCreditHold ? ("on_hold" as OrderStatus) : ("pending_review" as OrderStatus),
      subtotal: serverCalculation.subtotal,
      scheme_discount_total: serverCalculation.total_discount,
      free_items_total_value: serverCalculation.total_free_value,
      taxable_amount: serverCalculation.total_taxable,
      gst_total: serverCalculation.total_gst,
      grand_total: serverCalculation.grand_total,
      credit_limit_at_order: retailer.credit_limit,
      outstanding_balance_at_order: retailer.outstanding_balance,
      notes: validated.notes,
      source: validated.source as OrderSource,
    };

    const orderItems = serverCalculation.items.map((it) => ({
      product_id: it.product.id,
      quantity: it.quantity,
      free_quantity: it.free_quantity,
      unit_price: it.unit_price,
      discount_percentage: it.discount_percentage,
      discount_amount: it.discount_amount,
      taxable_amount: it.taxable_amount,
      gst_rate: it.gst_rate,
      gst_amount: it.gst_amount,
      line_total: it.line_total,
      scheme_id: it.applied_scheme?.id,
    }));

    const savedOrder = await db.createOrder(orderData, orderItems);

    return NextResponse.json({
      success: true,
      order: savedOrder,
      message: isCreditHold
        ? "Order submitted but placed on Credit Hold because it exceeds available credit limit. Awaiting Order Desk authorization."
        : "Order successfully submitted and queued for Order Desk review.",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }
    console.error("POST order error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create order" },
      { status: 500 }
    );
  }
}
