/**
 * Reine Domain-Invarianten Kund:in / Projekt (ohne I/O).
 * Lokal und dünn. Zettelruhe-Ids sind optionale Merker, kein Live-Abgleich.
 */

import type { KundeInput, ProjektInput } from "./types";

export const NAME_MAX = 200;
export const ZETTELRUHE_ID_MAX = 40;

export const NAME_PFLICHT_ERROR = "Name ist erforderlich.";

export const KUNDE_PFLICHT_ERROR = "Kund:in ist erforderlich.";

export const ZETTELRUHE_ID_ZU_LANG_ERROR = `Zettelruhe-Id ist zu lang (max. ${ZETTELRUHE_ID_MAX} Zeichen).`;

export function normalizeName(raw: string): string {
  return (raw ?? "").trim().replace(/\s+/g, " ");
}

/** Leerer Merker wird null. Kein Formatcheck, kein Live-Lookup. */
export function normalizeZettelruheId(raw: string | null | undefined): string | null {
  const t = (raw ?? "").trim();
  if (!t) return null;
  if (t.length > ZETTELRUHE_ID_MAX) {
    throw new Error(ZETTELRUHE_ID_ZU_LANG_ERROR);
  }
  return t;
}

export function validateKundeInput(input: {
  name: string;
  zettelruhe_kontakt_id?: string | null;
}): KundeInput {
  const name = normalizeName(input.name);
  if (!name) {
    throw new Error(NAME_PFLICHT_ERROR);
  }
  if (name.length > NAME_MAX) {
    throw new Error(`Name ist zu lang (max. ${NAME_MAX} Zeichen).`);
  }
  return {
    name,
    zettelruhe_kontakt_id: normalizeZettelruheId(input.zettelruhe_kontakt_id),
  };
}

export function validateProjektInput(input: {
  kunde: string;
  name: string;
  zettelruhe_projekt_id?: string | null;
}): ProjektInput {
  const kunde = (input.kunde ?? "").trim();
  if (!kunde) {
    throw new Error(KUNDE_PFLICHT_ERROR);
  }
  const name = normalizeName(input.name);
  if (!name) {
    throw new Error(NAME_PFLICHT_ERROR);
  }
  if (name.length > NAME_MAX) {
    throw new Error(`Name ist zu lang (max. ${NAME_MAX} Zeichen).`);
  }
  return {
    kunde,
    name,
    zettelruhe_projekt_id: normalizeZettelruheId(input.zettelruhe_projekt_id),
  };
}
