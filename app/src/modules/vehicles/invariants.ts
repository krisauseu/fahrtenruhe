/**
 * Reine Domain-Invarianten des Fahrzeugs (ohne I/O).
 * Keine 1-%-Felder, kein Listenpreis, kein Hubraum (ADR-0009).
 */

import { isoDatumInBerlin } from "@/lib/berlin-datum";
import type { Fahrzeug, NeuesFahrzeugInput } from "./types";

export const KENNZEICHEN_MAX = 20;

export const KILOMETERSTAND_GANZZAHL_ERROR =
  "Der Kilometerstand muss in ganzen Kilometern angegeben werden. Nachkommastellen werden nicht still gerundet.";

export const KILOMETERSTAND_NEGATIV_ERROR =
  "Der Kilometerstand darf nicht negativ sein.";

export const KILOMETERSTAND_PFLICHT_ERROR =
  "Eröffnungs-Kilometerstand ist erforderlich.";

export const KENNZEICHEN_PFLICHT_ERROR = "Kennzeichen ist erforderlich.";

export const FAHRZEUG_LOESCHEN_VERBOTEN_ERROR =
  "Ein Fahrzeug wird außer Betrieb gelegt, nicht gelöscht.";

const GANZE_ZAHL = /^\d+$/;

export function normalizeKennzeichen(raw: string): string {
  return (raw ?? "").trim().replace(/\s+/g, " ").toUpperCase();
}

/**
 * Ganze Kilometer. Nachkommastellen (Punkt oder Komma) werden abgelehnt,
 * nicht gerundet (ADR-0019).
 */
export function parseGanzzahligerKilometerstand(
  raw: string | number,
): number {
  if (typeof raw === "number") {
    if (!Number.isFinite(raw) || !Number.isInteger(raw)) {
      throw new Error(KILOMETERSTAND_GANZZAHL_ERROR);
    }
    if (raw < 0) {
      throw new Error(KILOMETERSTAND_NEGATIV_ERROR);
    }
    if (!Number.isSafeInteger(raw)) {
      throw new Error(KILOMETERSTAND_GANZZAHL_ERROR);
    }
    return raw;
  }

  const trimmed = (raw ?? "").trim();
  if (!trimmed) {
    throw new Error(KILOMETERSTAND_PFLICHT_ERROR);
  }
  if (/^-/.test(trimmed)) {
    throw new Error(KILOMETERSTAND_NEGATIV_ERROR);
  }
  if (/[.,]/.test(trimmed) || !GANZE_ZAHL.test(trimmed)) {
    throw new Error(KILOMETERSTAND_GANZZAHL_ERROR);
  }
  const n = Number(trimmed);
  if (!Number.isSafeInteger(n)) {
    throw new Error(KILOMETERSTAND_GANZZAHL_ERROR);
  }
  return n;
}

export function parseOptionalInbetriebnahme(
  raw: string,
  heuteIso: string = isoDatumInBerlin(),
): string | null {
  const t = (raw ?? "").trim();
  if (!t) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(t)) {
    throw new Error(
      "Inbetriebnahme muss ein Datum im Format JJJJ-MM-TT sein.",
    );
  }
  const year = Number(t.slice(0, 4));
  const month = Number(t.slice(5, 7));
  const day = Number(t.slice(8, 10));
  const dt = new Date(Date.UTC(year, month - 1, day));
  if (
    dt.getUTCFullYear() !== year ||
    dt.getUTCMonth() !== month - 1 ||
    dt.getUTCDate() !== day
  ) {
    throw new Error("Inbetriebnahme ist kein gültiges Datum.");
  }
  if (t > heuteIso) {
    throw new Error("Inbetriebnahme darf nicht in der Zukunft liegen.");
  }
  return t;
}

export function validateNeuesFahrzeugInput(input: {
  kennzeichen: string;
  eroeffnungs_kilometerstand: string | number;
  inbetriebnahme_am?: string | null;
}): NeuesFahrzeugInput {
  const kennzeichen = normalizeKennzeichen(input.kennzeichen);
  if (!kennzeichen) {
    throw new Error(KENNZEICHEN_PFLICHT_ERROR);
  }
  if (kennzeichen.length > KENNZEICHEN_MAX) {
    throw new Error(
      `Kennzeichen ist zu lang (max. ${KENNZEICHEN_MAX} Zeichen).`,
    );
  }

  return {
    kennzeichen,
    eroeffnungs_kilometerstand: parseGanzzahligerKilometerstand(
      input.eroeffnungs_kilometerstand,
    ),
    inbetriebnahme_am: parseOptionalInbetriebnahme(
      input.inbetriebnahme_am ?? "",
    ),
  };
}

/** Kennzeichen ist der Name; die id bleibt unangetastet (ADR-0009). */
export function withKennzeichen(
  fahrzeug: Fahrzeug,
  kennzeichen: string,
): Fahrzeug {
  const next = normalizeKennzeichen(kennzeichen);
  if (!next) {
    throw new Error(KENNZEICHEN_PFLICHT_ERROR);
  }
  return { ...fahrzeug, kennzeichen: next };
}

export function withAusserBetrieb(
  fahrzeug: Fahrzeug,
  ausserBetrieb: boolean,
): Fahrzeug {
  return { ...fahrzeug, ausser_betrieb: ausserBetrieb };
}

export function fahrzeugDarfGeloeschtWerden(): false {
  return false;
}

export function ablehnenFahrzeugLoeschen(): never {
  throw new Error(FAHRZEUG_LOESCHEN_VERBOTEN_ERROR);
}
