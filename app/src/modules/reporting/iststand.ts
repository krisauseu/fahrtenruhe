/**
 * Iststand: dieselbe Addition wie der Jahresnachweis, jederzeit.
 * Kein Forecast; Pauschale nur betrieblich.
 */

import { kalenderjahrInBerlin } from "@/lib/berlin-datum";
import type { Nutzungstyp } from "@/modules/trips/types";
import type {
  Iststand,
  IststandFilter,
  VermoegenszuordnungBand,
} from "./types";

export const DEFAULT_KILOMETERPAUSCHALE_SATZ = "0.30";

export const BUCHJAHR_UNGUELTIG_ERROR =
  "Buchjahr muss ein Kalenderjahr sein.";

export const MONAT_UNGUELTIG_ERROR = "Monat muss zwischen 1 und 12 liegen.";

export const ZEITRAUM_DATUM_ERROR = "Zeitraum muss YYYY-MM-DD sein.";

export const ZEITRAUM_REIHENFOLGE_ERROR =
  "Zeitraum „von“ darf nicht nach „bis“ liegen.";

export type FahrtFuerIststand = {
  datum: string;
  kilometerstand_start: number;
  kilometerstand_ende: number | null;
  nutzungstyp: Nutzungstyp;
  kunde: string | null;
};

export function istIsoDatum(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const y = Number(value.slice(0, 4));
  const m = Number(value.slice(5, 7));
  const d = Number(value.slice(8, 10));
  const dt = new Date(Date.UTC(y, m - 1, d));
  return (
    dt.getUTCFullYear() === y &&
    dt.getUTCMonth() === m - 1 &&
    dt.getUTCDate() === d
  );
}

export function parseKilometerpauschaleSatz(
  raw?: string | null,
): string {
  const t = (raw ?? "").trim().replace(",", ".");
  if (!t) return DEFAULT_KILOMETERPAUSCHALE_SATZ;
  const m = /^(\d+)(?:\.(\d{1,2}))?$/.exec(t);
  if (!m) return DEFAULT_KILOMETERPAUSCHALE_SATZ;
  const frac = (m[2] ?? "").padEnd(2, "0").slice(0, 2);
  return `${Number(m[1])}.${frac}`;
}

export function satzToCent(satz: string): number {
  const normalized = parseKilometerpauschaleSatz(satz);
  const [w, frac = "00"] = normalized.split(".");
  return Number(w) * 100 + Number(frac.padEnd(2, "0").slice(0, 2));
}

export function kilometerpauschaleCent(
  kilometerBetrieblich: number,
  satz?: string | null,
): number {
  if (!Number.isInteger(kilometerBetrieblich) || kilometerBetrieblich < 0) {
    return 0;
  }
  return kilometerBetrieblich * satzToCent(satz ?? DEFAULT_KILOMETERPAUSCHALE_SATZ);
}

export function fahrtKilometer(fahrt: FahrtFuerIststand): number | null {
  if (fahrt.kilometerstand_ende === null) return null;
  const km = fahrt.kilometerstand_ende - fahrt.kilometerstand_start;
  if (!Number.isInteger(km) || km < 0) return null;
  return km;
}

export function fahrtPasstZuFilter(
  fahrt: FahrtFuerIststand,
  filter: IststandFilter,
): boolean {
  const tag = fahrt.datum.slice(0, 10);
  if (tag.slice(0, 4) !== String(filter.jahr)) return false;
  if (filter.monat !== undefined) {
    const mm = String(filter.monat).padStart(2, "0");
    if (tag.slice(5, 7) !== mm) return false;
  }
  if (filter.von && tag < filter.von) return false;
  if (filter.bis && tag > filter.bis) return false;
  if (filter.kunde && fahrt.kunde !== filter.kunde) return false;
  return true;
}

/**
 * Band aus der Quote der sichtbaren Addition (R 4.2 EStR):
 * > 50 % notwendig, 10–50 % gewillkürt, < 10 % Privatvermögen.
 * Integer-Vergleich, kein Float.
 */
export function vermoegenszuordnungBand(
  kilometerFuerQuote: number,
  kilometerGesamt: number,
): VermoegenszuordnungBand | null {
  if (
    !Number.isInteger(kilometerFuerQuote) ||
    !Number.isInteger(kilometerGesamt) ||
    kilometerGesamt <= 0
  ) {
    return null;
  }
  if (kilometerFuerQuote * 2 > kilometerGesamt) {
    return "notwendiges_betriebsvermoegen";
  }
  if (kilometerFuerQuote * 10 >= kilometerGesamt) {
    return "gewillkuertes_betriebsvermoegen";
  }
  return "privatvermoegen";
}

export function jahresquote(
  kilometerFuerQuote: number,
  kilometerGesamt: number,
): number | null {
  if (
    !Number.isInteger(kilometerFuerQuote) ||
    !Number.isInteger(kilometerGesamt) ||
    kilometerGesamt <= 0
  ) {
    return null;
  }
  return kilometerFuerQuote / kilometerGesamt;
}

/**
 * Volle Jahresaddition: kein Monat, kein Kund:in-Schnitt,
 * Zeitraum nicht enger als das Kalenderjahr.
 */
export function istVollesBuchjahr(filter: IststandFilter): boolean {
  if (filter.kunde) return false;
  if (filter.monat !== undefined) return false;
  const start = `${filter.jahr}-01-01`;
  const ende = `${filter.jahr}-12-31`;
  if (filter.von && filter.von > start) return false;
  if (filter.bis && filter.bis < ende) return false;
  return true;
}

export function addiereIststand(input: {
  fahrzeug: string;
  fahrten: FahrtFuerIststand[];
  filter: IststandFilter;
  satz?: string | null;
}): Iststand {
  const satz = parseKilometerpauschaleSatz(input.satz);
  let kilometer_betrieblich = 0;
  let kilometer_privat = 0;
  let kilometer_wohnung_taetigkeitsstaette = 0;

  for (const fahrt of input.fahrten) {
    if (!fahrtPasstZuFilter(fahrt, input.filter)) continue;
    const km = fahrtKilometer(fahrt);
    if (km === null) continue;
    if (fahrt.nutzungstyp === "betrieblich") {
      kilometer_betrieblich += km;
    } else if (fahrt.nutzungstyp === "privat") {
      kilometer_privat += km;
    } else if (fahrt.nutzungstyp === "wohnung_taetigkeitsstaette") {
      kilometer_wohnung_taetigkeitsstaette += km;
    }
  }

  const kilometer_gesamt =
    kilometer_betrieblich +
    kilometer_privat +
    kilometer_wohnung_taetigkeitsstaette;
  const fuerQuote =
    kilometer_betrieblich + kilometer_wohnung_taetigkeitsstaette;

  return {
    fahrzeug: input.fahrzeug,
    jahr: input.filter.jahr,
    kilometer_betrieblich,
    kilometer_privat,
    kilometer_wohnung_taetigkeitsstaette,
    kilometer_gesamt,
    jahresquote: jahresquote(fuerQuote, kilometer_gesamt),
    vermoegenszuordnung_band: vermoegenszuordnungBand(
      fuerQuote,
      kilometer_gesamt,
    ),
    kilometerpauschale_satz: satz,
    kilometerpauschale_cent: kilometerpauschaleCent(
      kilometer_betrieblich,
      satz,
    ),
  };
}

/** Buchjahre für die Filter-Auswahl, ab frühester Inbetriebnahme. */
export function buchjahreAuswahl(
  fahrzeuge: { inbetriebnahme_am: string | null }[],
  gewaehlt: number,
  heute: Date = new Date(),
): number[] {
  const current = kalenderjahrInBerlin(heute);
  let min = current;
  for (const f of fahrzeuge) {
    const y = Number((f.inbetriebnahme_am ?? "").slice(0, 4));
    if (Number.isInteger(y) && y >= 2000 && y < min) min = y;
  }
  if (gewaehlt < min) min = gewaehlt;
  const max = Math.max(current, gewaehlt);
  const years: number[] = [];
  for (let y = max; y >= min; y--) years.push(y);
  return years;
}

export function parseIststandFilter(
  raw: {
    jahr?: string;
    monat?: string;
    von?: string;
    bis?: string;
    kunde?: string;
  },
  heute: Date = new Date(),
): { filter: IststandFilter; error: string | null } {
  const errors: string[] = [];
  const filter: IststandFilter = {
    jahr: kalenderjahrInBerlin(heute),
  };

  const jahrRaw = (raw.jahr ?? "").trim();
  if (jahrRaw) {
    const n = Number(jahrRaw);
    if (!Number.isInteger(n) || n < 2000 || n > 2100) {
      errors.push(BUCHJAHR_UNGUELTIG_ERROR);
    } else {
      filter.jahr = n;
    }
  }

  const monatRaw = (raw.monat ?? "").trim();
  if (monatRaw) {
    const n = Number(monatRaw);
    if (!Number.isInteger(n) || n < 1 || n > 12) {
      errors.push(MONAT_UNGUELTIG_ERROR);
    } else {
      filter.monat = n;
    }
  }

  const vonRaw = (raw.von ?? "").trim();
  const bisRaw = (raw.bis ?? "").trim();
  if (vonRaw) {
    if (!istIsoDatum(vonRaw)) {
      errors.push(ZEITRAUM_DATUM_ERROR);
    } else {
      filter.von = vonRaw;
    }
  }
  if (bisRaw) {
    if (!istIsoDatum(bisRaw)) {
      errors.push(ZEITRAUM_DATUM_ERROR);
    } else {
      filter.bis = bisRaw;
    }
  }
  if (filter.von && filter.bis && filter.von > filter.bis) {
    errors.push(ZEITRAUM_REIHENFOLGE_ERROR);
    delete filter.von;
    delete filter.bis;
  }

  const kundeRaw = (raw.kunde ?? "").trim();
  if (kundeRaw) {
    filter.kunde = kundeRaw;
  }

  return {
    filter,
    error: errors[0] ?? null,
  };
}