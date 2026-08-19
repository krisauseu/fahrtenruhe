/**
 * Verfahrensdokumentation als Vorlage, kein Zertifikat (ADR-0016).
 * Beschreibt das Verfahren, nicht die Zahlen eines Buchjahrs.
 */

export const VERFAHRENSDOKU_TITEL = "Verfahrensdokumentation";

export const VERFAHRENSDOKU_KEIN_ZERTIFIKAT =
  "Das ist eine ausfüllbare Vorlage, kein GoBD-Zertifikat.";

export const VERFAHRENSDOKU_REPO_PFAD = "docs/verfahrensdokumentation.md";

export const VERFAHRENSDOKU_ABSCHNITTE: Array<{
  titel: string;
  text: string;
}> = [
  {
    titel: "Fahrtenbuch je Fahrzeug",
    text: "Das Buch gilt je Fahrzeug und Kalenderjahr, nicht je Person und nicht als Sammelbuch der Firma. Am Anfang steht der Eröffnungs-Kilometerstand.",
  },
  {
    titel: "Zeitnahe Erfassung",
    text: "Eine Fahrt wird mit Start- und End-Kilometerstand zeitnah angelegt. Zweck, Ziel und optionale Kund:in dürfen am selben Kalendertag (Europe/Berlin) vervollständigt werden.",
  },
  {
    titel: "Sichtbare Korrekturspur",
    text: "Nach Mitternacht ist jede Änderung eine Korrekturspur im Buch selbst (wer, wann, vorher, nachher). Stille Überschreibung gibt es nicht. Eine Fahrt wird korrigiert, nicht gelöscht.",
  },
  {
    titel: "Übernahme-Altbestand",
    text: "Fahrten aus Papier oder Datei kommen gekennzeichnet und mit Korrekturspur ins Buch. Kein stiller Import, keine automatische Lückenfüllung. Ohne lückenlose Kette ab dem 1. Januar bzw. der Inbetriebnahme bleibt das Buchjahr nicht nachweistauglich.",
  },
  {
    titel: "Das PDF ist das Buch",
    text: "Der Jahresnachweis-PDF je Fahrzeug enthält die fortlaufenden Fahrten inklusive Korrekturspur. Der Iststand ist dieselbe Addition jederzeit. Keine Hochrechnung, keine Live-API.",
  },
];
