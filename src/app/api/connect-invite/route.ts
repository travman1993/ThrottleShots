import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { requireAdmin } from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
  const authError = requireAdmin();
  if (authError) return authError;

  const { email } = await req.json();

  // Create a new Express connected account for the photographer
  const account = await stripe.accounts.create({
    type: "express",
    email,
    capabilities: {
      transfers: { requested: true },
    },
  });

  // Generate the onboarding link
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const accountLink = await stripe.accountLinks.create({
    account: account.id,
    refresh_url: `${siteUrl}/admin`,
    return_url: `${siteUrl}/admin`,
    type: "account_onboarding",
  });

  return NextResponse.json({ account_id: account.id, url: accountLink.url });
}
