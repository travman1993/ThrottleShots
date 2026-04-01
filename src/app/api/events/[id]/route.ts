import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { requireAdmin } from "@/lib/admin-auth";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authError = requireAdmin();
  if (authError) return authError;

  const supabase = createAdminClient();
  try {
    // Get all photos for this event
    const { data: photos } = await supabase
      .from("photos")
      .select("id, image_url_original")
      .eq("event_id", params.id);

    if (photos && photos.length > 0) {
      const fileNames = photos.map((p) => p.image_url_original);
      await supabase.storage.from("originals").remove(fileNames);
      await supabase.storage.from("watermarked").remove(fileNames);
      await supabase.storage.from("thumbnails").remove(fileNames);

      await supabase.from("photos").delete().eq("event_id", params.id);
    }

    const { error } = await supabase.from("events").delete().eq("id", params.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authError = requireAdmin();
  if (authError) return authError;

  const supabase = createAdminClient();
  try {
    const { name, date, category_id } = await req.json();

    const updates: Record<string, string | null> = {};
    if (name !== undefined) updates.name = name || null;
    if (date !== undefined) updates.date = date;
    if (category_id !== undefined) updates.category_id = category_id;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("events")
      .update(updates)
      .eq("id", params.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ event: data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
