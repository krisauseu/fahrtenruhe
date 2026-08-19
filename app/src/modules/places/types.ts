/**
 * Stammorte der Firma: Wohnung und erste Tätigkeitsstätte.
 * Beide dürfen dieselbe Adresse sein. Nicht je Fahrzeug.
 */

export const STAMMORT_ARTEN = [
  "wohnung",
  "erste_taetigkeitsstaette",
] as const;

export type StammortArt = (typeof STAMMORT_ARTEN)[number];

export type Stammort = {
  id: string;
  firma: string;
  art: StammortArt;
  bezeichnung: string;
  strasse: string;
  plz: string;
  ort: string;
};

export type StammortInput = {
  art: StammortArt;
  bezeichnung: string;
  strasse: string;
  plz: string;
  ort: string;
};

/** Beide Stammorte der Firma; gleich = gleiche Anschrift (ADR-0011, für BA3). */
export type StammorteStand = {
  wohnung: Stammort | null;
  erste_taetigkeitsstaette: Stammort | null;
  gleich: boolean;
};
