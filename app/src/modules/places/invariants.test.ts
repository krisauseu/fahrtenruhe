import { describe, expect, it } from "vitest";
import {
  TAETIGKEITSSTAETTE_DOPPELT_ERROR,
  WOHNUNG_DOPPELT_ERROR,
  anschriftSchluessel,
  assertKeineZweiteArt,
  stammorteSindGleich,
  validateStammortInput,
} from "./invariants";

const adresse = {
  strasse: "Musterweg 1",
  plz: "10115",
  ort: "Berlin",
};

describe("validateStammortInput", () => {
  it("gehört zur Firma, nicht zum Fahrzeug", () => {
    const v = validateStammortInput({
      art: "wohnung",
      bezeichnung: "Wohnung",
      ...adresse,
    });
    expect(v).not.toHaveProperty("fahrzeug");
    expect(Object.keys(v).sort()).toEqual(
      ["art", "bezeichnung", "ort", "plz", "strasse"].sort(),
    );
  });

  it("lehnt unbekannte Arten ab", () => {
    expect(() =>
      validateStammortInput({
        art: "baustelle",
        bezeichnung: "X",
      }),
    ).toThrow(/Art/);
  });
});

describe("Stammorte dürfen zusammenfallen", () => {
  it("erkennt gleiche Anschriften unabhängig von der Bezeichnung", () => {
    const wohnung = validateStammortInput({
      art: "wohnung",
      bezeichnung: "Zuhause",
      strasse: "  Musterweg   1 ",
      plz: "10115",
      ort: "Berlin",
    });
    const taetigkeit = validateStammortInput({
      art: "erste_taetigkeitsstaette",
      bezeichnung: "Büro",
      strasse: "Musterweg 1",
      plz: "10115",
      ort: "Berlin",
    });
    expect(stammorteSindGleich(wohnung, taetigkeit)).toBe(true);
    expect(anschriftSchluessel(wohnung)).toBe(anschriftSchluessel(taetigkeit));
  });

  it("erkennt verschiedene Anschriften", () => {
    const wohnung = validateStammortInput({
      art: "wohnung",
      bezeichnung: "Wohnung",
      strasse: "Wohnweg 2",
      plz: "10115",
      ort: "Berlin",
    });
    const taetigkeit = validateStammortInput({
      art: "erste_taetigkeitsstaette",
      bezeichnung: "Werkstatt",
      strasse: "Werkstr. 9",
      plz: "10115",
      ort: "Berlin",
    });
    expect(stammorteSindGleich(wohnung, taetigkeit)).toBe(false);
  });

  it("ist ohne Gegenstück nicht gleich", () => {
    expect(
      stammorteSindGleich(
        { strasse: "A", plz: "1", ort: "B" },
        null,
      ),
    ).toBe(false);
  });
});

describe("höchstens eine Art je Firma", () => {
  it("lehnt eine zweite Wohnung ab", () => {
    expect(() =>
      assertKeineZweiteArt([{ id: "a", art: "wohnung" }], "wohnung"),
    ).toThrow(WOHNUNG_DOPPELT_ERROR);
  });

  it("lehnt eine zweite erste Tätigkeitsstätte ab", () => {
    expect(() =>
      assertKeineZweiteArt(
        [{ id: "a", art: "erste_taetigkeitsstaette" }],
        "erste_taetigkeitsstaette",
      ),
    ).toThrow(TAETIGKEITSSTAETTE_DOPPELT_ERROR);
  });

  it("erlaubt Wohnung und erste Tätigkeitsstätte nebeneinander", () => {
    expect(() =>
      assertKeineZweiteArt([{ id: "a", art: "wohnung" }], "erste_taetigkeitsstaette"),
    ).not.toThrow();
  });

  it("erlaubt das Aktualisieren des bestehenden Stammorts", () => {
    expect(() =>
      assertKeineZweiteArt([{ id: "a", art: "wohnung" }], "wohnung", "a"),
    ).not.toThrow();
  });
});
