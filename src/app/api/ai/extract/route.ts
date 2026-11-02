import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { extractOrderFromText } from "@/lib/ai/extractor";

const RequestSchema = z.object({
  text: z.string().min(2, "Order text is required"),
  retailer_id: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = RequestSchema.parse(body);

    const products = await db.getProducts();
    const retailerId = validated.retailer_id || "aa111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
    const aliases = await db.getRetailerAliases(retailerId);

    const apiKey = process.env.GEMINI_API_KEY;
    const provider = process.env.AI_PROVIDER || "gemini";

    const extraction = await extractOrderFromText(
      validated.text,
      products,
      aliases,
      apiKey,
      provider
    );

    // Record AI extraction audit log
    await db.recordAuditLog({
      action: "ai_order_extraction",
      entity_type: "ai_extraction",
      details: {
        raw_text_length: validated.text.length,
        items_extracted: extraction.items.length,
        overall_confidence: extraction.overall_confidence,
        has_ambiguities: extraction.has_ambiguous_units,
      },
    });

    return NextResponse.json({
      success: true,
      data: extraction,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }
    console.error("AI extraction endpoint error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process order message" },
      { status: 500 }
    );
  }
}
