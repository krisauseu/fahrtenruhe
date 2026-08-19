/**
 * Lokaler, dünner Stamm. Optionale Zettelruhe-Ids, kein Live-Sync.
 */

export type Kunde = {
  id: string;
  firma: string;
  name: string;
  zettelruhe_kontakt_id: string | null;
};

export type Projekt = {
  id: string;
  firma: string;
  kunde: string;
  name: string;
  zettelruhe_projekt_id: string | null;
};

export type KundeInput = {
  name: string;
  zettelruhe_kontakt_id: string | null;
};

export type ProjektInput = {
  kunde: string;
  name: string;
  zettelruhe_projekt_id: string | null;
};
