import { NextResponse } from "next/server";
import { createEigentuemer, createFirma, isSetupRequired } from "@/lib/pb";
import {
  originIsAllowed,
  UNGUELTIGE_HERKUNFT_ERROR,
} from "@/lib/origin";
import {
  FIRMA_NAME_DOPPELT_ERROR,
  isDuplicateFirmaNameError,
  validateNeueFirmaInput,
} from "@/modules/platform/firma-invariants";

export const dynamic = "force-dynamic";

function str(formData: FormData, key: string): string {
  const v = formData.get(key);
  return typeof v === "string" ? v.trim() : "";
}

export async function POST(request: Request) {
  const appUrl = process.env.APP_URL || "http://localhost";

  if (
    !originIsAllowed(
      request.headers.get("origin"),
      request.headers.get("referer"),
    )
  ) {
    return NextResponse.redirect(
      new URL(
        `/setup?error=${encodeURIComponent(UNGUELTIGE_HERKUNFT_ERROR)}`,
        appUrl,
      ),
      303,
    );
  }

  if (!(await isSetupRequired())) {
    return NextResponse.redirect(new URL("/login", appUrl), 303);
  }

  const formData = await request.formData();
  const name = str(formData, "name");
  const email = str(formData, "email");
  const password = str(formData, "password");
  const passwordConfirm = str(formData, "passwordConfirm");
  const firmaName = str(formData, "firmaName");
  const strasse = str(formData, "strasse");
  const plz = str(formData, "plz");
  const ort = str(formData, "ort");

  const fail = (msg: string) =>
    NextResponse.redirect(
      new URL(`/setup?error=${encodeURIComponent(msg)}`, appUrl),
      303,
    );

  if (!name || !email || !password || !firmaName) {
    return fail("Bitte alle Pflichtfelder ausfüllen.");
  }
  if (password.length < 8) {
    return fail("Passwort muss mindestens 8 Zeichen haben.");
  }
  if (password !== passwordConfirm) {
    return fail("Passwörter stimmen nicht überein.");
  }

  let firmaInput;
  try {
    firmaInput = validateNeueFirmaInput({
      name: firmaName,
      strasse,
      plz,
      ort,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Ungültige Firma.";
    return fail(msg);
  }

  try {
    const firma = await createFirma(firmaInput);
    await createEigentuemer({
      email,
      password,
      name,
      firmaId: firma.id,
    });
  } catch (e) {
    if (isDuplicateFirmaNameError(e)) {
      return fail(FIRMA_NAME_DOPPELT_ERROR);
    }
    const msg = e instanceof Error ? e.message : "Unbekannter Fehler.";
    return fail(`Setup fehlgeschlagen: ${msg}`);
  }

  return NextResponse.redirect(
    new URL(
      `/login?hinweis=${encodeURIComponent("Instanz eingerichtet. Bitte anmelden.")}`,
      appUrl,
    ),
    303,
  );
}
