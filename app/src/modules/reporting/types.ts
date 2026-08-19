/**
 * Iststand und Jahresnachweis. Kein Forecast.
 * Kilometerpauschale ist Jahresparameter, kein Journal.
 */

export type IststandFilter = {
  /** Buchjahr = Kalenderjahr */
  jahr: number;
  /** 1–12; zusätzlich zum Buchjahr, keine zweite Wahrheit */
  monat?: number;
  /** YYYY-MM-DD inklusiv */
  von?: string;
  /** YYYY-MM-DD inklusiv */
  bis?: string;
  kunde?: string;
};

export type VermoegenszuordnungBand =
  | "notwendiges_betriebsvermoegen"
  | "gewillkuertes_betriebsvermoegen"
  | "privatvermoegen";

export type Iststand = {
  fahrzeug: string;
  jahr: number;
  kilometer_betrieblich: number;
  kilometer_privat: number;
  kilometer_wohnung_taetigkeitsstaette: number;
  kilometer_gesamt: number;
  jahresquote: number | null;
  vermoegenszuordnung_band: VermoegenszuordnungBand | null;
  /** Canonical, z. B. "0.30" */
  kilometerpauschale_satz: string;
  /** Betrieblich × Satz, ohne Wohnung–Tätigkeitsstätte */
  kilometerpauschale_cent: number;
};

export type KilometerpauschaleParameter = {
  jahr: number;
  /** EUR je betrieblichem Kilometer, ohne Wohnung–Tätigkeitsstätte */
  satz: string;
};

/** Datei-Export: ganzes Buch oder nur abrechenbare Fahrten. Keine Live-API. */
export type ExportUmfang = "buch" | "abrechenbar";
