/**
 * Jahresnachweis-JSON — ganzes Buch oder nur abrechenbare Fahrten.
 * Datei-Export, keine Live-API. Route nicht unter /api/*.
 */

import {
  jahresnachweisDateiname,
  serializeJahresnachweisJson,
} from "@/modules/reporting";
import {
  istDownloadFehler,
  jahresnachweisFuerDownload,
} from "@/modules/reporting/download";
import {
  downloadRouteErrorResponse,
  nextJsonResponse,
} from "@/modules/reporting/pdf-http";

export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<Response> {
  const geladen = await jahresnachweisFuerDownload(request);
  if (istDownloadFehler(geladen)) return geladen;

  try {
    const body = serializeJahresnachweisJson(
      geladen.nachweis,
      geladen.umfang,
    );
    const filename = jahresnachweisDateiname({
      art: "json",
      umfang: geladen.umfang,
      kennzeichen: geladen.nachweis.fahrzeug.kennzeichen,
      jahr: geladen.nachweis.buchjahr,
    });
    return nextJsonResponse(body, filename);
  } catch (e) {
    return downloadRouteErrorResponse(e);
  }
}
