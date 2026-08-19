/**
 * Jahresnachweis: formeller Export des Buchs.
 * PDF ist das Buch (Fahrten inklusive Korrekturspur).
 * CSV/JSON: ganzes Buch und nur abrechenbare Fahrten.
 * Addition nur über addiereIststand — kein Forecast.
 */

import { formatDatumDe, formatZeitstempelDe } from "@/lib/berlin-datum";
import {
  ABRECHNUNGSSTATUS_LABELS,
  FAHRT_FELD_LABELS,
  formatEuroCent,
  formatJahresquote,
  formatKilometerstand,
  NUTZUNGSTYP_LABELS,
  UEBERNAHME_LABEL,
  VERMOEGENSZUORDNUNG_BAND_LABELS,
  VERMOEGENSZUORDNUNG_BAND_SPANNE,
} from "@/lib/labels";
import type { FirmaRecord } from "@/lib/pb";
import type { Kunde, Projekt } from "@/modules/contacts/types";
import {
  fahrtenKetteAbPflichtstart,
  parseBuchfelder,
  parseUebernahmeVorher,
} from "@/modules/trips/invariants";
import type { Fahrt, Korrekturspur } from "@/modules/trips/types";
import {
  buchjahrHinweis,
  type BuchjahrHinweis,
} from "@/modules/vehicles/buchjahr";
import type { Fahrzeug } from "@/modules/vehicles/types";
import {
  addiereIststand,
  fahrtKilometer,
  parseIststandFilter,
} from "./iststand";
import type { ExportUmfang, Iststand } from "./types";

export const FAHRZEUG_PFLICHT_ERROR =
  "Für den Jahresnachweis ist ein Fahrzeug erforderlich.";

export const UMFANG_UNGUELTIG_ERROR =
  "Umfang muss buch oder abrechenbar sein.";

export const CSV_DELIM = ";";

export const BUCH_CSV_HEADERS = [
  "id",
  "datum",
  "kennzeichen",
  "kilometerstand_start",
  "kilometerstand_ende",
  "kilometer",
  "nutzungstyp",
  "ziel",
  "zweck",
  "kunde",
  "kunde_name",
  "projekt",
  "projekt_name",
  "abrechnungsstatus",
  "zettelruhe_kontakt_id",
  "zettelruhe_projekt_id",
  "angelegt_am",
  "vervollstaendigt_am",
  "korrekturspur_anzahl",
  "uebernahme",
] as const;

export const KORREKTURSPUR_CSV_HEADERS = [
  "fahrt_id",
  "wer",
  "wann",
  "vorher",
  "nachher",
] as const;

export type JahresnachweisZeile = {
  fahrt: Fahrt;
  kilometer: number | null;
  kunde_name: string | null;
  projekt_name: string | null;
  zettelruhe_kontakt_id: string | null;
  zettelruhe_projekt_id: string | null;
  korrekturspuren: Korrekturspur[];
};

export type Jahresnachweis = {
  firma: FirmaRecord;
  fahrzeug: Fahrzeug;
  buchjahr: number;
  hinweis: BuchjahrHinweis;
  iststand: Iststand;
  zeilen: JahresnachweisZeile[];
};

export type KorrekturspurAenderung = {
  feld: string;
  vorher: string;
  nachher: string;
};

export function fahrtImBuchjahr(datum: string, jahr: number): boolean {
  return datum.slice(0, 4) === String(jahr);
}

/**
 * Abrechenbar für den Datei-Export nach Zettelruhe:
 * Status abrechenbar und geschlossene Fahrt (km stehen fest).
 */
export function istAbrechenbareExportfahrt(fahrt: Fahrt): boolean {
  return (
    fahrt.abrechnungsstatus === "abrechenbar" &&
    fahrt.kilometerstand_ende !== null
  );
}

export function parseExportUmfang(
  raw?: string | null,
): { umfang: ExportUmfang; error: string | null } {
  const t = (raw ?? "").trim();
  if (!t || t === "buch") return { umfang: "buch", error: null };
  if (t === "abrechenbar") return { umfang: "abrechenbar", error: null };
  return { umfang: "buch", error: UMFANG_UNGUELTIG_ERROR };
}

export function parseJahresnachweisAnfrage(
  raw: { fahrzeug?: string; jahr?: string; umfang?: string },
  heute: Date = new Date(),
): {
  fahrzeug: string;
  jahr: number;
  umfang: ExportUmfang;
  error: string | null;
} {
  const { filter, error: jahrError } = parseIststandFilter(
    { jahr: raw.jahr },
    heute,
  );
  const { umfang, error: umfangError } = parseExportUmfang(raw.umfang);
  const fahrzeug = (raw.fahrzeug ?? "").trim();
  return {
    fahrzeug,
    jahr: filter.jahr,
    umfang,
    error: jahrError ?? umfangError,
  };
}

export function dateinameKennzeichen(kennzeichen: string): string {
  const t = kennzeichen
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^A-Za-z0-9._-]/g, "");
  return t || "fahrzeug";
}

export function jahresnachweisDateiname(input: {
  art: "pdf" | "csv" | "json";
  umfang: ExportUmfang;
  kennzeichen: string;
  jahr: number;
}): string {
  const k = dateinameKennzeichen(input.kennzeichen);
  const basis =
    input.umfang === "abrechenbar"
      ? `abrechenbare-fahrten-${k}-${input.jahr}`
      : `fahrtenbuch-${k}-${input.jahr}`;
  return `${basis}.${input.art}`;
}

function nameZuId(
  items: Array<{ id: string; name: string }>,
  id: string | null,
): string | null {
  if (!id) return null;
  return items.find((i) => i.id === id)?.name ?? null;
}

function spurenNachFahrt(
  raw: Map<string, Korrekturspur[]> | Korrekturspur[],
): Map<string, Korrekturspur[]> {
  if (raw instanceof Map) {
    const copy = new Map<string, Korrekturspur[]>();
    for (const [id, list] of raw) {
      copy.set(
        id,
        [...list].sort((a, b) => a.wann.localeCompare(b.wann)),
      );
    }
    return copy;
  }
  const m = new Map<string, Korrekturspur[]>();
  for (const s of raw) {
    const arr = m.get(s.fahrt) ?? [];
    arr.push(s);
    m.set(s.fahrt, arr);
  }
  for (const arr of m.values()) {
    arr.sort((a, b) => a.wann.localeCompare(b.wann));
  }
  return m;
}

export function baueJahresnachweis(input: {
  firma: FirmaRecord;
  fahrzeug: Fahrzeug;
  buchjahr: number;
  fahrten: Fahrt[];
  korrekturspuren: Map<string, Korrekturspur[]> | Korrekturspur[];
  kunden: Kunde[];
  projekte: Projekt[];
  satz?: string | null;
}): Jahresnachweis {
  const hinweisBasis = buchjahrHinweis({
    inbetriebnahme_am: input.fahrzeug.inbetriebnahme_am,
    ketteAbPflichtstart: false,
    buchjahr: input.buchjahr,
  });
  const hinweis = buchjahrHinweis({
    inbetriebnahme_am: input.fahrzeug.inbetriebnahme_am,
    ketteAbPflichtstart: fahrtenKetteAbPflichtstart({
      eroeffnungs_kilometerstand: input.fahrzeug.eroeffnungs_kilometerstand,
      pflichtstart: hinweisBasis.pflichtstart,
      fahrten: input.fahrten,
    }),
    buchjahr: input.buchjahr,
  });

  const iststand = addiereIststand({
    fahrzeug: input.fahrzeug.id,
    fahrten: input.fahrten,
    filter: { jahr: input.buchjahr },
    satz: input.satz,
  });

  const spuren = spurenNachFahrt(input.korrekturspuren);
  const desJahres = input.fahrten
    .filter((f) => fahrtImBuchjahr(f.datum, input.buchjahr))
    .slice()
    .sort((a, b) => a.kilometerstand_start - b.kilometerstand_start);

  const zeilen: JahresnachweisZeile[] = desJahres.map((fahrt) => {
    const kunde = fahrt.kunde
      ? input.kunden.find((k) => k.id === fahrt.kunde)
      : undefined;
    const projekt = fahrt.projekt
      ? input.projekte.find((p) => p.id === fahrt.projekt)
      : undefined;
    return {
      fahrt,
      kilometer: fahrtKilometer(fahrt),
      kunde_name: kunde?.name ?? nameZuId(input.kunden, fahrt.kunde),
      projekt_name: projekt?.name ?? nameZuId(input.projekte, fahrt.projekt),
      zettelruhe_kontakt_id: kunde?.zettelruhe_kontakt_id ?? null,
      zettelruhe_projekt_id: projekt?.zettelruhe_projekt_id ?? null,
      korrekturspuren: spuren.get(fahrt.id) ?? [],
    };
  });

  return {
    firma: input.firma,
    fahrzeug: input.fahrzeug,
    buchjahr: input.buchjahr,
    hinweis,
    iststand,
    zeilen,
  };
}

export function zeilenFuerUmfang(
  nachweis: Jahresnachweis,
  umfang: ExportUmfang,
): JahresnachweisZeile[] {
  if (umfang === "abrechenbar") {
    return nachweis.zeilen.filter((z) => istAbrechenbareExportfahrt(z.fahrt));
  }
  return nachweis.zeilen;
}

function csvEsc(value: string | number | null | undefined): string {
  const s = value == null ? "" : String(value);
  if (
    s.includes(CSV_DELIM) ||
    s.includes('"') ||
    s.includes("\n") ||
    s.includes("\r")
  ) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function csvRow(fields: Array<string | number | null | undefined>): string {
  return fields.map(csvEsc).join(CSV_DELIM);
}

function zeileCsvFelder(
  zeile: JahresnachweisZeile,
  kennzeichen: string,
): Array<string | number | null> {
  const f = zeile.fahrt;
  return [
    f.id,
    f.datum,
    kennzeichen,
    f.kilometerstand_start,
    f.kilometerstand_ende,
    zeile.kilometer,
    f.nutzungstyp,
    f.ziel,
    f.zweck,
    f.kunde,
    zeile.kunde_name,
    f.projekt,
    zeile.projekt_name,
    f.abrechnungsstatus,
    zeile.zettelruhe_kontakt_id,
    zeile.zettelruhe_projekt_id,
    f.angelegt_am,
    f.vervollstaendigt_am,
    zeile.korrekturspuren.length,
    f.uebernahme ? "1" : "0",
  ];
}

export function serializeJahresnachweisCsv(
  nachweis: Jahresnachweis,
  umfang: ExportUmfang,
): string {
  const zeilen = zeilenFuerUmfang(nachweis, umfang);
  const lines = [csvRow([...BUCH_CSV_HEADERS])];
  for (const zeile of zeilen) {
    lines.push(csvRow(zeileCsvFelder(zeile, nachweis.fahrzeug.kennzeichen)));
  }
  if (umfang === "buch") {
    const spuren = zeilen.flatMap((z) =>
      z.korrekturspuren.map((s) => ({ fahrt_id: z.fahrt.id, spur: s })),
    );
    lines.push("");
    lines.push("# Korrekturspur");
    lines.push(csvRow([...KORREKTURSPUR_CSV_HEADERS]));
    for (const { fahrt_id, spur } of spuren) {
      lines.push(
        csvRow([fahrt_id, spur.wer, spur.wann, spur.vorher, spur.nachher]),
      );
    }
  }
  return `\uFEFF${lines.join("\r\n")}\r\n`;
}

export type JahresnachweisJsonFahrt = {
  id: string;
  datum: string;
  kilometerstand_start: number;
  kilometerstand_ende: number | null;
  kilometer: number | null;
  nutzungstyp: Fahrt["nutzungstyp"];
  ziel: string;
  zweck: string;
  kunde: string | null;
  kunde_name: string | null;
  projekt: string | null;
  projekt_name: string | null;
  abrechnungsstatus: Fahrt["abrechnungsstatus"];
  zettelruhe_kontakt_id: string | null;
  zettelruhe_projekt_id: string | null;
  angelegt_am: string;
  vervollstaendigt_am: string | null;
  uebernahme: boolean;
  korrekturspuren: Array<{
    id: string;
    wer: string;
    wann: string;
    vorher: string;
    nachher: string;
  }>;
};

export type JahresnachweisJson = {
  umfang: ExportUmfang;
  firma: {
    id: string;
    name: string;
    strasse: string;
    plz: string;
    ort: string;
    land: string;
  };
  fahrzeug: {
    id: string;
    kennzeichen: string;
    eroeffnungs_kilometerstand: number;
    inbetriebnahme_am: string | null;
    ausser_betrieb: boolean;
  };
  buchjahr: number;
  nachweistauglich: boolean;
  hinweis: string;
  iststand: Iststand;
  fahrten: JahresnachweisJsonFahrt[];
};

export function jahresnachweisAlsJson(
  nachweis: Jahresnachweis,
  umfang: ExportUmfang,
): JahresnachweisJson {
  const zeilen = zeilenFuerUmfang(nachweis, umfang);
  return {
    umfang,
    firma: {
      id: nachweis.firma.id,
      name: nachweis.firma.name,
      strasse: nachweis.firma.strasse,
      plz: nachweis.firma.plz,
      ort: nachweis.firma.ort,
      land: nachweis.firma.land,
    },
    fahrzeug: {
      id: nachweis.fahrzeug.id,
      kennzeichen: nachweis.fahrzeug.kennzeichen,
      eroeffnungs_kilometerstand: nachweis.fahrzeug.eroeffnungs_kilometerstand,
      inbetriebnahme_am: nachweis.fahrzeug.inbetriebnahme_am,
      ausser_betrieb: nachweis.fahrzeug.ausser_betrieb,
    },
    buchjahr: nachweis.buchjahr,
    nachweistauglich: nachweis.hinweis.nachweistauglich,
    hinweis: nachweis.hinweis.text,
    iststand: nachweis.iststand,
    fahrten: zeilen.map((z) => ({
      id: z.fahrt.id,
      datum: z.fahrt.datum,
      kilometerstand_start: z.fahrt.kilometerstand_start,
      kilometerstand_ende: z.fahrt.kilometerstand_ende,
      kilometer: z.kilometer,
      nutzungstyp: z.fahrt.nutzungstyp,
      ziel: z.fahrt.ziel,
      zweck: z.fahrt.zweck,
      kunde: z.fahrt.kunde,
      kunde_name: z.kunde_name,
      projekt: z.fahrt.projekt,
      projekt_name: z.projekt_name,
      abrechnungsstatus: z.fahrt.abrechnungsstatus,
      zettelruhe_kontakt_id: z.zettelruhe_kontakt_id,
      zettelruhe_projekt_id: z.zettelruhe_projekt_id,
      angelegt_am: z.fahrt.angelegt_am,
      vervollstaendigt_am: z.fahrt.vervollstaendigt_am,
      uebernahme: z.fahrt.uebernahme,
      korrekturspuren: z.korrekturspuren.map((s) => ({
        id: s.id,
        wer: s.wer,
        wann: s.wann,
        vorher: s.vorher,
        nachher: s.nachher,
      })),
    })),
  };
}

export function serializeJahresnachweisJson(
  nachweis: Jahresnachweis,
  umfang: ExportUmfang,
): string {
  return `${JSON.stringify(jahresnachweisAlsJson(nachweis, umfang), null, 2)}\n`;
}

function formatBuchfeldWert(
  key: keyof typeof FAHRT_FELD_LABELS,
  value: unknown,
): string {
  if (key === "kilometerstand_ende" && (value === null || value === undefined)) {
    return "offen";
  }
  if (
    (key === "kilometerstand_start" || key === "kilometerstand_ende") &&
    typeof value === "number"
  ) {
    return formatKilometerstand(value);
  }
  if (key === "nutzungstyp" && typeof value === "string") {
    return (
      NUTZUNGSTYP_LABELS[value as keyof typeof NUTZUNGSTYP_LABELS] ?? value
    );
  }
  if (key === "abrechnungsstatus" && typeof value === "string") {
    return (
      ABRECHNUNGSSTATUS_LABELS[
        value as keyof typeof ABRECHNUNGSSTATUS_LABELS
      ] ?? value
    );
  }
  if (value === "" || value === null || value === undefined) {
    return "—";
  }
  return String(value);
}

export function beschreibeKorrekturspur(spur: Korrekturspur): {
  wer: string;
  wann_de: string;
  aenderungen: KorrekturspurAenderung[];
  vorher_roh: string;
  nachher_roh: string;
} {
  const uebernahme = parseUebernahmeVorher(spur.vorher);
  const vorher = parseBuchfelder(spur.vorher);
  const nachher = parseBuchfelder(spur.nachher);
  const keys = Object.keys(FAHRT_FELD_LABELS) as Array<
    keyof typeof FAHRT_FELD_LABELS
  >;
  const aenderungen: KorrekturspurAenderung[] = [];
  if (uebernahme) {
    aenderungen.push({
      feld: UEBERNAHME_LABEL,
      vorher: "nicht im Buch",
      nachher: uebernahme.quelle || "Altbestand",
    });
  } else if (vorher && nachher) {
    for (const key of keys) {
      if (vorher[key] !== nachher[key]) {
        aenderungen.push({
          feld: FAHRT_FELD_LABELS[key],
          vorher: formatBuchfeldWert(key, vorher[key]),
          nachher: formatBuchfeldWert(key, nachher[key]),
        });
      }
    }
  }
  return {
    wer: spur.wer,
    wann_de: formatZeitstempelDe(spur.wann),
    aenderungen,
    vorher_roh: spur.vorher,
    nachher_roh: spur.nachher,
  };
}

export function formatIststandZeilen(iststand: Iststand): Array<{
  label: string;
  value: string;
}> {
  const band = iststand.vermoegenszuordnung_band;
  return [
    {
      label: NUTZUNGSTYP_LABELS.betrieblich,
      value: formatKilometerstand(iststand.kilometer_betrieblich),
    },
    {
      label: NUTZUNGSTYP_LABELS.privat,
      value: formatKilometerstand(iststand.kilometer_privat),
    },
    {
      label: NUTZUNGSTYP_LABELS.wohnung_taetigkeitsstaette,
      value: formatKilometerstand(iststand.kilometer_wohnung_taetigkeitsstaette),
    },
    {
      label: "Gesamtfahrleistung",
      value: formatKilometerstand(iststand.kilometer_gesamt),
    },
    {
      label: "Jahresquote",
      value: formatJahresquote(iststand.jahresquote),
    },
    {
      label: "Band der Vermögenszuordnung",
      value: band
        ? `${VERMOEGENSZUORDNUNG_BAND_LABELS[band]} (${VERMOEGENSZUORDNUNG_BAND_SPANNE[band]})`
        : "—",
    },
    {
      label: "Kilometerpauschale",
      value: formatEuroCent(iststand.kilometerpauschale_cent),
    },
  ];
}

export function formatFahrtKilometerkette(fahrt: Fahrt): string {
  if (fahrt.kilometerstand_ende === null) {
    return `${fahrt.kilometerstand_start.toLocaleString("de-DE")} km → offen`;
  }
  const km = fahrt.kilometerstand_ende - fahrt.kilometerstand_start;
  return `${fahrt.kilometerstand_start.toLocaleString("de-DE")}–${fahrt.kilometerstand_ende.toLocaleString("de-DE")} km (${km.toLocaleString("de-DE")} km)`;
}

export function formatFahrtKopfzeile(fahrt: Fahrt): string {
  const teile = [
    formatDatumDe(fahrt.datum),
    formatFahrtKilometerkette(fahrt),
    NUTZUNGSTYP_LABELS[fahrt.nutzungstyp],
  ];
  if (fahrt.uebernahme) teile.push(UEBERNAHME_LABEL);
  return teile.join("  ·  ");
}

export function firmaAnschrift(firma: FirmaRecord): string {
  const ort = [firma.plz, firma.ort].filter(Boolean).join(" ").trim();
  return [firma.strasse, ort, firma.land === "DE" ? "" : firma.land]
    .map((s) => s.trim())
    .filter(Boolean)
    .join(", ");
}