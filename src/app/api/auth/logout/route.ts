import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const hasLiveSupabase = Boolean(
      supabaseUrl && !supabaseUrl.includes("placeholder")
    );

    if (hasLiveSupabase) {
      try {
        const supabase = createClient();
        await supabase.auth.signOut();
      } catch (err) {
        console.warn("Supabase signOut error:", err);
      }
    }

    const sessionCookie = req.cookies.get("ordersaathi_session")?.value;
    let userId: string | undefined = undefined;
    if (sessionCookie) {
      try {
        const parsed = JSON.parse(sessionCookie);
        userId = parsed.userId;
      } catch {}
    }

    if (userId) {
      await db.recordAuditLog({
        action: "user_logout",
        entity_type: "auth",
        user_id: userId,
      });
    }

    const response = NextResponse.json({
      success: true,
      message: "Successfully logged out.",
    });

    // Delete session cookie
    response.cookies.set("ordersaathi_session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to logout" },
      { status: 500 }
    );
  }
}
