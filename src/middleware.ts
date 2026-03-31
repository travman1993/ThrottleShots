import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const isAdmin = req.nextUrl.pathname.startsWith("/admin");
  const isAdminApi = req.nextUrl.pathname.startsWith("/api/upload") ||
    req.nextUrl.pathname.startsWith("/api/photos") ||
    req.nextUrl.pathname.startsWith("/api/cleanup");

  if (isAdmin || isAdminApi) {
    const authCookie = req.cookies.get("admin_auth");

    if (!authCookie || authCookie.value !== "true") {
      if (isAdminApi) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        );
      }

      // Redirect to login page
      const loginUrl = new URL("/login", req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/upload/:path*", "/api/photos/:path*", "/api/cleanup/:path*"],
};