/**
 * Session und Parameter für Jahresnachweis-Downloads.
 * Keine Live-API.
 */

import { NextResponse } from "next/server";
import { getSession, requireFirmaSession } from "@/lib/session";
import {
  FAHRZEUG_PFLICHT_ERROR,
  parseJahresnachweisAnfrage,
  type Jahresnachweis,
} from "./jahresnachweis";
import { getJahresnachweisBlick } from "./repository";
import type { ExportUmfang } from "./types";

export async function jahresnachweisFuerDownload(request: Request): Promise<
  | { nachweis: Jahresnachweis; umfang: ExportUmfang }
  | NextResponse
> {
  const bare = await getSession();
  if (!bare) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  let firmaId: string;
  try {
    const session = await requireFirmaSession();
    firmaId = session.firmaId;
  } catch {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const url = new URL(request.url);
  const parsed = parseJahresnachweisAnfrage({
    fahrzeug: url.searchParams.get("fahrzeug") ?? undefined,
    jahr: url.searchParams.get("jahr") ?? undefined,
    umfang: url.searchParams.get("umfang") ?? undefined,
  });
  if (parsed.error) {
    return new NextResponse(parsed.error, { status: 400 });
  }
  if (!parsed.fahrzeug) {
    return new NextResponse(FAHRZEUG_PFLICHT_ERROR, { status: 400 });
  }

  const nachweis = await getJahresnachweisBlick(
    firmaId,
    parsed.fahrzeug,
    parsed.jahr,
  );
  if (!nachweis) {
    return new NextResponse("Fahrzeug nicht gefunden.", { status: 404 });
  }
  return { nachweis, umfang: parsed.umfang };
}

export function istDownloadFehler(
  value: { nachweis: Jahresnachweis; umfang: ExportUmfang } | NextResponse,
): value is NextResponse {
  return value instanceof NextResponse;
}
