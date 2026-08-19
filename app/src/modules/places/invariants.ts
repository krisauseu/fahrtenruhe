/**
 * Reine Domain-Invarianten der Stammorte (ohne I/O).
 * Gehören zur Firma, nicht zum Fahrzeug. Gleichheit ist erlaubt (ADR-0011).
 */

import {
  STAMMORT_ARTEN,
  type StammortArt,
  type StammortInput,
} from "./types";

export const BEZEICHNUNG_MAX = 120;

export const WOHNUNG_DOPPELT_ERROR =
  "Je Firma gibt es höchstens eine Wohnung.";

export const TAETIGKEITSSTAETTE_DOPPELT_ERROR =
  "Je Firma gibt es höchstens eine erste Tätigkeitsstätte.";

export const BEZEICHNUNG_PFLICHT_ERROR = "Bezeichnung ist erforderlich.";

export const STAMMORT_ART_UNGUELTIG_ERROR = "Stammort-Art ist ungültig.";

export function isStammortArt(value: string): value is StammortArt {
  return (STAMMORT_ARTEN as readonly string[]).includes(value);
}

export function normalizeAnschriftTeil(raw: string): string {
  return (raw ?? "").trim().replace(/\s+/g, " ");
}

export function anschriftSchluessel(input: {
  strasse: string;
  plz: string;
  ort: string;
}): string {
  return [
    normalizeAnschriftTeil(input.strasse).toLowerCase(),
    normalizeAnschriftTeil(input.plz).toLowerCase(),
    normalizeAnschriftTeil(input.ort).toLowerCase(),
  ].join("|");
}

/**
 * Gleichheit der Anschriften — persistierte Felder, damit BA3 den
 * Nutzungstyp Wohnung–Tätigkeitsstätte nur bei Verschiedenheit anbietet.
 */
export function stammorteSindGleich(
  a: { strasse: string; plz: string; ort: string } | null | undefined,
  b: { strasse: string; plz: string; ort: string } | null | undefined,
): boolean {
  if (!a || !b) return false;
  return anschriftSchluessel(a) === anschriftSchluessel(b);
}

export function validateStammortInput(input: {
  art: string;
  bezeichnung: string;
  strasse?: string;
  plz?: string;
  ort?: string;
}): StammortInput {
  if (!isStammortArt(input.art)) {
    throw new Error(STAMMORT_ART_UNGUELTIG_ERROR);
  }
  const bezeichnung = normalizeAnschriftTeil(input.bezeichnung);
  if (!bezeichnung) {
    throw new Error(BEZEICHNUNG_PFLICHT_ERROR);
  }
  if (bezeichnung.length > BEZEICHNUNG_MAX) {
    throw new Error(
      `Bezeichnung ist zu lang (max. ${BEZEICHNUNG_MAX} Zeichen).`,
    );
  }

  return {
    art: input.art,
    bezeichnung,
    strasse: normalizeAnschriftTeil(input.strasse ?? ""),
    plz: normalizeAnschriftTeil(input.plz ?? ""),
    ort: normalizeAnschriftTeil(input.ort ?? ""),
  };
}

export function assertKeineZweiteArt(
  bestehende: { id?: string; art: StammortArt }[],
  art: StammortArt,
  aktuelleId?: string,
): void {
  const konflikt = bestehende.find(
    (s) => s.art === art && s.id !== aktuelleId,
  );
  if (!konflikt) return;
  throw new Error(
    art === "wohnung"
      ? WOHNUNG_DOPPELT_ERROR
      : TAETIGKEITSSTAETTE_DOPPELT_ERROR,
  );
}

export function isDuplicateStammortArtError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return /unique/i.test(msg) || /value must be unique/i.test(msg);
}
