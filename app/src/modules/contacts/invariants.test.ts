import { describe, expect, it } from "vitest";
import {
  KUNDE_PFLICHT_ERROR,
  NAME_PFLICHT_ERROR,
  ZETTELRUHE_ID_ZU_LANG_ERROR,
  normalizeZettelruheId,
  validateKundeInput,
  validateProjektInput,
} from "./invariants";

describe("Kund:in dünn", () => {
  it("nimmt Name an und lässt die Zettelruhe-Id weg", () => {
    expect(
      validateKundeInput({ name: "  Müller GmbH  ", zettelruhe_kontakt_id: "" }),
    ).toEqual({
      name: "Müller GmbH",
      zettelruhe_kontakt_id: null,
    });
  });

  it("bewahrt eine optionale Zettelruhe-Kontakt-Id als Merker", () => {
    expect(
      validateKundeInput({
        name: "Müller GmbH",
        zettelruhe_kontakt_id: " abc123xyz456789 ",
      }),
    ).toEqual({
      name: "Müller GmbH",
      zettelruhe_kontakt_id: "abc123xyz456789",
    });
  });

  it("verlangt den Namen", () => {
    expect(() => validateKundeInput({ name: "  " })).toThrow(NAME_PFLICHT_ERROR);
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
