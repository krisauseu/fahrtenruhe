/**
 * Client-Writes auf Fachcollections sind gesperrt.
 * Next schreibt mit Superuser nach Invarianten.
 */

export const CLIENT_WRITE_LOCKED = {
  createRule: null,
  updateRule: null,
  deleteRule: null,
} as const;

export const BA1_FACHCOLLECTIONS = [
  "firmen",
  "users",
  "mitgliedschaften",
] as const;

export const BA2_FACHCOLLECTIONS = ["fahrzeuge", "stammorte"] as const;

export const BA3_FACHCOLLECTIONS = ["fahrten", "korrekturspuren"] as const;

export const BA4_FACHCOLLECTIONS = ["kunden", "projekte"] as const;

export const FACHCOLLECTIONS = [
  ...BA1_FACHCOLLECTIONS,
  ...BA2_FACHCOLLECTIONS,
  ...BA3_FACHCOLLECTIONS,
  ...BA4_FACHCOLLECTIONS,
] as const;
