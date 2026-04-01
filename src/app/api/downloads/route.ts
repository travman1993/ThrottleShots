import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase-admin";

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return NextResponse.json({ error: "Payment not completed" }, { status: 403 });
    }

    const photoIdsRaw = session.metadata?.photo_ids;
    if (!photoIdsRaw) {
      return NextResponse.json({ error: "No photos found" }, { status: 404 });
    }

    const photoIds = photoIdsRaw.split(",");
    const supabase = createAdminClient();

    const { data: photos, error } = await supabase
      .from("photos")
      .select("id, image_url_original, thumbnail_url, vehicle_type, color")
      .in("id", photoIds);

    if (error || !photos || photos.length === 0) {
      return NextResponse.json({ error: "Photos not found" }, { status: 404 });
    }

    const downloads: {
      id: string;
      url: string;
      thumbnail_url: string;
      vehicle_type: string;
      color: string;
    }[] = [];

    for (const photo of photos) {
      const { data, error: urlError } = await supabase.storage
        .from("originals")
        .createSignedUrl(photo.image_url_original, 60 * 60 * 24);

      if (!urlError && data?.signedUrl) {
        downloads.push({
          id: photo.id,
          url: data.signedUrl,
          thumbnail_url: photo.thumbnail_url,
          vehicle_type: photo.vehicle_type,
          color: photo.color,
        });
      }
    }

    return NextResponse.json({ downloads });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
