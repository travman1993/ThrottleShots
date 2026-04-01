import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { createAdminClient } from "@/lib/supabase-admin";
import path from "path";
import fs from "fs";

async function buildWatermarkComposites(
  imageWidth: number,
  imageHeight: number,
  wmSizeRatio: number,
  positions: { x: number; y: number }[]
) {
  const wmPath = path.join(process.cwd(), "public", "watermark.png");
  const wmBuffer = fs.readFileSync(wmPath);

  const wmWidth = Math.floor(imageWidth * wmSizeRatio);
  const resized = await sharp(wmBuffer)
    .resize(wmWidth, undefined, { fit: "inside" })
    .ensureAlpha()
    .composite([{
      input: Buffer.from([0, 0, 0, Math.round(255 * 0.40)]),
      raw: { width: 1, height: 1, channels: 4 },
      tile: true,
      blend: "dest-in",
    }])
    .toBuffer();

  const meta = await sharp(resized).metadata();
  const wmH = meta.height ?? Math.floor(wmWidth * 0.3);

  return positions.map(({ x, y }) => ({
    input: resized,
    left: Math.max(0, Math.min(Math.round(x - wmWidth / 2), imageWidth - wmWidth)),
    top: Math.max(0, Math.min(Math.round(y - wmH / 2), imageHeight - wmH)),
    blend: "over" as const,
  }));
}

export async function POST(req: NextRequest) {
  const supabase = createAdminClient();
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const eventId = formData.get("event_id") as string;
    const vehicleType = formData.get("vehicle_type") as string;
    const color = formData.get("color") as string;

    if (!file || !eventId || !vehicleType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const baseName = `${timestamp}_${safeName}`;

    // Get image dimensions
    const metadata = await sharp(buffer).metadata();
    const width = metadata.width || 1200;
    const height = metadata.height || 800;

    // 1. Generate watermarked version (tiled watermark image)
    const wmComposites = await buildWatermarkComposites(width, height, 0.4, [
      { x: width * 0.5, y: height * 0.2 },
      { x: width * 0.2, y: height * 0.5 },
      { x: width * 0.8, y: height * 0.5 },
      { x: width * 0.5, y: height * 0.8 },
    ]);
    const watermarked = await sharp(buffer)
      .composite(wmComposites)
      .jpeg({ quality: 85 })
      .toBuffer();

    // 2. Generate thumbnail WITH watermark
    const thumbWidth = 400;
    const thumbHeight = 300;
    const thumbBase = await sharp(buffer)
      .resize(thumbWidth, thumbHeight, { fit: "cover" })
      .jpeg({ quality: 75 })
      .toBuffer();

    const thumbComposites = await buildWatermarkComposites(thumbWidth, thumbHeight, 0.6, [
      { x: thumbWidth * 0.5, y: thumbHeight * 0.35 },
      { x: thumbWidth * 0.5, y: thumbHeight * 0.75 },
    ]);
    const thumbnail = await sharp(thumbBase)
      .composite(thumbComposites)
      .jpeg({ quality: 75 })
      .toBuffer();

    // 3. Upload original (private)
    const { error: origError } = await supabase.storage
      .from("originals")
      .upload(baseName, buffer, {
        contentType: "image/jpeg",
        upsert: false,
      });

    if (origError) {
      return NextResponse.json(
        { error: "Failed to upload original: " + origError.message },
        { status: 500 }
      );
    }

    // 4. Upload watermarked (public)
    const { error: wmError } = await supabase.storage
      .from("watermarked")
      .upload(baseName, watermarked, {
        contentType: "image/jpeg",
        upsert: false,
      });

    if (wmError) {
      return NextResponse.json(
        { error: "Failed to upload watermarked: " + wmError.message },
        { status: 500 }
      );
    }

    // 5. Upload thumbnail (public)
    const { error: thumbError } = await supabase.storage
      .from("thumbnails")
      .upload(baseName, thumbnail, {
        contentType: "image/jpeg",
        upsert: false,
      });

    if (thumbError) {
      return NextResponse.json(
        { error: "Failed to upload thumbnail: " + thumbError.message },
        { status: 500 }
      );
    }

    // 6. Get public URLs
    const { data: wmUrl } = supabase.storage
      .from("watermarked")
      .getPublicUrl(baseName);

    const { data: thumbUrl } = supabase.storage
      .from("thumbnails")
      .getPublicUrl(baseName);

    // 7. Save to database
    const { data: photo, error: dbError } = await supabase
      .from("photos")
      .insert({
        event_id: eventId,
        image_url_original: baseName,
        image_url_watermarked: wmUrl.publicUrl,
        thumbnail_url: thumbUrl.publicUrl,
        vehicle_type: vehicleType,
        color: color || null,
        price: 9.99,
      })
      .select()
      .single();

    if (dbError) {
      return NextResponse.json(
        { error: "Failed to save photo: " + dbError.message },
        { status: 500 }
      );
    }

    // Increment all-time upload counter (never decrements on delete)
    await supabase.rpc("increment_photo_count");

    return NextResponse.json({ photo });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}