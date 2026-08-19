import { requireFirmaSession } from "@/lib/session";
import { KEINE_AENDERUNG_ERROR } from "@/modules/platform/rechte";
import { schliessenFahrt } from "@/modules/trips";
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
  const formData = await request.formData();
  const aufErfassung = formStr(formData, "zurueck") === "/app";
  const failPath = aufErfassung ? "/app" : `/app/fahrten/${id}`;
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

  try {
    await schliessenFahrt(
      session.firmaId,
      id,
      {
        kilometerstand_ende: formStr(formData, "kilometerstand_ende"),
      },
      session.name || session.email,
    );
    return seeOtherWith(failPath, { geschlossen: "1" });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Schließen fehlgeschlagen.";
    return seeOtherWith(failPath, { error: msg });
  }
}
