/**
 * Reine Helfer für das Jahresnachweis-PDF. Kein I/O.
 * Das PDF *ist* das Buch (ADR-0014).
 */

export const PDF_TITEL = "Fahrtenbuch";
export const PDF_UNTERTITEL = "Jahresnachweis";
export const PDF_IST_DAS_BUCH =
  "Das PDF ist das Buch für die Einsichtnahme. Korrekturspur im selben Dokument.";
export const PDF_KEINE_HOCHRECHNUNG =
  "Dieselbe Addition wie der Iststand. Keine Hochrechnung auf den 31.12.";
export const PDF_NICHT_NACHWEISTAUGLICH = "Nicht nachweistauglich";

export function pdfDateiTitel(kennzeichen: string, jahr: number): string {
  return `Fahrtenbuch ${kennzeichen} ${jahr}`;
}
