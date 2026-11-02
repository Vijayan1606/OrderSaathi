import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    let userId: string | null = null;
    let role: string | null = null;

    // Check Supabase SSR session
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const hasLiveSupabase = Boolean(
      supabaseUrl && !supabaseUrl.includes("placeholder")
    );

    if (hasLiveSupabase) {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          userId = user.id;
        }
      } catch (err) {
        console.warn("Supabase getUser error in /api/auth/me:", err);
      }
    }

    // Fallback to cookie
    if (!userId) {
      const cookie = req.cookies.get("ordersaathi_session")?.value;
      if (cookie) {
        try {
          const parsed = JSON.parse(cookie);
          userId = parsed.userId;
          role = parsed.role;
        } catch {}
      }
    }

    if (!userId) {
      return NextResponse.json({
        authenticated: false,
        profile: null,
        retailer: null,
      });
    }

    const profile = db.profiles.find((p) => p.id === userId);
    if (!profile || !profile.is_active) {
      return NextResponse.json({
        authenticated: false,
        profile: null,
        retailer: null,
      });
    }

    const retailer = profile.role === "retailer" ? await db.getRetailerByProfileId(profile.id) : null;

    return NextResponse.json({
      authenticated: true,
      profile,
      retailer,
      role: profile.role,
    });
  } catch (error) {
    console.error("GET /api/auth/me error:", error);
    return NextResponse.json(
      { authenticated: false, error: "Failed to resolve session" },
      { status: 500 }
    );
  }
}
