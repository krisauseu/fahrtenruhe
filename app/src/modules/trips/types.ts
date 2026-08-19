/**
 * Fahrt: Atombewegung eines Fahrzeugs. Genau ein Nutzungstyp.
 * Kilometerstand ganzzahlig. kilometerstand_ende leer = offene Fahrt.
 * Nicht Zettelruhes Abrechnungszeile.
 */

export const NUTZUNGSTYPEN = [
  "betrieblich",
  "privat",
  "wohnung_taetigkeitsstaette",
] as const;

export type Nutzungstyp = (typeof NUTZUNGSTYPEN)[number];

export const ABRECHNUNGSSTATI = [
  "abrechenbar",
  "nicht_abrechenbar",
  "abgerechnet",
] as const;

export type Abrechnungsstatus = (typeof ABRECHNUNGSSTATI)[number];

export type Fahrt = {
  id: string;
  firma: string;
  fahrzeug: string;
  /** YYYY-MM-DD, Europe/Berlin */
  datum: string;
  kilometerstand_start: number;
  /** null solange die Fahrt offen ist */
  kilometerstand_ende: number | null;
  nutzungstyp: Nutzungstyp;
  ziel: string;
  zweck: string;
  /** ISO-Zeitstempel der Anlage */
  angelegt_am: string;
  /** ISO-Zeitstempel der letzten Vervollständigung am selben Kalendertag */
  vervollstaendigt_am: string | null;
  /** Optional; nur betrieblich. Privat und Wohnung–Tätigkeitsstätte tragen keine Kund:in. */
  kunde: string | null;
  projekt: string | null;
  abrechnungsstatus: Abrechnungsstatus;
  /**
   * Gekennzeichnete Übernahme aus Altbestand (Papier oder Datei).
   * Live-Start bleibt false. Einmal gesetzt, bleibt die Marke.
   */
  uebernahme: boolean;
};

export type Korrekturspur = {
  id: string;
  fahrt: string;
  wer: string;
  wann: string;
  vorher: string;
  nachher: string;
};

export type FahrtStartEingabe = {
  kilometerstand_start: number;
  nutzungstyp: Nutzungstyp;
  ziel: string;
  zweck: string;
};

export type FahrtBuchfelder = {
  datum: string;
  kilometerstand_start: number;
  kilometerstand_ende: number | null;
  nutzungstyp: Nutzungstyp;
  ziel: string;
  zweck: string;
  kunde: string | null;
  projekt: string | null;
  abrechnungsstatus: Abrechnungsstatus;
};
