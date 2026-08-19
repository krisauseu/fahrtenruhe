import { requireFirmaSession } from "@/lib/session";
import { KEINE_AENDERUNG_ERROR } from "@/modules/platform/rechte";
import { vervollstaendigenFahrt } from "@/modules/trips";
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
  try {
    await vervollstaendigenFahrt(session.firmaId, id, {
      nutzungstyp: formStr(formData, "nutzungstyp"),
      ziel: formStr(formData, "ziel"),
      zweck: formStr(formData, "zweck"),
      kunde: formStr(formData, "kunde"),
      projekt: formStr(formData, "projekt"),
      abrechnungsstatus: formStr(formData, "abrechnungsstatus"),
    });
    return seeOtherWith(failPath, { vervollstaendigt: "1" });
  } catch (e) {
    const msg =
      e instanceof Error ? e.message : "Vervollständigung fehlgeschlagen.";
    return seeOtherWith(failPath, { error: msg });
  }
}
