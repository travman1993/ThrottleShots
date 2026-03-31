import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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