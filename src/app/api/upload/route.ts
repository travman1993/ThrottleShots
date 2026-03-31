import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function createWatermarkSvg(width: number, height: number): string {
  const fontSize = Math.floor(width / 10);
  const rows = 5;
  const spacing = height / (rows + 1);

  let texts = "";
  for (let i = 1; i <= rows; i++) {
    texts += `
      <text
        x="50%" y="${i * spacing}"
        text-anchor="middle"
        dominant-baseline="middle"
        transform="rotate(-30, ${width / 2}, ${i * spacing})"
        class="wm"
      >THROTTLESHOTS</text>
    `;
  }

  return `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <style>
        .wm {
          fill: rgba(255, 255, 255, 0.35);
          font-family: Arial, Helvetica, sans-serif;
          font-size: ${fontSize}px;
          font-weight: 900;
          letter-spacing: 0.15em;
        }
      </style>
      ${texts}
    </svg>
  `;
}

function createThumbnailWatermarkSvg(width: number, height: number): string {
  const fontSize = Math.floor(width / 6);

  return `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <style>
        .wm {
          fill: rgba(255, 255, 255, 0.4);
          font-family: Arial, Helvetica, sans-serif;
          font-size: ${fontSize}px;
          font-weight: 900;
          letter-spacing: 0.1em;
        }
      </style>
      <text
        x="50%" y="40%"
        text-anchor="middle"
        dominant-baseline="middle"
        transform="rotate(-30, ${width / 2}, ${height * 0.4})"
        class="wm"
      >THROTTLE</text>
      <text
        x="50%" y="65%"
        text-anchor="middle"
        dominant-baseline="middle"
        transform="rotate(-30, ${width / 2}, ${height * 0.65})"
        class="wm"
      >SHOTS</text>
    </svg>
  `;
}

export async function POST(req: NextRequest) {
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