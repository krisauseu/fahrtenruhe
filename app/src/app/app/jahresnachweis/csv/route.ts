/**
 * Jahresnachweis-CSV — ganzes Buch oder nur abrechenbare Fahrten.
 * Datei-Export, keine Live-API. Route nicht unter /api/*.
 */

import {
  jahresnachweisDateiname,
  serializeJahresnachweisCsv,
} from "@/modules/reporting";
import {
  istDownloadFehler,
  jahresnachweisFuerDownload,
} from "@/modules/reporting/download";
import {
  downloadRouteErrorResponse,
  nextCsvResponse,
} from "@/modules/reporting/pdf-http";

export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<Response> {
  const geladen = await jahresnachweisFuerDownload(request);
  if (istDownloadFehler(geladen)) return geladen;

  try {
    const body = serializeJahresnachweisCsv(
      geladen.nachweis,
      geladen.umfang,
    );
    const filename = jahresnachweisDateiname({
      art: "csv",
      umfang: geladen.umfang,
      kennzeichen: geladen.nachweis.fahrzeug.kennzeichen,
      jahr: geladen.nachweis.buchjahr,
    });
    return nextCsvResponse(body, filename);
  } catch (e) {
    return downloadRouteErrorResponse(e);
  }
}
