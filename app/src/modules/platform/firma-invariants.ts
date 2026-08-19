/**
 * Reine Domain-Invarianten der Firma (ohne I/O).
 * Kein Steuer-Modus, kein SKR, kein Nummernkreis — das bleibt Zettelruhe.
 */

export const FIRMA_NAME_MAX = 200;

export const FIRMA_NAME_DOPPELT_ERROR =
  "Eine Firma mit diesem Namen existiert bereits.";

export type NeueFirmaInput = {
  name: string;
  strasse: string;
  plz: string;
  ort: string;
  land: string;
};

export function normalizeFirmaName(raw: string): string {
  return (raw ?? "").trim().replace(/\s+/g, " ");
}

export function isDuplicateFirmaNameError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return /name:.*unique/i.test(msg) || /value must be unique/i.test(msg);
}

export function validateNeueFirmaInput(input: {
  name: string;
  strasse?: string;
  plz?: string;
  ort?: string;
  land?: string;
}): NeueFirmaInput {
  const name = normalizeFirmaName(input.name);
  if (!name) {
    throw new Error("Name der Firma ist erforderlich.");
  }
  if (name.length > FIRMA_NAME_MAX) {
    throw new Error(`Name ist zu lang (max. ${FIRMA_NAME_MAX} Zeichen).`);
  }

  const land = (input.land ?? "DE").trim().toUpperCase() || "DE";
  if (land.length !== 2) {
    throw new Error("Land muss ein ISO-Code mit 2 Buchstaben sein.");
  }

  return {
    name,
    strasse: (input.strasse ?? "").trim(),
    plz: (input.plz ?? "").trim(),
    ort: (input.ort ?? "").trim(),
    land,
  };
}
