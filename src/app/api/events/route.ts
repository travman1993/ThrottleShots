import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

export async function POST(req: NextRequest) {
  const supabase = createAdminClient();
  try {
    const { category_id, date, name } = await req.json();

    if (!category_id || !date) {
      return NextResponse.json(
        { error: "Category and date are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("events")
      .insert({ category_id, date, name: name || null })
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
