import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  VERFAHRENSDOKU_ABSCHNITTE,
  VERFAHRENSDOKU_KEIN_ZERTIFIKAT,
  VERFAHRENSDOKU_REPO_PFAD,
  VERFAHRENSDOKU_TITEL,
} from "./verfahrensdokumentation";

const vorlage = readFileSync(
  path.resolve(process.cwd(), "..", VERFAHRENSDOKU_REPO_PFAD),
  "utf8",
);

describe("Verfahrensdokumentation", () => {
  it("liegt als ausfüllbare Vorlage im Repo und ist kein Zertifikat", () => {
    expect(VERFAHRENSDOKU_TITEL).toBe("Verfahrensdokumentation");
    expect(VERFAHRENSDOKU_KEIN_ZERTIFIKAT).toMatch(/kein GoBD-Zertifikat/);
    expect(vorlage).toMatch(/Verfahrensdokumentation \(Vorlage\)/);
    expect(vorlage).toMatch(/Kein bezahltes GoBD-Zertifikat|kein bezahltes GoBD-Zertifikat/i);
    expect(vorlage).toMatch(/kein Zertifikat/i);
    expect(vorlage).not.toMatch(/zertifiziert|Zertifizierungsstelle|ISO.?27001/i);
    expect(vorlage).toMatch(/\[ \]/);
    expect(vorlage).toMatch(/Aufbewahrungsort hier eintragen/);
  });

  it("beschreibt das Verfahren, nicht die Zahlen eines Buchjahrs", () => {
    expect(vorlage).toMatch(/Fahrtenbuch \*\*je Fahrzeug\*\*|Fahrtenbuch je Fahrzeug/);
    expect(vorlage).toMatch(/Korrekturspur/);
    expect(vorlage).toMatch(/PDF je Fahrzeug \*ist\* das Buch|Das PDF \*ist\* das Buch/);
    expect(vorlage).toMatch(/Übernahme-Altbestand|gekennzeichnete/);
    expect(vorlage).toMatch(/nicht nachweistauglich/);
    expect(vorlage).toMatch(/das Verfahren/);
    expect(vorlage).not.toMatch(/220 km|84,6\s*%|66,00/);
    expect(vorlage).toMatch(/keine Hochrechnung/);
    expect(vorlage).toMatch(/keine 1-%-Berechnung/);
    expect(vorlage).not.toMatch(/Forecast|voraussichtlich/i);
    expect(VERFAHRENSDOKU_ABSCHNITTE.map((a) => a.titel)).toEqual([
      "Fahrtenbuch je Fahrzeug",
      "Zeitnahe Erfassung",
      "Sichtbare Korrekturspur",
      "Übernahme-Altbestand",
      "Das PDF ist das Buch",
    ]);
  });
});
