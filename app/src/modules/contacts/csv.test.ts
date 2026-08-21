import { describe, expect, it } from "vitest";
import {
  beschreibeKundenImport,
  parseKundenCsv,
  planeKundenImport,
} from "./csv";

const ZETTELRUHE_HEADER =
  "name;kontaktnummer;ist_kunde;ist_lieferant;strasse;plz;ort;land;ust_id;leitweg_id;email;telefon;iban;bic;notiz;ansprechpartner_name;ansprechpartner_email;ansprechpartner_telefon;ansprechpartner_position;ansprechpartner_weitere";

function zettelruheExport(rows: string[]): string {
  return `\uFEFF${[ZETTELRUHE_HEADER, ...rows].join("\r\n")}\r\n`;
}

describe("parseKundenCsv (Zettelruhe-Kontakte-CSV)", () => {
  it("liest Name und Kontaktnummer, ignoriert Adresse und Ansprechpartner", () => {
    const csv = zettelruheExport([
      "Müller GmbH;KT-0001;ja;nein;Beispielstraße 1;10115;Berlin;DE;;;;;;;;;",
    ]);
    const result = parseKundenCsv(csv);
    expect(result.errors).toEqual([]);
    expect(result.skipped).toBe(0);
    expect(result.items).toEqual([
      { name: "Müller GmbH", zettelruhe_kontaktnummer: "KT-0001" },
    ]);
  });

  it("nimmt nur Kund:innen, inkl. Doppelrolle, und überspringt reine Lieferant:innen", () => {
    const csv = zettelruheExport([
      "Kunde AG;KT-0001;ja;nein;;;;;;;;;;;;;;;;",
      "Lieferant OHG;KT-0002;nein;ja;;;;;;;;;;;;;;;;",
      "Beides KG;KT-0003;ja;ja;;;;;;;;;;;;;;;;",
    ]);
    const result = parseKundenCsv(csv);
    expect(result.errors).toEqual([]);
    expect(result.skipped).toBe(1);
    expect(result.items.map((i) => i.zettelruhe_kontaktnummer)).toEqual([
      "KT-0001",
      "KT-0003",
    ]);
  });

  it("überspringt Zeilen ohne Kontaktnummer und ohne Name", () => {
    const csv = zettelruheExport([
      "Mit Nummer;KT-0001;ja;nein;;;;;;;;;;;;;;;;",
      "Ohne Nummer;;ja;nein;;;;;;;;;;;;;;;;",
      ";KT-0002;ja;nein;;;;;;;;;;;;;;;;",
    ]);
    const result = parseKundenCsv(csv);
    expect(result.items).toEqual([
      { name: "Mit Nummer", zettelruhe_kontaktnummer: "KT-0001" },
    ]);
    expect(result.skipped).toBe(2);
  });

  it("defaultet ohne Rollenspalten auf Kund:in", () => {
    const csv = "name;kontaktnummer\nSolo UG;KT-0042\n";
    const result = parseKundenCsv(csv);
    expect(result.items).toEqual([
      { name: "Solo UG", zettelruhe_kontaktnummer: "KT-0042" },
    ]);
  });

  it("kennt Alias Kundennummer", () => {
    const csv = "Firma;kundennummer;Kunde\nAlpha GmbH;KT-0042;ja\n";
    const result = parseKundenCsv(csv);
    expect(result.items[0]).toEqual({
      name: "Alpha GmbH",
      zettelruhe_kontaktnummer: "KT-0042",
    });
  });

  it("erkennt Komma-Delimiter und quoted Felder", () => {
    const csv = 'name,kontaktnummer,ist_kunde\n"Müller, GmbH",KT-0007,ja\n';
    const result = parseKundenCsv(csv);
    expect(result.items).toEqual([
      { name: "Müller, GmbH", zettelruhe_kontaktnummer: "KT-0007" },
    ]);
  });

  it("lehnt leere Datei und fehlende Pflichtspalten ab", () => {
    expect(parseKundenCsv("").errors[0]).toMatch(/leer/);
    expect(parseKundenCsv("foo;bar\n").errors[0]).toMatch(/name/);
    expect(parseKundenCsv("name;ort\nA;Berlin\n").errors[0]).toMatch(
      /kontaktnummer/,
    );
  });
});

describe("planeKundenImport", () => {
  it("legt neue Nummern an und aktualisiert geänderte Namen", () => {
    const parsed = parseKundenCsv(
      "name;kontaktnummer\nAlt GmbH;KT-0001\nNeu UG;KT-0002\nAlt GmbH;KT-0001\n",
    );
    const plan = planeKundenImport(parsed, [
      {
        id: "k1",
        name: "Alter Name",
        zettelruhe_kontaktnummer: "KT-0001",
      },
    ]);
    expect(plan.anlegen).toEqual([
      { name: "Neu UG", zettelruhe_kontaktnummer: "KT-0002" },
    ]);
    expect(plan.aktualisieren).toEqual([
      {
        id: "k1",
        name: "Alt GmbH",
        zettelruhe_kontaktnummer: "KT-0001",
      },
    ]);
    expect(plan.uebersprungen).toBe(0);
  });

  it("schreibt bei gleichem Namen nicht und zählt Parser-Überspringer", () => {
    const parsed = parseKundenCsv(
      zettelruheExport([
        "Müller GmbH;KT-0001;ja;nein;;;;;;;;;;;;;;;;",
        "Nur Lieferant;KT-0009;nein;ja;;;;;;;;;;;;;;;;",
      ]),
    );
    const plan = planeKundenImport(parsed, [
      {
        id: "k1",
        name: "Müller GmbH",
        zettelruhe_kontaktnummer: "KT-0001",
      },
    ]);
    expect(plan.anlegen).toEqual([]);
    expect(plan.aktualisieren).toEqual([]);
    expect(plan.uebersprungen).toBe(1);
  });
});

describe("beschreibeKundenImport", () => {
  it("fasst die Zählung auf Deutsch", () => {
    expect(
      beschreibeKundenImport({
        angelegt: 3,
        aktualisiert: 1,
        uebersprungen: 2,
      }),
    ).toBe("3 angelegt, 1 aktualisiert, 2 übersprungen.");
  });
});
