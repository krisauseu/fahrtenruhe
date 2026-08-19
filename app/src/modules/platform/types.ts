import type { MitgliedschaftRolle } from "./rechte";

export type InstanzRolle = "eigentuemer" | "nutzer";

export type Firma = {
  id: string;
  name: string;
  strasse: string;
  plz: string;
  ort: string;
  land: string;
};

export type Nutzer = {
  id: string;
  email: string;
  name: string;
  role: InstanzRolle;
  /** Zuletzt aktive Firma */
  firma: string | null;
};

export type Mitgliedschaft = {
  id: string;
  userId: string;
  firmaId: string;
  rolle: MitgliedschaftRolle;
};
