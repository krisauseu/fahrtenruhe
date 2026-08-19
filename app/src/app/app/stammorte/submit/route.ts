import { requireFirmaSession } from "@/lib/session";
import { KEINE_AENDERUNG_ERROR } from "@/modules/platform/rechte";
import { upsertStammort } from "@/modules/places";
import {
  formStr,
  originGuard,
  seeOther,
  seeOtherWith,
} from "@/lib/form-post";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const denied = originGuard(request, "/app/stammorte");
  if (denied) return denied;

  let session;
  try {
    session = await requireFirmaSession();
  } catch {
    return seeOther("/login");
  }

  const formData = await request.formData();
  const art = formStr(formData, "art") || "wohnung";

  if (!session.kannSchreiben) {
    return seeOtherWith("/app/stammorte", {
      error: KEINE_AENDERUNG_ERROR,
      art,
    });
  }

  try {
    await upsertStammort(session.firmaId, {
      art,
      bezeichnung: formStr(formData, "bezeichnung"),
      strasse: formStr(formData, "strasse"),
      plz: formStr(formData, "plz"),
      ort: formStr(formData, "ort"),
    });
    return seeOtherWith("/app/stammorte", { gespeichert: "1", art });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Speichern fehlgeschlagen.";
    return seeOtherWith("/app/stammorte", { error: msg, art });
  }
}
