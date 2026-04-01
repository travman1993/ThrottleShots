import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createAdminClient();
  try {
    const { vehicle_type, color } = await req.json();

    const updates: Record<string, string> = {};
    if (vehicle_type !== undefined) updates.vehicle_type = vehicle_type;
    if (color !== undefined) updates.color = color;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("photos")
      .update(updates)
      .eq("id", params.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ photo: data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createAdminClient();
  try {
    // Get the photo record first
    const { data: photo, error: fetchError } = await supabase
      .from("photos")
      .select("*")
      .eq("id", params.id)
      .single();

    if (fetchError || !photo) {
      return NextResponse.json(
        { error: "Photo not found" },
        { status: 404 }
      );
    }

    const fileName = photo.image_url_original;

    // Delete from all 3 storage buckets
    await supabase.storage.from("originals").remove([fileName]);
    await supabase.storage.from("watermarked").remove([fileName]);
    await supabase.storage.from("thumbnails").remove([fileName]);

    // Delete from database
    const { error: dbError } = await supabase
      .from("photos")
      .delete()
      .eq("id", params.id);

    if (dbError) {
      return NextResponse.json(
        { error: "Failed to delete record: " + dbError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}