/**
 * Modul: platform
 * Firma, Nutzer:in, Mitgliedschaft, Session, Setup — Bauabschnitt 1.
 */
export const MODULE_ID = "platform" as const;

export type { Firma, InstanzRolle, Mitgliedschaft, Nutzer } from "./types";
export {
  hatRecht,
  istInstanzEigentuemer,
  type MitgliedschaftRolle,
  type Recht,
} from "./rechte";
export {
  CLIENT_WRITE_LOCKED,
  BA1_FACHCOLLECTIONS,
  BA2_FACHCOLLECTIONS,
  BA3_FACHCOLLECTIONS,
  BA4_FACHCOLLECTIONS,
  FACHCOLLECTIONS,
} from "./write-rules";
export { validateNeueFirmaInput } from "./firma-invariants";
