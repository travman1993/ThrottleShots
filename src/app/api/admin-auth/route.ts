import { NextRequest, NextResponse } from "next/server";

// Simple in-memory rate limiter: 5 attempts per 15 minutes per IP
const attemptMap = new Map<string, { count: number; resetAt: number }>();

function getClientIP(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = attemptMap.get(ip);

  if (!record || now > record.resetAt) {
    attemptMap.set(ip, { count: 1, resetAt: now + 15 * 60 * 1000 });
    return false;
  }

  if (record.count >= 5) return true;

  record.count++;
  return false;
}

function clearAttempts(ip: string): void {
  attemptMap.delete(ip);
}

export async function POST(req: NextRequest) {
  const ip = getClientIP(req);

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many attempts. Try again in 15 minutes." },
      { status: 429 }
    );
  }

  try {
    const { password } = await req.json();

    if (password === process.env.ADMIN_PASSWORD) {
      clearAttempts(ip);
      const response = NextResponse.json({ success: true });
      response.cookies.set("admin_auth", "true", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24, // 24 hours
        path: "/",
      });
      return response;
    }

    return NextResponse.json(
      { error: "Invalid password" },
      { status: 401 }
    );
  } catch {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}
