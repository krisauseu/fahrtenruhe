import { requireFirmaSession } from "@/lib/session";
import { KEINE_AENDERUNG_ERROR } from "@/modules/platform/rechte";
import { createFahrzeug } from "@/modules/vehicles";
import {
  formStr,
  originGuard,
  seeOther,
  seeOtherWith,
} from "@/lib/form-post";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const denied = originGuard(request, "/app/fahrzeuge/neu");
  if (denied) return denied;

  let session;
  try {
    session = await requireFirmaSession();
  } catch {
    return seeOther("/login");
  }
  if (!session.kannSchreiben) {
    return seeOtherWith("/app/fahrzeuge/neu", { error: KEINE_AENDERUNG_ERROR });
  }

  const formData = await request.formData();
  try {
    const fahrzeug = await createFahrzeug(session.firmaId, {
      kennzeichen: formStr(formData, "kennzeichen"),
      eroeffnungs_kilometerstand: formStr(
        formData,
        "eroeffnungs_kilometerstand",
      ),
      inbetriebnahme_am: formStr(formData, "inbetriebnahme_am"),
    });
    return seeOtherWith(`/app/fahrzeuge/${fahrzeug.id}`, {
      gespeichert: "1",
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Anlegen fehlgeschlagen.";
    return seeOtherWith("/app/fahrzeuge/neu", { error: msg });
  }
}
