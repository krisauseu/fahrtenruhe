import { requireFirmaSession } from "@/lib/session";
import { KEINE_AENDERUNG_ERROR } from "@/modules/platform/rechte";
import { importKundenAusCsv } from "@/modules/contacts";
import { originGuard, seeOther, seeOtherWith } from "@/lib/form-post";

export const dynamic = "force-dynamic";

const DATEI_PFLICHT_ERROR = "Bitte eine CSV-Datei wählen.";
const DATEI_ZU_GROSS_ERROR = "Die Datei ist zu groß (max. 1 MB).";
const MAX_BYTES = 1_000_000;

export async function POST(request: Request) {
  const denied = originGuard(request, "/app/kunden/import");
  if (denied) return denied;

  let session;
  try {
    session = await requireFirmaSession();
  } catch {
    return seeOther("/login");
  }
  if (!session.kannSchreiben) {
    return seeOtherWith("/app/kunden/import", { error: KEINE_AENDERUNG_ERROR });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return seeOtherWith("/app/kunden/import", { error: DATEI_PFLICHT_ERROR });
  }
  if (file.size > MAX_BYTES) {
    return seeOtherWith("/app/kunden/import", { error: DATEI_ZU_GROSS_ERROR });
  }

  try {
    const text = await file.text();
    const ergebnis = await importKundenAusCsv(session.firmaId, text);
    return seeOtherWith("/app/kunden/import", { gespeichert: ergebnis.text });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Import fehlgeschlagen.";
    return seeOtherWith("/app/kunden/import", { error: msg });
  }
}
