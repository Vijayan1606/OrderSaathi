import { describe, it, expect, beforeEach } from "vitest";
import { db } from "@/lib/db";

describe("Order Workflow & Credit Limit Operations", () => {
  beforeEach(() => {
    db.switchRole("retailer");
  });

  it("Automatically places order on Credit Hold if grand total exceeds available credit", async () => {
    const retailer = await db.getRetailer("aa111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
    expect(retailer).toBeDefined();

    const availableCredit = retailer!.credit_limit - retailer!.outstanding_balance; // 75,000 - 14,250 = 60,750

    // Create an order that exceeds available credit (e.g. 70,000 INR)
    const orderData = {
      retailer_id: retailer!.id,
      status: "pending_review" as const,
      subtotal: 70000.0,
      scheme_discount_total: 0,
      free_items_total_value: 0,
      taxable_amount: 70000.0,
      gst_total: 12600.0,
      grand_total: 82600.0, // > 60,750!
      credit_limit_at_order: retailer!.credit_limit,
      outstanding_balance_at_order: retailer!.outstanding_balance,
      source: "web_portal" as const,
    };

    const newOrder = await db.createOrder(orderData, [
      {
        product_id: "b1111111-1111-1111-1111-111111111111",
        quantity: 1000,
        free_quantity: 0,
        unit_price: 70.0,
        discount_percentage: 0,
        discount_amount: 0,
        taxable_amount: 70000.0,
        gst_rate: 18.0,
        gst_amount: 12600.0,
        line_total: 82600.0,
      },
    ]);

    expect(newOrder.status).toBe("on_hold");
    expect(newOrder.credit_hold_reason).toContain("Credit limit exceeded");
  });

  it("Order desk can authorize and approve an on-hold order with audit recording", async () => {
    // Switch to order desk
    db.switchRole("order_desk");

    // Fetch orders and find the on-hold order
    const orders = await db.getOrders({ status: "on_hold" });
    expect(orders.length).toBeGreaterThan(0);

    const onHoldOrder = orders[0];

    const updated = await db.updateOrderStatus(
      onHoldOrder.id,
      "confirmed",
      "22222222-2222-2222-2222-222222222222",
      "Authorized special credit extension by distributor manager Vikram Patel"
    );

    expect(updated).toBeDefined();
    expect(updated!.status).toBe("confirmed");
    expect(updated!.corrections?.length).toBeGreaterThan(0);
    expect(updated!.corrections![0].action_type).toBe("status_changed_to_confirmed");
  });

  it("Saves and learns retailer-specific aliases for future AI matching", async () => {
    const retailerId = "aa111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
    const newAlias = "chhota biskut parla";
    const productId = "b1111111-1111-1111-1111-111111111111";

    const saved = await db.addRetailerAlias(retailerId, newAlias, productId);
    expect(saved.alias).toBe(newAlias);
    expect(saved.product_id).toBe(productId);

    const allAliases = await db.getRetailerAliases(retailerId);
    expect(allAliases.some((a) => a.alias === newAlias)).toBe(true);
  });
});
