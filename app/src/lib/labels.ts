/** UI-Labels strikt de-DE / CONTEXT.md — keine englischen Domänenlabels */

export const STAMMORT_ART_LABELS: Record<
  "wohnung" | "erste_taetigkeitsstaette",
  string
> = {
  wohnung: "Wohnung",
  erste_taetigkeitsstaette: "erste Tätigkeitsstätte",
};

export function formatKilometerstand(km: number): string {
  return `${km.toLocaleString("de-DE")} km`;
}

export const MITGLIEDSCHAFT_ROLLE_LABELS: Record<
  "eigentuemer" | "bearbeiten" | "lesen",
  string
> = {
  eigentuemer: "Eigentümer:in",
  bearbeiten: "Bearbeiten",
  lesen: "Lesen",
};

export const NUTZUNGSTYP_LABELS: Record<
  "betrieblich" | "privat" | "wohnung_taetigkeitsstaette",
  string
> = {
  betrieblich: "betrieblich",
  privat: "privat",
  wohnung_taetigkeitsstaette: "Wohnung–Tätigkeitsstätte",
};

export const FAHRT_FELD_LABELS: Record<
  | "datum"
  | "kilometerstand_start"
  | "kilometerstand_ende"
  | "nutzungstyp"
  | "ziel"
  | "zweck"
  | "kunde"
  | "projekt"
  | "abrechnungsstatus",
  string
> = {
  datum: "Datum",
  kilometerstand_start: "Kilometerstand Start",
  kilometerstand_ende: "Kilometerstand Ende",
  nutzungstyp: "Nutzungstyp",
  ziel: "Ziel",
  zweck: "Zweck",
  kunde: "Kund:in",
  projekt: "Projekt",
  abrechnungsstatus: "Abrechnungsstatus",
};

export const UEBERNAHME_LABEL = "Übernahme";

export const ABRECHNUNGSSTATUS_LABELS: Record<
  "abrechenbar" | "nicht_abrechenbar" | "abgerechnet",
  string
> = {
  abrechenbar: "abrechenbar",
  nicht_abrechenbar: "nicht abrechenbar",
  abgerechnet: "abgerechnet",
};

export const VERMOEGENSZUORDNUNG_BAND_LABELS: Record<
  | "notwendiges_betriebsvermoegen"
  | "gewillkuertes_betriebsvermoegen"
  | "privatvermoegen",
  string
> = {
  notwendiges_betriebsvermoegen: "notwendiges Betriebsvermögen",
  gewillkuertes_betriebsvermoegen: "gewillkürtes Betriebsvermögen",
  privatvermoegen: "Privatvermögen",
};

export const VERMOEGENSZUORDNUNG_BAND_SPANNE: Record<
  | "notwendiges_betriebsvermoegen"
  | "gewillkuertes_betriebsvermoegen"
  | "privatvermoegen",
  string
> = {
  notwendiges_betriebsvermoegen: "> 50 %",
  gewillkuertes_betriebsvermoegen: "10–50 %",
  privatvermoegen: "< 10 %",
};

export function formatJahresquote(quote: number | null): string {
  if (quote === null) return "—";
  return quote.toLocaleString("de-DE", {
    style: "percent",
    maximumFractionDigits: 1,
    minimumFractionDigits: 0,
  });
}

export function formatEuroCent(cent: number): string {
  return (cent / 100).toLocaleString("de-DE", {
    style: "currency",
    currency: "EUR",
  });
}

export function monatLabel(monat: number): string {
  return new Intl.DateTimeFormat("de-DE", { month: "long" }).format(
    new Date(Date.UTC(2020, monat - 1, 15)),
  );
}
