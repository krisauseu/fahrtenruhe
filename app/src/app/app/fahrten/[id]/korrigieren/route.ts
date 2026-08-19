import { requireFirmaSession } from "@/lib/session";
import { KEINE_AENDERUNG_ERROR } from "@/modules/platform/rechte";
import { korrigierenFahrt } from "@/modules/trips";
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
  const failPath = `/app/fahrten/${id}`;
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
  const endeRoh = formData.get("kilometerstand_ende");
  try {
    await korrigierenFahrt(
      session.firmaId,
      id,
      {
        nutzungstyp: formStr(formData, "nutzungstyp"),
        ziel: formStr(formData, "ziel"),
        zweck: formStr(formData, "zweck"),
        kunde: formStr(formData, "kunde"),
        projekt: formStr(formData, "projekt"),
        abrechnungsstatus: formStr(formData, "abrechnungsstatus"),
        kilometerstand_start: formStr(formData, "kilometerstand_start"),
        ...(typeof endeRoh === "string"
          ? { kilometerstand_ende: endeRoh }
          : {}),
      },
      session.name || session.email,
    );
    return seeOtherWith(failPath, { korrigiert: "1" });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Korrektur fehlgeschlagen.";
    return seeOtherWith(failPath, { error: msg });
  }
}
