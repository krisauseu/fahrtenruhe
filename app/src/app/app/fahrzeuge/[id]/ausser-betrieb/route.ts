import { requireFirmaSession } from "@/lib/session";
import { KEINE_AENDERUNG_ERROR } from "@/modules/platform/rechte";
import { setFahrzeugAusserBetrieb } from "@/modules/vehicles";
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
  const flag = formStr(formData, "ausser_betrieb");
  const ausserBetrieb = flag !== "false";

  try {
    await setFahrzeugAusserBetrieb(session.firmaId, id, ausserBetrieb);
    return seeOtherWith(failPath, { gespeichert: "1" });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Speichern fehlgeschlagen.";
    return seeOtherWith(failPath, { error: msg });
  }
}
