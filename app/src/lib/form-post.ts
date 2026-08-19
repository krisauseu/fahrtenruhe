/**
 * Klassischer Form-POST hinter Caddy (wie Setup/Login).
 */

import { NextResponse } from "next/server";
import { originIsAllowed, UNGUELTIGE_HERKUNFT_ERROR } from "./origin";

export function appBaseUrl(): string {
  return process.env.APP_URL || "http://localhost";
}

export function formStr(formData: FormData, key: string): string {
  const v = formData.get(key);
  return typeof v === "string" ? v.trim() : "";
}

export function seeOther(path: string): NextResponse {
  return NextResponse.redirect(new URL(path, appBaseUrl()), 303);
}

export function seeOtherWith(
  path: string,
  params: Record<string, string>,
): NextResponse {
  const url = new URL(path, appBaseUrl());
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return NextResponse.redirect(url, 303);
}

export function originGuard(
  request: Request,
  failPath: string,
): NextResponse | null {
  if (
    originIsAllowed(
      request.headers.get("origin"),
      request.headers.get("referer"),
    )
  ) {
    return null;
  }
  return seeOtherWith(failPath, { error: UNGUELTIGE_HERKUNFT_ERROR });
}
