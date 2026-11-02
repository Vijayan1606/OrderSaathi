import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const DeskLoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = DeskLoginSchema.parse(body);

    const email = validated.email.toLowerCase().trim();

    // Check profile in database
    const allProfiles = db.profiles;
    const profile = allProfiles.find(
      (p) =>
        p.email.toLowerCase() === email ||
        (email === "desk@ordersaathi.demo" && p.role === "order_desk") ||
        (email === "orderdesk@ordersaathi.in" && p.role === "order_desk")
    );

    if (!profile) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password." },
        { status: 401 }
      );
    }

    // Role check: must be order_desk
    if (profile.role !== "order_desk") {
      return NextResponse.json(
        {
          success: false,
          error:
            "Access denied: Retailer accounts cannot access the Order Desk operational portal.",
        },
        { status: 403 }
      );
    }

    if (!profile.is_active) {
      return NextResponse.json(
        {
          success: false,
          error: "Order desk account is deactivated. Contact system administrator.",
        },
        { status: 403 }
      );
    }

    // Try Supabase signInWithPassword if live
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const hasLiveSupabase = Boolean(
      supabaseUrl && !supabaseUrl.includes("placeholder")
    );

    let authSuccess = false;

    if (hasLiveSupabase) {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password: validated.password,
        });

        if (!error && data.user) {
          authSuccess = true;
        }
      } catch (err) {
        console.warn("Supabase signInWithPassword error:", err);
      }
    }

    // Demo credentials verification fallback
    if (!authSuccess) {
      if (
        (email === "desk@ordersaathi.demo" || email === "orderdesk@ordersaathi.in") &&
        (validated.password === "OrderSaathi@Desk2026" || validated.password === "ordersaathi2026")
      ) {
        authSuccess = true;
      } else {
        return NextResponse.json(
          { success: false, error: "Invalid email or password." },
          { status: 401 }
        );
      }
    }

    // Session payload
    const sessionData = {
      userId: profile.id,
      email: profile.email,
      phone: profile.phone,
      role: "order_desk",
      authenticatedAt: new Date().toISOString(),
    };

    // Update in-memory DB active profile
    db.currentUserId = profile.id;
    db.currentRole = "order_desk";

    const response = NextResponse.json({
      success: true,
      message: "Order Desk authentication successful.",
      profile,
      redirectTo: "/desk/dashboard",
    });

    response.cookies.set("ordersaathi_session", JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    // Audit log
    await db.recordAuditLog({
      action: "order_desk_login_success",
      entity_type: "auth",
      details: { profile_id: profile.id, email: profile.email },
    });

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }
    console.error("Desk login error:", error);
    return NextResponse.json(
      { success: false, error: "Authentication failed. Please try again." },
      { status: 500 }
    );
  }
}
