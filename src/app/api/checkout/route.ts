import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase-admin";
import { calculateCartTotal } from "@/lib/pricing";

export async function POST(req: NextRequest) {
  try {
    const { photoIds } = await req.json();

    if (!Array.isArray(photoIds) || photoIds.length === 0) {
      return NextResponse.json({ error: "No photos selected" }, { status: 400 });
    }

    if (photoIds.length > 10) {
      return NextResponse.json({ error: "Too many photos" }, { status: 400 });
    }

    // Verify all photo IDs exist in the database (don't trust client)
    const supabase = createAdminClient();
    const { data: photos, error } = await supabase
      .from("photos")
      .select("id, price")
      .in("id", photoIds);

    if (error || !photos || photos.length !== photoIds.length) {
      return NextResponse.json(
        { error: "One or more photos not found" },
        { status: 400 }
      );
    }

    // Calculate price server-side using the same bundle logic
    const total = calculateCartTotal(photos.length);
    const unitAmount = Math.round(total * 100); // Stripe expects cents

    const count = photos.length;
    const photoLabel = `${count} Photo${count !== 1 ? "s" : ""}`;
    const bundleNote =
      count >= 5
        ? "5-photo bundle"
        : count >= 3
        ? "3-photo bundle"
        : "per-photo rate";

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `ThrottleShots — ${photoLabel}`,
              description: `Automotive event photography (${bundleNote})`,
            },
            unit_amount: unitAmount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${siteUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/cart`,
      metadata: {
        photo_ids: photoIds.join(","),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
