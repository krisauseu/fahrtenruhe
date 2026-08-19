/**
 * Modul: vehicles
 * Fahrzeug, Kennzeichen als Name, außer Betrieb, Eröffnungs-Kilometerstand.
 */
export const MODULE_ID = "vehicles" as const;
export type { Fahrzeug, NeuesFahrzeugInput } from "./types";
export type { BuchjahrHinweis } from "./buchjahr";
export { buchjahrHinweis } from "./buchjahr";
export {
  createFahrzeug,
  getFahrzeug,
  listFahrzeuge,
  setFahrzeugAusserBetrieb,
  updateFahrzeug,
} from "./repository";
export {
  FAHRZEUG_LOESCHEN_VERBOTEN_ERROR,
  KILOMETERSTAND_GANZZAHL_ERROR,
  ablehnenFahrzeugLoeschen,
  fahrzeugDarfGeloeschtWerden,
  parseGanzzahligerKilometerstand,
  validateNeuesFahrzeugInput,
  withAusserBetrieb,
  withKennzeichen,
} from "./invariants";
