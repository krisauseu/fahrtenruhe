import { requireFirmaSession } from "@/lib/session";
import { KEINE_AENDERUNG_ERROR } from "@/modules/platform/rechte";
import { startFahrt } from "@/modules/trips";
import {
  formStr,
  originGuard,
  seeOther,
  seeOtherWith,
} from "@/lib/form-post";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const denied = originGuard(request, "/app");
  if (denied) return denied;

  let session;
  try {
    session = await requireFirmaSession();
  } catch {
    return seeOther("/login");
  }
  if (!session.kannSchreiben) {
    return seeOtherWith("/app", { error: KEINE_AENDERUNG_ERROR });
  }

  const formData = await request.formData();
  try {
    await startFahrt(session.firmaId, {
      fahrzeug: formStr(formData, "fahrzeug"),
      kilometerstand_start: formStr(formData, "kilometerstand_start"),
      nutzungstyp: formStr(formData, "nutzungstyp"),
      ziel: formStr(formData, "ziel"),
      zweck: formStr(formData, "zweck"),
      kunde: formStr(formData, "kunde"),
      projekt: formStr(formData, "projekt"),
      abrechnungsstatus: formStr(formData, "abrechnungsstatus"),
    });
    return seeOtherWith("/app", { gestartet: "1" });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Start fehlgeschlagen.";
    return seeOtherWith("/app", { error: msg });
  }
}
