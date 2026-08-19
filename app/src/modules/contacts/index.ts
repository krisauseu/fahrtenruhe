/**
 * Modul: contacts
 * Kund:in, Projekt, optionale Zettelruhe-Id.
 */
export const MODULE_ID = "contacts" as const;
export type { Kunde, KundeInput, Projekt, ProjektInput } from "./types";
export {
  createKunde,
  createProjekt,
  getKunde,
  getProjekt,
  listKunden,
  listProjekte,
  updateKunde,
  updateProjekt,
} from "./repository";
export {
  normalizeZettelruheId,
  validateKundeInput,
  validateProjektInput,
} from "./invariants";
