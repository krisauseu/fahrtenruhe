/**
 * Reine Domain-Invarianten Kund:in / Projekt (ohne I/O).
 * Lokal und dünn. Zettelruhe-Kontaktnummer ist optionaler Merker, kein Live-Abgleich.
 */

import type { KundeInput, ProjektInput } from "./types";

export const NAME_MAX = 200;
export const ZETTELRUHE_ID_MAX = 40;
export const ZETTELRUHE_KONTAKTNUMMER_MAX = 32;

export const NAME_PFLICHT_ERROR = "Name ist erforderlich.";

export const KUNDE_PFLICHT_ERROR = "Kund:in ist erforderlich.";

export const ZETTELRUHE_ID_ZU_LANG_ERROR = `Zettelruhe-Id ist zu lang (max. ${ZETTELRUHE_ID_MAX} Zeichen).`;

export const ZETTELRUHE_KONTAKTNUMMER_ZU_LANG_ERROR = `Zettelruhe-Kontaktnummer ist zu lang (max. ${ZETTELRUHE_KONTAKTNUMMER_MAX} Zeichen).`;

export const KONTAKTNUMMER_DOPPELT_ERROR =
  "Diese Zettelruhe-Kontaktnummer ist bereits vergeben.";

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

/** Leere Nummer wird null. Kein Prefix-Zwang, kein Live-Lookup. */
export function normalizeKontaktnummer(
  raw: string | null | undefined,
): string | null {
  const t = (raw ?? "").trim();
  if (!t) return null;
  if (t.length > ZETTELRUHE_KONTAKTNUMMER_MAX) {
    throw new Error(ZETTELRUHE_KONTAKTNUMMER_ZU_LANG_ERROR);
  }
  return t;
}

export function isDuplicateKontaktnummerError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return (
    /zettelruhe_kontaktnummer/i.test(msg) &&
    (/unique/i.test(msg) || /bereits/i.test(msg))
  );
}

export function validateKundeInput(input: {
  name: string;
  zettelruhe_kontaktnummer?: string | null;
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
    zettelruhe_kontaktnummer: normalizeKontaktnummer(
      input.zettelruhe_kontaktnummer,
    ),
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
