/**
 * HTTP-Antworten für den Jahresnachweis. Route unter /app/..., nicht /api.
 */

import { NextResponse } from "next/server";

function safeFilename(filename: string): string {
  return filename.replace(/"/g, "");
}

export function nextPdfResponse(
  body: ArrayBuffer | Buffer,
  filename: string,
): NextResponse {
  const bytes = Uint8Array.from(
    body instanceof ArrayBuffer ? new Uint8Array(body) : body,
  );
  return new NextResponse(bytes, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${safeFilename(filename)}"`,
      "Cache-Control": "private, no-store",
    },
  });
}

export function nextCsvResponse(body: string, filename: string): NextResponse {
  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${safeFilename(filename)}"`,
      "Cache-Control": "private, no-store",
    },
  });
}

export function nextJsonResponse(body: string, filename: string): NextResponse {
  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="${safeFilename(filename)}"`,
      "Cache-Control": "private, no-store",
    },
  });
}

export function downloadRouteErrorResponse(e: unknown): NextResponse {
  const msg = e instanceof Error ? e.message : "Export nicht verfügbar.";
  if (msg.includes("nicht gefunden")) {
    return new NextResponse("Nicht gefunden", { status: 404 });
  }
  return new NextResponse(msg, { status: 400 });
}
