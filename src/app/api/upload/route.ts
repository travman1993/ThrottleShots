import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { createAdminClient } from "@/lib/supabase-admin";

function createWatermarkSvg(width: number, height: number): string {
  const fontSize = Math.floor(Math.min(width, height) / 7);
  const attrs = `text-anchor="middle" dominant-baseline="middle" font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="bold" fill="rgba(255,255,255,0.55)"`;

  const positions = [
    { x: width * 0.5, y: height * 0.2 },
    { x: width * 0.2, y: height * 0.4 },
    { x: width * 0.8, y: height * 0.4 },
    { x: width * 0.5, y: height * 0.6 },
    { x: width * 0.2, y: height * 0.8 },
    { x: width * 0.8, y: height * 0.8 },
  ];

  const texts = positions
    .map(
      ({ x, y }) =>
        `<text x="${x}" y="${y}" ${attrs} transform="rotate(-30,${x},${y})">THROTTLESHOTS</text>`
    )
    .join("");

  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">${texts}</svg>`;
}

function createThumbnailWatermarkSvg(width: number, height: number): string {
  const fontSize = Math.floor(Math.min(width, height) / 5);
  const attrs = `text-anchor="middle" dominant-baseline="middle" font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="bold" fill="rgba(255,255,255,0.60)"`;

  const positions = [
    { x: width * 0.5, y: height * 0.25 },
    { x: width * 0.5, y: height * 0.55 },
    { x: width * 0.5, y: height * 0.8 },
  ];

  const texts = positions
    .map(
      ({ x, y }) =>
        `<text x="${x}" y="${y}" ${attrs} transform="rotate(-30,${x},${y})">THROTTLESHOTS</text>`
    )
    .join("");

  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">${texts}</svg>`;
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

    // 1. Generate watermarked version (heavy watermark)
    const watermarkSvg = createWatermarkSvg(width, height);
    const watermarked = await sharp(buffer)
      .composite([
        {
          input: Buffer.from(watermarkSvg),
          top: 0,
          left: 0,
        },
      ])
      .jpeg({ quality: 85 })
      .toBuffer();

    // 2. Generate thumbnail WITH watermark
    const thumbWidth = 400;
    const thumbHeight = 300;
    const thumbBase = await sharp(buffer)
      .resize(thumbWidth, thumbHeight, { fit: "cover" })
      .jpeg({ quality: 75 })
      .toBuffer();

    const thumbWatermarkSvg = createThumbnailWatermarkSvg(
      thumbWidth,
      thumbHeight
    );
    const thumbnail = await sharp(thumbBase)
      .composite([
        {
          input: Buffer.from(thumbWatermarkSvg),
          top: 0,
          left: 0,
        },
      ])
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

    return NextResponse.json({ photo });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}