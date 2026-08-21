import { describe, expect, it } from "vitest";
import {
  KUNDE_PFLICHT_ERROR,
  NAME_PFLICHT_ERROR,
  ZETTELRUHE_ID_ZU_LANG_ERROR,
  ZETTELRUHE_KONTAKTNUMMER_ZU_LANG_ERROR,
  isDuplicateKontaktnummerError,
  KONTAKTNUMMER_DOPPELT_ERROR,
  normalizeZettelruheId,
  validateKundeInput,
  validateProjektInput,
} from "./invariants";

describe("Kund:in dünn", () => {
  it("nimmt Name an und lässt die Zettelruhe-Kontaktnummer weg", () => {
    expect(
      validateKundeInput({
        name: "  Müller GmbH  ",
        zettelruhe_kontaktnummer: "",
      }),
    ).toEqual({
      name: "Müller GmbH",
      zettelruhe_kontaktnummer: null,
    });
  });

  it("bewahrt eine optionale Zettelruhe-Kontaktnummer als Merker", () => {
    expect(
      validateKundeInput({
        name: "Müller GmbH",
        zettelruhe_kontaktnummer: " KT-0001 ",
      }),
    ).toEqual({
      name: "Müller GmbH",
      zettelruhe_kontaktnummer: "KT-0001",
    });
  });

  it("lehnt eine zu lange Kontaktnummer ab", () => {
    expect(() =>
      validateKundeInput({
        name: "Müller GmbH",
        zettelruhe_kontaktnummer: "K".repeat(33),
      }),
    ).toThrow(ZETTELRUHE_KONTAKTNUMMER_ZU_LANG_ERROR);
  });

  it("verlangt den Namen", () => {
    expect(() => validateKundeInput({ name: "  " })).toThrow(NAME_PFLICHT_ERROR);
  });

  it("erkennt doppelte Kontaktnummer an der PocketBase-Meldung", () => {
    expect(
      isDuplicateKontaktnummerError(
        new Error(
          "PocketBase 400: Failed to create record. (zettelruhe_kontaktnummer: Value must be unique.)",
        ),
      ),
    ).toBe(true);
    expect(KONTAKTNUMMER_DOPPELT_ERROR).toMatch(/bereits/);
  });
});

describe("Projekt hängt an der:m Kund:in", () => {
  it("nimmt Name und Kund:in an", () => {
    expect(
      validateProjektInput({
        kunde: "kunde1",
        name: " Dachausbau ",
        zettelruhe_projekt_id: "",
      }),
    ).toEqual({
      kunde: "kunde1",
      name: "Dachausbau",
      zettelruhe_projekt_id: null,
    });
  });

  it("verlangt die Kund:in", () => {
    expect(() =>
      validateProjektInput({ kunde: "  ", name: "Dachausbau" }),
    ).toThrow(KUNDE_PFLICHT_ERROR);
  });
});

describe("Zettelruhe-Id ist nur Merker", () => {
  it("wird leer zu null, ohne Live-Lookup", () => {
    expect(normalizeZettelruheId("")).toBeNull();
    expect(normalizeZettelruheId("   ")).toBeNull();
    expect(normalizeZettelruheId(null)).toBeNull();
  });

  it("lehnt zu lange Ids ab", () => {
    expect(() => normalizeZettelruheId("x".repeat(41))).toThrow(
      ZETTELRUHE_ID_ZU_LANG_ERROR,
    );
  });
});
