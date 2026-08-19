import { requireFirmaSession } from "@/lib/session";
import { KEINE_AENDERUNG_ERROR } from "@/modules/platform/rechte";
import { uebernehmenFahrt } from "@/modules/trips";
import {
  formStr,
  originGuard,
  seeOther,
  seeOtherWith,
} from "@/lib/form-post";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const denied = originGuard(request, "/app/fahrten/uebernahme");
  if (denied) return denied;

  let session;
  try {
    session = await requireFirmaSession();
  } catch {
    return seeOther("/login");
  }
  if (!session.kannSchreiben) {
    return seeOtherWith("/app/fahrten/uebernahme", {
      error: KEINE_AENDERUNG_ERROR,
    });
  }

  const formData = await request.formData();
  const fahrzeug = formStr(formData, "fahrzeug");
  try {
    const { fahrt } = await uebernehmenFahrt(
      session.firmaId,
      {
        fahrzeug,
        datum: formStr(formData, "datum"),
        kilometerstand_start: formStr(formData, "kilometerstand_start"),
        kilometerstand_ende: formStr(formData, "kilometerstand_ende"),
        nutzungstyp: formStr(formData, "nutzungstyp"),
        ziel: formStr(formData, "ziel"),
        zweck: formStr(formData, "zweck"),
        kunde: formStr(formData, "kunde"),
        projekt: formStr(formData, "projekt"),
        abrechnungsstatus: formStr(formData, "abrechnungsstatus"),
        quelle: formStr(formData, "quelle"),
      },
      session.name || session.email,
    );
    return seeOtherWith(`/app/fahrten/${fahrt.id}`, { uebernommen: "1" });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Übernahme fehlgeschlagen.";
    return seeOtherWith("/app/fahrten/uebernahme", {
      error: msg,
      fahrzeug,
    });
  }
}
