/**
 * Modul: places
 * Stammorte Wohnung / erste Tätigkeitsstätte.
 */
export const MODULE_ID = "places" as const;
export type {
  Stammort,
  StammortArt,
  StammortInput,
  StammorteStand,
} from "./types";
export { STAMMORT_ARTEN } from "./types";
export {
  getStammort,
  getStammorteStand,
  listStammorte,
  upsertStammort,
} from "./repository";
export {
  anschriftSchluessel,
  assertKeineZweiteArt,
  stammorteSindGleich,
  validateStammortInput,
} from "./invariants";
