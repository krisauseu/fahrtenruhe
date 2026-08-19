/**
 * Grobe Rechte an der Mitgliedschaft.
 * Reine Invarianten, kein I/O.
 */

export const MITGLIEDSCHAFT_ROLLEN = [
  "eigentuemer",
  "bearbeiten",
  "lesen",
] as const;

export type MitgliedschaftRolle = (typeof MITGLIEDSCHAFT_ROLLEN)[number];

export type Recht = "lesen" | "schreiben" | "verwalten";

export const INSTANZ_ROLLE_EIGENTUEMER = "eigentuemer";
export const INSTANZ_ROLLE_NUTZER = "nutzer";

export const KEINE_AENDERUNG_ERROR = "Keine Berechtigung zum Ändern.";
export const KEINE_VERWALTUNG_ERROR = "Keine Berechtigung zum Verwalten.";
export const KEIN_FIRMA_MITGLIED_ERROR = "Kein Zugang zu einer Firma.";

export function isMitgliedschaftRolle(
  value: string,
): value is MitgliedschaftRolle {
  return (MITGLIEDSCHAFT_ROLLEN as readonly string[]).includes(value);
}

export function hatRecht(
  rolle: MitgliedschaftRolle,
  recht: Recht,
): boolean {
  if (recht === "lesen") return true;
  if (recht === "schreiben") {
    return rolle === "bearbeiten" || rolle === "eigentuemer";
  }
  return rolle === "eigentuemer";
}

export function istInstanzEigentuemer(usersRole: string): boolean {
  return usersRole === INSTANZ_ROLLE_EIGENTUEMER;
}
