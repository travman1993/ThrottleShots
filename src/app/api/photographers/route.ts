import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { PHOTOGRAPHERS } from "@/lib/photographers";

export async function GET() {
  const authError = requireAdmin();
  if (authError) return authError;

  const data = PHOTOGRAPHERS.map((p) => ({
    id: p.id,
    name: p.name,
    stripeAccountId: p.stripeAccountId,
    isConfigured: !!p.stripeAccountId,
  }));

  return NextResponse.json({ photographers: data });
}
