import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { UserRole } from "@/types";

export interface AuthSessionData {
  user: {
    id: string;
    email?: string;
    phone?: string;
  } | null;
  role: UserRole | null;
  retailerId?: string;
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  const hasLiveSupabase = Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes("placeholder") &&
    !supabaseAnonKey.includes("placeholder")
  );

  let sessionUser: { id: string; email?: string; phone?: string } | null = null;
  let userRole: UserRole | null = null;

  // 1. Try Supabase SSR Authentication if live credentials exist
  if (hasLiveSupabase) {
    const supabase = createServerClient(supabaseUrl!, supabaseAnonKey!, {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: "", ...options });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({ name, value: "", ...options });
        },
      },
    });

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      sessionUser = {
        id: user.id,
        email: user.email,
        phone: user.phone,
      };

      // Retrieve role from profiles table
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, is_active")
        .eq("id", user.id)
        .single();

      if (profile && profile.is_active) {
        userRole = profile.role as UserRole;
      }
    }
  }

  // 2. Fallback / Synchronized Cookie Session (supports development and demo environments)
  if (!sessionUser) {
    const devSessionCookie = request.cookies.get("ordersaathi_session")?.value;
    if (devSessionCookie) {
      try {
        const parsed = JSON.parse(devSessionCookie);
        if (parsed && parsed.userId && parsed.role) {
          sessionUser = {
            id: parsed.userId,
            email: parsed.email,
            phone: parsed.phone,
          };
          userRole = parsed.role as UserRole;
        }
      } catch {
        // invalid cookie
      }
    }
  }

  return { response, sessionUser, userRole };
}
