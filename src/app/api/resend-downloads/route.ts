import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase-admin";
import { Resend } from "resend";

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  try {
    // Search Stripe sessions from the last 30 days for this email
    const thirtyDaysAgo = Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60;
    const sessions = await stripe.checkout.sessions.list({
      limit: 100,
      created: { gte: thirtyDaysAgo },
    });

    const matchingSessions = sessions.data.filter(
      (s) =>
        s.customer_details?.email?.toLowerCase() === email.toLowerCase() &&
        s.payment_status === "paid" &&
        s.metadata?.photo_ids
    );

    if (matchingSessions.length === 0) {
      return NextResponse.json(
        { error: "No recent purchases found for that email." },
        { status: 404 }
      );
    }

    // Collect all photo IDs across all matching sessions (deduplicated)
    const allPhotoIds = Array.from(
      new Set(
        matchingSessions.flatMap((s) => s.metadata!.photo_ids!.split(","))
      )
    );

    const supabase = createAdminClient();
    const { data: photos, error } = await supabase
      .from("photos")
      .select("id, image_url_original, thumbnail_url, vehicle_type, color")
      .in("id", allPhotoIds);

    if (error || !photos || photos.length === 0) {
      return NextResponse.json({ error: "Photos not found" }, { status: 404 });
    }

    // Generate fresh 24-hour signed URLs
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
      return NextResponse.json(
        { error: "Could not generate download links" },
        { status: 500 }
      );
    }

    const downloadList = signedUrls
      .map(
        (s, i) =>
          `<li style="margin-bottom:12px"><a href="${s.url}" style="color:#E85D04;font-weight:600">Download Photo ${i + 1}</a></li>`
      )
      .join("");

    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: "ThrottleShots <noreply@throttleshotsmedia.com>",
      to: email,
      subject: "Your ThrottleShots download links (resent)",
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;background:#0a0a0a;color:#e5e5e5">
          <img src="https://throttleshotsmedia.com/logo-horizontal.png" alt="ThrottleShots" style="height:40px;margin-bottom:32px" />
          <h1 style="font-size:24px;margin-bottom:8px;color:#ffffff">Your download links</h1>
          <p style="color:#a0a0a0;margin-bottom:24px">
            Here are your full-resolution photo download links. These links expire in 24 hours.
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

    return NextResponse.json({ success: true, count: signedUrls.length });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
