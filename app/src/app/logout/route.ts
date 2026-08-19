import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/session";
import { originIsAllowed } from "@/lib/origin";

export const dynamic = "force-dynamic";

async function logout(request?: Request) {
  if (request) {
    const allowed = originIsAllowed(
      request.headers.get("origin"),
      request.headers.get("referer"),
    );
    if (!allowed) {
      const appUrl = process.env.APP_URL || "http://localhost";
      return NextResponse.redirect(new URL("/app", appUrl), 303);
    }
  }
  await clearSessionCookie();
  const appUrl = process.env.APP_URL || "http://localhost";
  return NextResponse.redirect(new URL("/login", appUrl), 303);
}

export async function POST(request: Request) {
  return logout(request);
}

export async function GET() {
  return logout();
}
