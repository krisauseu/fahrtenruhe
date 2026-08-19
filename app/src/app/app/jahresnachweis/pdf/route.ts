/**
 * Jahresnachweis-PDF — Route nicht unter /api/* (Caddy → PB).
 * Das PDF *ist* das Buch (inklusive Korrekturspur).
 */

import { jahresnachweisDateiname } from "@/modules/reporting";
import { renderJahresnachweisPdf } from "@/modules/reporting/pdf";
import {
  istDownloadFehler,
  jahresnachweisFuerDownload,
} from "@/modules/reporting/download";
import {
  downloadRouteErrorResponse,
  nextPdfResponse,
} from "@/modules/reporting/pdf-http";

export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<Response> {
  const geladen = await jahresnachweisFuerDownload(request);
  if (istDownloadFehler(geladen)) return geladen;

  try {
    const buf = await renderJahresnachweisPdf(geladen.nachweis);
    const filename = jahresnachweisDateiname({
      art: "pdf",
      umfang: "buch",
      kennzeichen: geladen.nachweis.fahrzeug.kennzeichen,
      jahr: geladen.nachweis.buchjahr,
    });
    return nextPdfResponse(buf, filename);
  } catch (e) {
    return downloadRouteErrorResponse(e);
  }
}
