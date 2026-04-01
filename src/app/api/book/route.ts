import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { Resend } from "resend";

export async function POST(req: NextRequest) {
  const { name, email, phone, shoot_type, date, location, message } =
    await req.json();

  if (!name || !email || !shoot_type) {
    return NextResponse.json(
      { error: "Name, email, and shoot type are required." },
      { status: 400 }
    );
  }

  try {
    // Save to DB
    const supabase = createAdminClient();
    const { error: dbError } = await supabase.from("bookings").insert({
      name,
      email,
      phone: phone || null,
      shoot_type,
      date: date || null,
      location: location || null,
      message: message || null,
      status: "new",
    });

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    // Send email notification
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: "ThrottleShots <noreply@throttleshotsmedia.com>",
      to: "travisgolembiewski@gmail.com",
      subject: `New shoot request from ${name}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;background:#0a0a0a;color:#e5e5e5">
          <img src="https://throttleshotsmedia.com/logo-horizontal.png" alt="ThrottleShots" style="height:40px;margin-bottom:32px" />
          <h1 style="font-size:22px;color:#ffffff;margin-bottom:24px">New Shoot Request</h1>
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="padding:10px 0;border-bottom:1px solid #222;color:#a0a0a0;width:140px">Name</td><td style="padding:10px 0;border-bottom:1px solid #222;color:#ffffff">${name}</td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #222;color:#a0a0a0">Email</td><td style="padding:10px 0;border-bottom:1px solid #222"><a href="mailto:${email}" style="color:#E85D04">${email}</a></td></tr>
            ${phone ? `<tr><td style="padding:10px 0;border-bottom:1px solid #222;color:#a0a0a0">Phone</td><td style="padding:10px 0;border-bottom:1px solid #222;color:#ffffff">${phone}</td></tr>` : ""}
            <tr><td style="padding:10px 0;border-bottom:1px solid #222;color:#a0a0a0">Type</td><td style="padding:10px 0;border-bottom:1px solid #222;color:#ffffff">${shoot_type}</td></tr>
            ${date ? `<tr><td style="padding:10px 0;border-bottom:1px solid #222;color:#a0a0a0">Date</td><td style="padding:10px 0;border-bottom:1px solid #222;color:#ffffff">${date}</td></tr>` : ""}
            ${location ? `<tr><td style="padding:10px 0;border-bottom:1px solid #222;color:#a0a0a0">Location</td><td style="padding:10px 0;border-bottom:1px solid #222;color:#ffffff">${location}</td></tr>` : ""}
          </table>
          ${message ? `<div style="margin-top:20px;padding:16px;background:#111;border-radius:8px;color:#e5e5e5;font-size:14px;line-height:1.6">${message}</div>` : ""}
          <p style="margin-top:32px;font-size:12px;color:#666">
            View and manage all requests in the <a href="https://throttleshotsmedia.com/admin" style="color:#E85D04">ThrottleShots Admin</a>.
          </p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
