import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { OrderStatus } from "@/types";

const UpdateStatusSchema = z.object({
  status: z.enum(["pending_review", "confirmed", "on_hold", "rejected", "processing"]),
  reviewer_id: z.string().optional(),
  reason: z.string().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id;
    const body = await req.json();
    const validated = UpdateStatusSchema.parse(body);

    const reviewerId = validated.reviewer_id || "22222222-2222-2222-2222-222222222222";

    const updated = await db.updateOrderStatus(
      orderId,
      validated.status as OrderStatus,
      reviewerId,
      validated.reason
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      order: updated,
      message: `Order ${updated.order_number} marked as ${validated.status}.`,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }
    console.error("Update order status error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update order status" },
      { status: 500 }
    );
  }
}
