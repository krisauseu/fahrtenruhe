import { requireFirmaSession } from "@/lib/session";
import { KEINE_AENDERUNG_ERROR } from "@/modules/platform/rechte";
import { createProjekt } from "@/modules/contacts";
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
  const failPath = `/app/kunden/${id}/projekte/neu`;
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
    const projekt = await createProjekt(session.firmaId, {
      kunde: id,
      name: formStr(formData, "name"),
      zettelruhe_projekt_id: formStr(formData, "zettelruhe_projekt_id"),
    });
    return seeOtherWith(`/app/kunden/${id}/projekte/${projekt.id}`, {
      gespeichert: "1",
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Anlegen fehlgeschlagen.";
    return seeOtherWith(failPath, { error: msg });
  }
}
