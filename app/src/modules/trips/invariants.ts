/**
 * Reine Domain-Invarianten der Fahrt (ohne I/O).
 * Eine offene Fahrt je Fahrzeug, keine stille Lücke, ganze km,
 * ein Nutzungstyp, Korrekturspur nach Mitternacht.
 */

import {
  ISO_DATUM_FORMAT_ERROR,
  isoDatumInBerlin,
  parseIsoKalenderdatum,
} from "@/lib/berlin-datum";
import {
  KILOMETERSTAND_GANZZAHL_ERROR,
  KILOMETERSTAND_PFLICHT_ERROR,
  parseGanzzahligerKilometerstand,
} from "@/modules/vehicles/invariants";
import {
  ABRECHNUNGSSTATI,
  NUTZUNGSTYPEN,
  type Abrechnungsstatus,
  type FahrtBuchfelder,
  type Nutzungstyp,
} from "./types";

export { KILOMETERSTAND_GANZZAHL_ERROR };

export const KILOMETERSTAND_START_PFLICHT_ERROR =
  "Kilometerstand am Start ist erforderlich.";

export const KILOMETERSTAND_ENDE_PFLICHT_ERROR =
  "Kilometerstand am Ende ist erforderlich.";

export const ENDE_VOR_START_ERROR =
  "Der Kilometerstand am Ende darf nicht unter dem Start-Kilometerstand liegen.";

export const LUECKE_ERROR =
  "Speichern ist blockiert: das ist eine Lücke. Das Ende der vorigen Fahrt muss der Start dieser Fahrt sein. Trage eine Zwischenfahrt nach oder erkläre den Stand per Korrekturspur.";

export const OFFENE_FAHRT_EXISTIERT_ERROR =
  "Pro Fahrzeug gibt es höchstens eine offene Fahrt.";

export const NUTZUNGSTYP_UNGUELTIG_ERROR =
  "Nutzungstyp ist ungültig. Zulässig: betrieblich, privat, Wohnung–Tätigkeitsstätte.";

export const WOHNUNG_TAETIGKEITSSTAETTE_NICHT_ANGEBOTEN_ERROR =
  "Wohnung–Tätigkeitsstätte ist nur wählbar, wenn Wohnung und erste Tätigkeitsstätte verschiedene Anschriften haben.";

export const ZWECK_BETRIEBLICH_PFLICHT_ERROR =
  "Bei betrieblich ohne Kund:in ist der Zweck Pflicht.";

export const ABRECHNUNGSSTATUS_UNGUELTIG_ERROR =
  "Abrechnungsstatus ist ungültig. Zulässig: abrechenbar, nicht abrechenbar, abgerechnet.";

export const ABRECHENBAR_NUR_MIT_KUNDE_ERROR =
  "Abrechenbar nur mit gesetzter Kund:in.";

export const ABGERECHNET_NUR_IMPORT_ERROR =
  "v1 setzt nicht selbst auf abgerechnet.";

export const PROJEKT_OHNE_KUNDE_ERROR =
  "Ein Projekt braucht eine Kund:in.";

export const PROJEKT_PASST_NICHT_ERROR =
  "Das Projekt gehört nicht zu dieser Kund:in.";

export const KUNDE_NICHT_GEFUNDEN_ERROR = "Kund:in nicht gefunden.";

export const PROJEKT_NICHT_GEFUNDEN_ERROR = "Projekt nicht gefunden.";

export const NUR_KORREKTURSPUR_ERROR =
  "Nach Mitternacht nur noch mit sichtbarer Korrekturspur.";

export const FAHRT_BEREITS_GESCHLOSSEN_ERROR =
  "Die Fahrt ist bereits geschlossen.";

export const FAHRT_NOCH_OFFEN_ERROR =
  "Die Fahrt ist noch offen — zuerst schließen oder den End-Kilometerstand setzen.";

export const FAHRZEUG_AUSSER_BETRIEB_ERROR =
  "Für ein Fahrzeug außer Betrieb kann keine Fahrt gestartet werden.";

export const FAHRT_LOESCHEN_VERBOTEN_ERROR =
  "Eine Fahrt wird korrigiert, nicht gelöscht.";

export const WIEDER_OEFFNEN_VERBOTEN_ERROR =
  "Eine geschlossene Fahrt wird nicht wieder geöffnet. Korrigiere den End-Kilometerstand.";

export const KEINE_AENDERUNG_ERROR = "Keine Änderung.";

export const DATUM_PFLICHT_ERROR = "Datum der Fahrt ist erforderlich.";

export const UEBERNAHME_ZUKUNFT_ERROR =
  "Eine Übernahme darf nicht in der Zukunft liegen.";

export const UEBERNAHME_VOR_INBETRIEBNAHME_ERROR =
  "Eine Übernahme darf nicht vor der Inbetriebnahme liegen.";

export const UEBERNAHME_VOR_VORIGER_ERROR =
  "Das Datum der Übernahme darf nicht vor der vorigen Fahrt liegen.";

export const UEBERNAHME_OFFEN_ERROR =
  "Eine Übernahme ist eine geschlossene Fahrt — Kilometerstand am Ende ist Pflicht.";

export const UEBERNAHME_QUELLE_MAX = 200;

export { ISO_DATUM_FORMAT_ERROR };

export const ZIEL_MAX = 200;
export const ZWECK_MAX = 500;

export function isNutzungstyp(value: string): value is Nutzungstyp {
  return (NUTZUNGSTYPEN as readonly string[]).includes(value);
}

export function isAbrechnungsstatus(
  value: string,
): value is Abrechnungsstatus {
  return (ABRECHNUNGSSTATI as readonly string[]).includes(value);
}

export function parseAbrechnungsstatus(raw: string): Abrechnungsstatus {
  const v = (raw ?? "").trim();
  if (!isAbrechnungsstatus(v)) {
    throw new Error(ABRECHNUNGSSTATUS_UNGUELTIG_ERROR);
  }
  return v;
}

/** Leere Formularwerte → null. */
export function normalizeOptionalId(raw: string | null | undefined): string | null {
  const t = (raw ?? "").trim();
  return t || null;
}

export function parseNutzungstyp(raw: string): Nutzungstyp {
  const v = (raw ?? "").trim();
  if (!isNutzungstyp(v)) {
    throw new Error(NUTZUNGSTYP_UNGUELTIG_ERROR);
  }
  return v;
}

/**
 * Wohnung–Tätigkeitsstätte nur, wenn beide Stammorte existieren
 * und die Anschriften verschieden sind (ADR-0011, stand.gleich).
 */
export function wohnungTaetigkeitsstaetteAnbieten(stand: {
  gleich: boolean;
  wohnung: unknown;
  erste_taetigkeitsstaette: unknown;
}): boolean {
  return Boolean(
    stand.wohnung && stand.erste_taetigkeitsstaette && !stand.gleich,
  );
}

export function angeboteneNutzungstypen(stand: {
  gleich: boolean;
  wohnung: unknown;
  erste_taetigkeitsstaette: unknown;
}): Nutzungstyp[] {
  if (wohnungTaetigkeitsstaetteAnbieten(stand)) {
    return [...NUTZUNGSTYPEN];
  }
  return ["betrieblich", "privat"];
}

export function assertNutzungstypErlaubt(
  nutzungstyp: Nutzungstyp,
  stand: {
    gleich: boolean;
    wohnung: unknown;
    erste_taetigkeitsstaette: unknown;
  },
): void {
  if (
    nutzungstyp === "wohnung_taetigkeitsstaette" &&
    !wohnungTaetigkeitsstaetteAnbieten(stand)
  ) {
    throw new Error(WOHNUNG_TAETIGKEITSSTAETTE_NICHT_ANGEBOTEN_ERROR);
  }
}

/** Persistiertes Ende: leer = offene Fahrt. "0" ist 0 km, nicht offen. */
export function mapPersistiertesEnde(raw: unknown): number | null {
  if (raw === null || raw === undefined) return null;
  if (typeof raw === "number") {
    if (!Number.isInteger(raw) || raw < 0) {
      throw new Error(KILOMETERSTAND_GANZZAHL_ERROR);
    }
    return raw;
  }
  const t = String(raw).trim();
  if (!t) return null;
  return parseFahrtKilometerstand(t, "ende");
}

export function persistiertesEnde(ende: number | null): string {
  return ende === null ? "" : String(ende);
}

export function parseFahrtKilometerstand(
  raw: string | number,
  welches: "start" | "ende",
): number {
  try {
    return parseGanzzahligerKilometerstand(raw);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg === KILOMETERSTAND_PFLICHT_ERROR) {
      throw new Error(
        welches === "start"
          ? KILOMETERSTAND_START_PFLICHT_ERROR
          : KILOMETERSTAND_ENDE_PFLICHT_ERROR,
      );
    }
    throw e;
  }
}

export function normalizeFahrtText(raw: string, max: number, feld: string): string {
  const t = (raw ?? "").trim().replace(/\s+/g, " ");
  if (t.length > max) {
    throw new Error(`${feld} ist zu lang (max. ${max} Zeichen).`);
  }
  return t;
}

export function assertZweckWennBetrieblich(
  nutzungstyp: Nutzungstyp,
  zweck: string,
  kunde: string | null = null,
): void {
  if (nutzungstyp === "betrieblich" && !(zweck ?? "").trim() && !kunde) {
    throw new Error(ZWECK_BETRIEBLICH_PFLICHT_ERROR);
  }
}

/**
 * Privat und Wohnung–Tätigkeitsstätte tragen keine Kund:in.
 * Bei betrieblich darf ein gesetztes Projekt die Kund:in nachziehen.
 */
export function resolveKundeUndProjekt(input: {
  nutzungstyp: Nutzungstyp;
  kunde: string | null;
  projekt: string | null;
  /** kunde-id des Projekts, wenn projekt gesetzt */
  projektGehoertZu?: string | null;
}): { kunde: string | null; projekt: string | null } {
  if (input.nutzungstyp !== "betrieblich") {
    return { kunde: null, projekt: null };
  }

  let kunde = input.kunde;
  const projekt = input.projekt;

  if (projekt) {
    const gehoertZu = (input.projektGehoertZu ?? "").trim() || null;
    if (!gehoertZu) {
      throw new Error(PROJEKT_NICHT_GEFUNDEN_ERROR);
    }
    if (!kunde) {
      kunde = gehoertZu;
    } else if (kunde !== gehoertZu) {
      throw new Error(PROJEKT_PASST_NICHT_ERROR);
    }
  }

  return { kunde, projekt };
}

/**
 * Default abrechenbar nur mit gesetzter Kund:in (ADR-0013).
 * v1 schreibt nicht selbst abgerechnet.
 */
export function resolveAbrechnungsstatus(input: {
  nutzungstyp: Nutzungstyp;
  kunde: string | null;
  explizit?: string | null;
  bisher?: Abrechnungsstatus | null;
  kontextGeaendert?: boolean;
}): Abrechnungsstatus {
  const explizitRaw = (input.explizit ?? "").trim();
  const explizit = explizitRaw ? parseAbrechnungsstatus(explizitRaw) : null;

  if (explizit === "abgerechnet") {
    throw new Error(ABGERECHNET_NUR_IMPORT_ERROR);
  }

  if (input.nutzungstyp !== "betrieblich") {
    return "nicht_abrechenbar";
  }

  if (explizit) {
    if (explizit === "abrechenbar" && !input.kunde) {
      throw new Error(ABRECHENBAR_NUR_MIT_KUNDE_ERROR);
    }
    return explizit;
  }

  if (input.bisher && !input.kontextGeaendert) {
    if (input.bisher === "abrechenbar" && !input.kunde) {
      return "nicht_abrechenbar";
    }
    return input.bisher;
  }

  return input.kunde ? "abrechenbar" : "nicht_abrechenbar";
}

export function defaultAbrechnungsstatus(input: {
  nutzungstyp: Nutzungstyp;
  kunde: string | null;
}): Abrechnungsstatus {
  return resolveAbrechnungsstatus(input);
}

export function validateStartInput(input: {
  kilometerstand_start: string | number;
  nutzungstyp: string;
  ziel?: string;
  zweck?: string;
  kunde?: string | null;
  projekt?: string | null;
  abrechnungsstatus?: string | null;
  stammorte: {
    gleich: boolean;
    wohnung: unknown;
    erste_taetigkeitsstaette: unknown;
  };
}): {
  kilometerstand_start: number;
  nutzungstyp: Nutzungstyp;
  ziel: string;
  zweck: string;
  kunde: string | null;
  projekt: string | null;
  abrechnungsstatus: string | null;
} {
  const nutzungstyp = parseNutzungstyp(input.nutzungstyp);
  assertNutzungstypErlaubt(nutzungstyp, input.stammorte);
  const ziel = normalizeFahrtText(input.ziel ?? "", ZIEL_MAX, "Ziel");
  const zweck = normalizeFahrtText(input.zweck ?? "", ZWECK_MAX, "Zweck");
  const kunde = normalizeOptionalId(input.kunde);
  const projekt = normalizeOptionalId(input.projekt);
  const abrechnungsstatus = (input.abrechnungsstatus ?? "").trim() || null;
  // Projekt ohne Kund:in zieht die Kund:in später nach (Repository).
  assertZweckWennBetrieblich(nutzungstyp, zweck, kunde ?? projekt);
  return {
    kilometerstand_start: parseFahrtKilometerstand(
      input.kilometerstand_start,
      "start",
    ),
    nutzungstyp,
    ziel,
    zweck,
    kunde,
    projekt,
    abrechnungsstatus,
  };
}

export function validateEndeInput(input: {
  kilometerstand_start: number;
  kilometerstand_ende: string | number;
}): number {
  const ende = parseFahrtKilometerstand(input.kilometerstand_ende, "ende");
  if (ende < input.kilometerstand_start) {
    throw new Error(ENDE_VOR_START_ERROR);
  }
  return ende;
}

export function validateAenderungInput(input: {
  nutzungstyp?: string;
  ziel?: string;
  zweck?: string;
  kilometerstand_start?: string | number;
  kilometerstand_ende?: string | number | null;
  kunde?: string | null;
  projekt?: string | null;
  abrechnungsstatus?: string | null;
  stammorte: {
    gleich: boolean;
    wohnung: unknown;
    erste_taetigkeitsstaette: unknown;
  };
}): {
  nutzungstyp?: Nutzungstyp;
  ziel?: string;
  zweck?: string;
  kilometerstand_start?: number;
  kilometerstand_ende?: number | null;
  kunde?: string | null;
  projekt?: string | null;
  abrechnungsstatus?: string | null;
} {
  const out: {
    nutzungstyp?: Nutzungstyp;
    ziel?: string;
    zweck?: string;
    kilometerstand_start?: number;
    kilometerstand_ende?: number | null;
    kunde?: string | null;
    projekt?: string | null;
    abrechnungsstatus?: string | null;
  } = {};

  if (input.nutzungstyp !== undefined) {
    const nutzungstyp = parseNutzungstyp(input.nutzungstyp);
    assertNutzungstypErlaubt(nutzungstyp, input.stammorte);
    out.nutzungstyp = nutzungstyp;
  }
  if (input.ziel !== undefined) {
    out.ziel = normalizeFahrtText(input.ziel, ZIEL_MAX, "Ziel");
  }
  if (input.zweck !== undefined) {
    out.zweck = normalizeFahrtText(input.zweck, ZWECK_MAX, "Zweck");
  }
  if (input.kilometerstand_start !== undefined) {
    out.kilometerstand_start = parseFahrtKilometerstand(
      input.kilometerstand_start,
      "start",
    );
  }
  if (input.kilometerstand_ende !== undefined) {
    if (input.kilometerstand_ende === null || input.kilometerstand_ende === "") {
      out.kilometerstand_ende = null;
    } else {
      out.kilometerstand_ende = parseFahrtKilometerstand(
        input.kilometerstand_ende,
        "ende",
      );
    }
  }
  if (input.kunde !== undefined) {
    out.kunde = normalizeOptionalId(input.kunde);
  }
  if (input.projekt !== undefined) {
    out.projekt = normalizeOptionalId(input.projekt);
  }
  if (input.abrechnungsstatus !== undefined) {
    out.abrechnungsstatus = (input.abrechnungsstatus ?? "").trim() || null;
  }
  return out;
}

export function istOffeneFahrt(fahrt: {
  kilometerstand_ende: number | null;
}): boolean {
  return fahrt.kilometerstand_ende === null;
}

export function erwarteterStartKilometerstand(
  eroeffnung: number,
  letzteGeschlossene: { kilometerstand_ende: number | null } | null,
): number {
  if (!letzteGeschlossene) return eroeffnung;
  if (letzteGeschlossene.kilometerstand_ende === null) {
    throw new Error(OFFENE_FAHRT_EXISTIERT_ERROR);
  }
  return letzteGeschlossene.kilometerstand_ende;
}

export function assertKeineLuecke(erwartet: number, start: number): void {
  if (erwartet !== start) {
    throw new Error(LUECKE_ERROR);
  }
}

export function assertKeineZweiteOffeneFahrt(hatOffene: boolean): void {
  if (hatOffene) {
    throw new Error(OFFENE_FAHRT_EXISTIERT_ERROR);
  }
}

export function brauchtKorrekturspur(
  fahrtDatum: string,
  jetzt: Date = new Date(),
): boolean {
  return isoDatumInBerlin(jetzt) !== fahrtDatum;
}

export function fahrtDarfGeloeschtWerden(): false {
  return false;
}

export function ablehnenFahrtLoeschen(): never {
  throw new Error(FAHRT_LOESCHEN_VERBOTEN_ERROR);
}

export function snapshotBuchfelder(fahrt: FahrtBuchfelder): FahrtBuchfelder {
  return {
    datum: fahrt.datum,
    kilometerstand_start: fahrt.kilometerstand_start,
    kilometerstand_ende: fahrt.kilometerstand_ende,
    nutzungstyp: fahrt.nutzungstyp,
    ziel: fahrt.ziel,
    zweck: fahrt.zweck,
    kunde: fahrt.kunde,
    projekt: fahrt.projekt,
    abrechnungsstatus: fahrt.abrechnungsstatus,
  };
}

export function snapshotsGleich(
  a: FahrtBuchfelder,
  b: FahrtBuchfelder,
): boolean {
  return JSON.stringify(snapshotBuchfelder(a)) === JSON.stringify(snapshotBuchfelder(b));
}

export function serializeBuchfelder(fahrt: FahrtBuchfelder): string {
  return JSON.stringify(snapshotBuchfelder(fahrt));
}

export function parseBuchfelder(raw: string): FahrtBuchfelder | null {
  try {
    const v = JSON.parse(raw) as Partial<FahrtBuchfelder>;
    if (!v || typeof v !== "object") return null;
    if (typeof v.datum !== "string") return null;
    if (typeof v.kilometerstand_start !== "number") return null;
    if (
      v.kilometerstand_ende !== null &&
      typeof v.kilometerstand_ende !== "number"
    ) {
      return null;
    }
    if (!isNutzungstyp(String(v.nutzungstyp ?? ""))) return null;
    const statusRaw = String(v.abrechnungsstatus ?? "");
    const abrechnungsstatus = isAbrechnungsstatus(statusRaw)
      ? statusRaw
      : "nicht_abrechenbar";
    return {
      datum: v.datum,
      kilometerstand_start: v.kilometerstand_start,
      kilometerstand_ende: v.kilometerstand_ende ?? null,
      nutzungstyp: v.nutzungstyp as Nutzungstyp,
      ziel: typeof v.ziel === "string" ? v.ziel : "",
      zweck: typeof v.zweck === "string" ? v.zweck : "",
      kunde: typeof v.kunde === "string" && v.kunde.trim() ? v.kunde : null,
      projekt:
        typeof v.projekt === "string" && v.projekt.trim() ? v.projekt : null,
      abrechnungsstatus,
    };
  } catch {
    return null;
  }
}

/**
 * Lückenlose Kette ab Pflichtstart (1. Januar oder Inbetriebnahme).
 * Erste Fahrt des Buchjahrs muss am Pflichtstart oder früher ansetzen
 * und am Eröffnungs-Kilometerstand beginnen. Offene letzte Fahrt ist zulässig.
 */
export function fahrtenKetteAbPflichtstart(input: {
  eroeffnungs_kilometerstand: number;
  pflichtstart: string;
  fahrten: Array<{
    datum: string;
    kilometerstand_start: number;
    kilometerstand_ende: number | null;
  }>;
}): boolean {
  const jahr = input.pflichtstart.slice(0, 4);
  const fahrten = input.fahrten.filter((f) => f.datum.startsWith(jahr));
  if (fahrten.length === 0) return false;

  const sorted = [...fahrten].sort(
    (a, b) => a.kilometerstand_start - b.kilometerstand_start,
  );
  const first = sorted[0];
  if (first.kilometerstand_start !== input.eroeffnungs_kilometerstand) {
    return false;
  }
  if (first.datum > input.pflichtstart) {
    return false;
  }

  for (let i = 0; i < sorted.length - 1; i++) {
    const cur = sorted[i];
    const next = sorted[i + 1];
    if (cur.kilometerstand_ende === null) return false;
    if (cur.kilometerstand_ende !== next.kilometerstand_start) return false;
  }
  return true;
}

export function applyAenderung(
  current: FahrtBuchfelder,
  patch: {
    nutzungstyp?: Nutzungstyp;
    ziel?: string;
    zweck?: string;
    kilometerstand_start?: number;
    kilometerstand_ende?: number | null;
    kunde?: string | null;
    projekt?: string | null;
    abrechnungsstatus?: Abrechnungsstatus;
  },
): FahrtBuchfelder {
  const next: FahrtBuchfelder = { ...current };
  if (patch.nutzungstyp !== undefined) next.nutzungstyp = patch.nutzungstyp;
  if (patch.ziel !== undefined) next.ziel = patch.ziel;
  if (patch.zweck !== undefined) next.zweck = patch.zweck;
  if (patch.kilometerstand_start !== undefined) {
    next.kilometerstand_start = patch.kilometerstand_start;
  }
  if (patch.kilometerstand_ende !== undefined) {
    next.kilometerstand_ende = patch.kilometerstand_ende;
  }
  if (patch.kunde !== undefined) next.kunde = patch.kunde;
  if (patch.projekt !== undefined) next.projekt = patch.projekt;
  if (patch.abrechnungsstatus !== undefined) {
    next.abrechnungsstatus = patch.abrechnungsstatus;
  }
  if (current.kilometerstand_ende !== null && next.kilometerstand_ende === null) {
    throw new Error(WIEDER_OEFFNEN_VERBOTEN_ERROR);
  }
  const ende = next.kilometerstand_ende;
  if (ende !== null && ende < next.kilometerstand_start) {
    throw new Error(ENDE_VOR_START_ERROR);
  }
  if (next.nutzungstyp !== "betrieblich") {
    next.kunde = null;
    next.projekt = null;
    next.abrechnungsstatus = "nicht_abrechenbar";
  }
  if (next.projekt && !next.kunde) {
    throw new Error(PROJEKT_OHNE_KUNDE_ERROR);
  }
  assertZweckWennBetrieblich(next.nutzungstyp, next.zweck, next.kunde);
  if (next.abrechnungsstatus === "abrechenbar" && !next.kunde) {
    throw new Error(ABRECHENBAR_NUR_MIT_KUNDE_ERROR);
  }
  return next;
}

export function parseBuchdatum(raw: string): string {
  const t = (raw ?? "").trim();
  if (!t) {
    throw new Error(DATUM_PFLICHT_ERROR);
  }
  return parseIsoKalenderdatum(t);
}

export function serializeUebernahmeVorher(quelle: string): string {
  return JSON.stringify({
    nicht_im_buch: true,
    quelle,
  });
}

export function parseUebernahmeVorher(
  raw: string,
): { quelle: string } | null {
  try {
    const v = JSON.parse(raw) as { nicht_im_buch?: unknown; quelle?: unknown };
    if (!v || typeof v !== "object" || v.nicht_im_buch !== true) {
      return null;
    }
    return {
      quelle: typeof v.quelle === "string" ? v.quelle : "",
    };
  } catch {
    return null;
  }
}

export function istUebernahmeSpur(spur: { vorher: string }): boolean {
  return parseUebernahmeVorher(spur.vorher) !== null;
}

/**
 * Geschlossene Fahrt aus Altbestand. Hängt an die Kette (Eröffnung oder
 * Ende der letzten Fahrt). Füllt keine Lücke, bleibt gekennzeichnet.
 */
export function validateUebernahmeInput(input: {
  datum: string;
  kilometerstand_start: string | number;
  kilometerstand_ende: string | number | null;
  nutzungstyp: string;
  ziel?: string;
  zweck?: string;
  kunde?: string | null;
  projekt?: string | null;
  abrechnungsstatus?: string | null;
  quelle?: string;
  stammorte: {
    gleich: boolean;
    wohnung: unknown;
    erste_taetigkeitsstaette: unknown;
  };
  inbetriebnahme_am: string | null;
  heuteIso: string;
  erwarteterStart: number;
  vorigeDatum: string | null;
  hatOffeneFahrt: boolean;
}): {
  datum: string;
  kilometerstand_start: number;
  kilometerstand_ende: number;
  nutzungstyp: Nutzungstyp;
  ziel: string;
  zweck: string;
  kunde: string | null;
  projekt: string | null;
  abrechnungsstatus: string | null;
  quelle: string;
} {
  assertKeineZweiteOffeneFahrt(input.hatOffeneFahrt);

  const datum = parseBuchdatum(input.datum);
  if (datum > input.heuteIso) {
    throw new Error(UEBERNAHME_ZUKUNFT_ERROR);
  }
  if (input.inbetriebnahme_am && datum < input.inbetriebnahme_am) {
    throw new Error(UEBERNAHME_VOR_INBETRIEBNAHME_ERROR);
  }
  if (input.vorigeDatum && datum < input.vorigeDatum) {
    throw new Error(UEBERNAHME_VOR_VORIGER_ERROR);
  }

  const start = validateStartInput({
    kilometerstand_start: input.kilometerstand_start,
    nutzungstyp: input.nutzungstyp,
    ziel: input.ziel,
    zweck: input.zweck,
    kunde: input.kunde,
    projekt: input.projekt,
    abrechnungsstatus: input.abrechnungsstatus,
    stammorte: input.stammorte,
  });
  assertKeineLuecke(input.erwarteterStart, start.kilometerstand_start);

  if (
    input.kilometerstand_ende === null ||
    input.kilometerstand_ende === ""
  ) {
    throw new Error(UEBERNAHME_OFFEN_ERROR);
  }
  const ende = validateEndeInput({
    kilometerstand_start: start.kilometerstand_start,
    kilometerstand_ende: input.kilometerstand_ende,
  });
  const quelle = normalizeFahrtText(
    input.quelle ?? "",
    UEBERNAHME_QUELLE_MAX,
    "Quelle",
  );

  return {
    datum,
    ...start,
    kilometerstand_ende: ende,
    quelle,
  };
}

export function assertKetteNachbar(
  vorherige: { kilometerstand_ende: number | null } | null,
  aktuelle: { kilometerstand_start: number; kilometerstand_ende: number | null },
  naechste: { kilometerstand_start: number } | null,
): void {
  if (vorherige) {
    if (vorherige.kilometerstand_ende === null) {
      throw new Error(OFFENE_FAHRT_EXISTIERT_ERROR);
    }
    assertKeineLuecke(vorherige.kilometerstand_ende, aktuelle.kilometerstand_start);
  }
  if (naechste && aktuelle.kilometerstand_ende !== null) {
    assertKeineLuecke(aktuelle.kilometerstand_ende, naechste.kilometerstand_start);
  }
}
