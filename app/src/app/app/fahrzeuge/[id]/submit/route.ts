import { requireFirmaSession } from "@/lib/session";
import { KEINE_AENDERUNG_ERROR } from "@/modules/platform/rechte";
import { updateFahrzeug } from "@/modules/vehicles";
import {
  formStr,
  originGuard,
  seeOther,
  seeOtherWith,
} from "@/lib/form-post";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const failPath = `/app/fahrzeuge/${id}`;
  const denied = originGuard(request, failPath);
  if (denied) return denied;

  let session;
  try {
    session = await requireFirmaSession();
  } catch {
    return seeOther("/login");
  }
  if (!session.kannSchreiben) {
    return seeOtherWith(failPath, { error: KEINE_AENDERUNG_ERROR });
  }

  const formData = await request.formData();
  try {
    await updateFahrzeug(session.firmaId, id, {
      kennzeichen: formStr(formData, "kennzeichen"),
      eroeffnungs_kilometerstand: formStr(
        formData,
        "eroeffnungs_kilometerstand",
      ),
      inbetriebnahme_am: formStr(formData, "inbetriebnahme_am"),
    });
    return seeOtherWith(failPath, { gespeichert: "1" });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Speichern fehlgeschlagen.";
    return seeOtherWith(failPath, { error: msg });
  }
}
