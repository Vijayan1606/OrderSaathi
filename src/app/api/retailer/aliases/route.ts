import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const AliasSchema = z.object({
  retailer_id: z.string(),
  alias: z.string().min(2),
  product_id: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = AliasSchema.parse(body);

    const products = await db.getProducts();
    const productExists = products.some((p) => p.id === validated.product_id);
    if (!productExists) {
      return NextResponse.json(
        { success: false, error: "Target product does not exist" },
        { status: 400 }
      );
    }

    const saved = await db.addRetailerAlias(
      validated.retailer_id,
      validated.alias,
      validated.product_id
    );

    return NextResponse.json({
      success: true,
      alias: saved,
      message: `Successfully learned alias "${validated.alias}" for future AI order extractions.`,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Failed to save alias" },
      { status: 500 }
    );
  }
}
