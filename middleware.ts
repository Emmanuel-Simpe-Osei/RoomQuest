import { NextResponse } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Create a Supabase middleware client
  const supabase = createMiddlewareClient({ req, res });

  // Get the authenticated user (if any)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAdminRoute = req.nextUrl.pathname.startsWith("/dashboard/admin");
  const isUserRoute = req.nextUrl.pathname.startsWith("/dashboard/user");
  const isDashboardRoute = req.nextUrl.pathname.startsWith("/dashboard");

  // If not logged in and trying to access any dashboard route → redirect to login
  if (!user && isDashboardRoute) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // If logged in, get the role from profiles table
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    const role = profile?.role || "user";

    // ✅ Prevent non-admins from accessing admin pages
    if (isAdminRoute && role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard/user", req.url));
    }

    // ✅ Prevent admins from being pushed to normal user dashboard
    if (isUserRoute && role === "admin") {
      return NextResponse.redirect(new URL("/dashboard/admin", req.url));
    }
  }

  return res;
}

export const config = {
  matcher: [
    "/dashboard/:path*", // protect all dashboard routes
  ],
};
