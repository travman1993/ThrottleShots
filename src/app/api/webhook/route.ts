import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase-admin";
import { Resend } from "resend";
import { getPhotographer } from "@/lib/photographers";

export async function POST(req: NextRequest) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const supabase = createAdminClient();

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const customerEmail = session.customer_details?.email;
    const photoIdsRaw = session.metadata?.photo_ids;

    if (!customerEmail || !photoIdsRaw) {
      await supabase.from("webhook_failures").insert({
        stripe_event_id: event.id,
        event_type: event.type,
        error: "Missing customer email or photo_ids in metadata",
        payload: JSON.stringify(session),
      });
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    const photoIds = photoIdsRaw.split(",");

    // Look up photo records to get storage paths and photographer IDs
    const { data: photos, error } = await supabase
      .from("photos")
      .select("id, image_url_original, photographer_id")
      .in("id", photoIds);

    if (error || !photos || photos.length === 0) {
      await supabase.from("webhook_failures").insert({
        stripe_event_id: event.id,
        event_type: event.type,
        error: "Photos not found: " + (error?.message ?? "empty result"),
        payload: JSON.stringify({ photo_ids: photoIds }),
      });
      return NextResponse.json({ error: "Photos not found" }, { status: 500 });
    }

    // --- Stripe Connect payment splitting ---
    const totalCents = session.amount_total;
    const paymentIntentId = session.payment_intent as string | null;

    if (totalCents && paymentIntentId) {
      try {
        // Count photos per photographer
        const photographerCounts: Record<string, number> = {};
        for (const photo of photos) {
          const pid = photo.photographer_id || "travis";
          photographerCounts[pid] = (photographerCounts[pid] || 0) + 1;
        }

        const totalPhotos = photos.length;

        // Get charge ID from the payment intent (needed for source_transaction)
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        const chargeId = paymentIntent.latest_charge as string | null;

        // Create transfers for connected photographers (skip Travis — he's the platform)
        for (const [pid, count] of Object.entries(photographerCounts)) {
          const photographer = getPhotographer(pid);
          if (!photographer.stripeAccountId) continue; // platform owner, no transfer

          const transferAmount = Math.round((count / totalPhotos) * totalCents);
          if (transferAmount <= 0) continue;

          await stripe.transfers.create({
            amount: transferAmount,
            currency: "usd",
            destination: photographer.stripeAccountId,
            ...(chargeId ? { source_transaction: chargeId } : {}),
            description: `ThrottleShots — ${count} photo${count !== 1 ? "s" : ""} by ${photographer.name}`,
            metadata: {
              stripe_event_id: event.id,
              photographer_id: pid,
              photo_count: String(count),
            },
          });
        }
      } catch (transferErr) {
        const msg = transferErr instanceof Error ? transferErr.message : "Transfer error";
        await supabase.from("webhook_failures").insert({
          stripe_event_id: event.id,
          event_type: event.type,
          error: "Stripe transfer failed: " + msg,
          payload: JSON.stringify({ payment_intent_id: paymentIntentId }),
        });
        // Continue — still send download email even if transfer fails
      }
    }

    // Generate signed URLs from the originals bucket (24 hour expiry)
    const signedUrls: { id: string; url: string }[] = [];
    for (const photo of photos) {
      const { data, error: urlError } = await supabase.storage
        .from("originals")
        .createSignedUrl(photo.image_url_original, 60 * 60 * 24);

      if (!urlError && data?.signedUrl) {
        signedUrls.push({ id: photo.id, url: data.signedUrl });
      }
    }

    if (signedUrls.length === 0) {
      await supabase.from("webhook_failures").insert({
        stripe_event_id: event.id,
        event_type: event.type,
        error: "Could not generate signed URLs",
        payload: JSON.stringify({ photo_ids: photoIds }),
      });
      return NextResponse.json(
        { error: "Could not generate download links" },
        { status: 500 }
      );
    }

    const downloadList = signedUrls
      .map((s, i) => `<li style="margin-bottom:12px"><a href="${s.url}" style="color:#E85D04;font-weight:600">Download Photo ${i + 1}</a></li>`)
      .join("");

    const { error: emailError } = await resend.emails.send({
      from: "ThrottleShots <noreply@throttleshotsmedia.com>",
      to: customerEmail,
      subject: "Your ThrottleShots photos are ready",
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;background:#0a0a0a;color:#e5e5e5">
          <img src="https://throttleshotsmedia.com/logo-horizontal.png" alt="ThrottleShots" style="height:40px;margin-bottom:32px" />
          <h1 style="font-size:24px;margin-bottom:8px;color:#ffffff">Your photos are ready</h1>
          <p style="color:#a0a0a0;margin-bottom:24px">
            Thank you for your purchase. Your full-resolution photos are available for download below.
            Links expire in 24 hours.
          </p>
          <ul style="padding:0;list-style:none">
            ${downloadList}
          </ul>
          <p style="margin-top:32px;font-size:12px;color:#666">
            If you have any issues, reply to this email or contact us at
            <a href="mailto:hello@throttleshotsmedia.com" style="color:#E85D04">hello@throttleshotsmedia.com</a>
          </p>
        </div>
      `,
    });

    if (emailError) {
      await supabase.from("webhook_failures").insert({
        stripe_event_id: event.id,
        event_type: event.type,
        error: "Resend email failed: " + emailError.message,
        payload: JSON.stringify({ customer_email: customerEmail }),
      });
    }
  }

  return NextResponse.json({ received: true });
}
