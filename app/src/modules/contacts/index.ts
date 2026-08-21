/**
 * Modul: contacts
 * Kund:in, Projekt, optionale Zettelruhe-Kontaktnummer.
 */
export const MODULE_ID = "contacts" as const;
export type { Kunde, KundeInput, Projekt, ProjektInput } from "./types";
export type { KundenImportErgebnis } from "./repository";
export {
  createKunde,
  createProjekt,
  getKunde,
  getProjekt,
  importKundenAusCsv,
  listKunden,
  listProjekte,
  updateKunde,
  updateProjekt,
} from "./repository";
export {
  beschreibeKundenImport,
  parseKundenCsv,
  planeKundenImport,
} from "./csv";
export {
  normalizeZettelruheId,
  validateKundeInput,
  validateProjektInput,
} from "./invariants";
