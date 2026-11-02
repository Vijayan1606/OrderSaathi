import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Static assets, next internals, and API routes that do not require page redirects
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // Legacy route redirections to maintain backward compatibility
  if (pathname === "/catalogue") {
    return NextResponse.redirect(new URL("/retailer/catalogue", request.url));
  }
  if (pathname === "/cart") {
    return NextResponse.redirect(new URL("/retailer/cart", request.url));
  }
  if (pathname === "/ai-order") {
    return NextResponse.redirect(new URL("/retailer/ai-order", request.url));
  }
  if (pathname === "/orders") {
    return NextResponse.redirect(new URL("/retailer/orders", request.url));
  }
  if (pathname === "/order-desk") {
    return NextResponse.redirect(new URL("/desk/dashboard", request.url));
  }
  if (pathname === "/order-desk/orders") {
    return NextResponse.redirect(new URL("/desk/orders", request.url));
  }
  if (pathname === "/order-desk/export") {
    return NextResponse.redirect(new URL("/desk/exports", request.url));
  }

  // Refresh Supabase SSR session and retrieve authenticated profile role
  const { response, sessionUser, userRole } = await updateSession(request);

  const isPublicAuthRoute =
    pathname === "/login" ||
    pathname === "/retailer/login" ||
    pathname === "/desk/login" ||
    pathname === "/desk/forgot-password" ||
    pathname.startsWith("/auth/");

  const isRetailerRoute = pathname.startsWith("/retailer/");
  const isDeskRoute = pathname.startsWith("/desk/");

  // 1. Root page "/" redirection
  if (pathname === "/") {
    if (!sessionUser) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (userRole === "order_desk") {
      return NextResponse.redirect(new URL("/desk/dashboard", request.url));
    }
    return NextResponse.redirect(new URL("/retailer/dashboard", request.url));
  }

  // 2. Authenticated user accessing public login routes -> redirect to respective dashboard
  if (sessionUser && isPublicAuthRoute) {
    if (userRole === "order_desk") {
      return NextResponse.redirect(new URL("/desk/dashboard", request.url));
    }
    return NextResponse.redirect(new URL("/retailer/dashboard", request.url));
  }

  // 3. Unauthenticated access to protected routes
  if (!sessionUser) {
    if (isRetailerRoute) {
      const redirectUrl = new URL("/retailer/login", request.url);
      redirectUrl.searchParams.set("redirectTo", pathname + search);
      return NextResponse.redirect(redirectUrl);
    }
    if (isDeskRoute) {
      const redirectUrl = new URL("/desk/login", request.url);
      redirectUrl.searchParams.set("redirectTo", pathname + search);
      return NextResponse.redirect(redirectUrl);
    }
  }

  // 4. Role-based unauthorized cross-access protection
  if (sessionUser && userRole) {
    // Retailer attempting to access Order Desk routes
    if (userRole === "retailer" && isDeskRoute) {
      const redirectUrl = new URL("/retailer/dashboard", request.url);
      redirectUrl.searchParams.set("error", "unauthorized_desk_access");
      return NextResponse.redirect(redirectUrl);
    }

    // Order Desk user attempting to access Retailer routes
    if (userRole === "order_desk" && isRetailerRoute) {
      const redirectUrl = new URL("/desk/dashboard", request.url);
      redirectUrl.searchParams.set("error", "unauthorized_retailer_access");
      return NextResponse.redirect(redirectUrl);
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
