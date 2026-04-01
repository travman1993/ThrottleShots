import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

export async function POST() {
  const supabase = createAdminClient();
  try {
    // Find photos older than 60 days
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 60);
    const cutoffStr = cutoff.toISOString();

    const { data: oldPhotos, error: fetchError } = await supabase
      .from("photos")
      .select("id, image_url_original, event_id")
      .lt("created_at", cutoffStr);

    if (fetchError) {
      return NextResponse.json(
        { error: "Failed to fetch old photos: " + fetchError.message },
        { status: 500 }
      );
    }

    if (!oldPhotos || oldPhotos.length === 0) {
      return NextResponse.json({ deleted: 0, message: "No old photos found" });
    }

    let deleted = 0;

    for (const photo of oldPhotos) {
      const fileName = photo.image_url_original;

      // Delete from storage
      await supabase.storage.from("originals").remove([fileName]);
      await supabase.storage.from("watermarked").remove([fileName]);
      await supabase.storage.from("thumbnails").remove([fileName]);

      // Delete from database
      await supabase.from("photos").delete().eq("id", photo.id);

      deleted++;
    }

    // Also clean up events with no photos that are older than 60 days
    const { data: oldEvents } = await supabase
      .from("events")
      .select("id, date")
      .lt("date", cutoff.toISOString().split("T")[0]);

    if (oldEvents) {
      for (const event of oldEvents) {
        const { data: remaining } = await supabase
          .from("photos")
          .select("id")
          .eq("event_id", event.id)
          .limit(1);

        if (!remaining || remaining.length === 0) {
          await supabase.from("events").delete().eq("id", event.id);
        }
      }
    }

    return NextResponse.json({
      deleted,
      message: `Cleaned up ${deleted} photos older than 60 days`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}