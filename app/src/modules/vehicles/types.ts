/**
 * Fahrzeug: stabile Identität; Kennzeichen ist der sichtbare Name.
 * Außer Betrieb legen, nicht löschen. Eröffnungs-Kilometerstand ist ganzzahlig.
 */

export type Fahrzeug = {
  id: string;
  firma: string;
  kennzeichen: string;
  eroeffnungs_kilometerstand: number;
  ausser_betrieb: boolean;
  /** YYYY-MM-DD, Europe/Berlin; optional, unterscheidet Inbetriebnahme von Jahresmitte-Einstieg */
  inbetriebnahme_am: string | null;
};

export type NeuesFahrzeugInput = {
  kennzeichen: string;
  eroeffnungs_kilometerstand: number;
  inbetriebnahme_am: string | null;
};
