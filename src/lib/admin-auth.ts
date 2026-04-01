import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export function requireAdmin(): NextResponse | null {
  const cookieStore = cookies();
  const isAdmin = cookieStore.get("admin_auth")?.value === "true";
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
