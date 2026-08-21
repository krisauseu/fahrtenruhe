import { requireFirmaSession } from "@/lib/session";
import { KEINE_AENDERUNG_ERROR } from "@/modules/platform/rechte";
import { createKunde } from "@/modules/contacts";
import {
  formStr,
  originGuard,
  seeOther,
  seeOtherWith,
} from "@/lib/form-post";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const denied = originGuard(request, "/app/kunden/neu");
  if (denied) return denied;

  let session;
  try {
    session = await requireFirmaSession();
  } catch {
    return seeOther("/login");
  }
  if (!session.kannSchreiben) {
    return seeOtherWith("/app/kunden/neu", { error: KEINE_AENDERUNG_ERROR });
  }

  const formData = await request.formData();
  try {
    const kunde = await createKunde(session.firmaId, {
      name: formStr(formData, "name"),
      zettelruhe_kontaktnummer: formStr(formData, "zettelruhe_kontaktnummer"),
    });
    return seeOtherWith(`/app/kunden/${kunde.id}`, { gespeichert: "1" });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Anlegen fehlgeschlagen.";
    return seeOtherWith("/app/kunden/neu", { error: msg });
  }
}
