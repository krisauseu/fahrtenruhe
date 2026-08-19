import { describe, expect, it } from "vitest";
import {
  FIRMA_NAME_DOPPELT_ERROR,
  isDuplicateFirmaNameError,
  normalizeFirmaName,
  validateNeueFirmaInput,
} from "./firma-invariants";

describe("normalizeFirmaName", () => {
  it("trimmt und zieht Whitespace zusammen", () => {
    expect(normalizeFirmaName("  Beispiel   UG ")).toBe("Beispiel UG");
  });
});

describe("validateNeueFirmaInput", () => {
  it("lehnt leeren Namen ab", () => {
    expect(() => validateNeueFirmaInput({ name: "   " })).toThrow(
      /erforderlich/,
    );
  });

  it("setzt Land auf DE und normalisiert den Namen", () => {
    const v = validateNeueFirmaInput({ name: "  Regel  UG  " });
    expect(v.name).toBe("Regel UG");
    expect(v.land).toBe("DE");
    expect(v.strasse).toBe("");
  });

  it("trägt keine Steuer- oder Nummernkreis-Felder", () => {
    const v = validateNeueFirmaInput({
      name: "Solo UG",
      strasse: "Weg 1",
      plz: "10115",
      ort: "Berlin",
    });
    expect(v).not.toHaveProperty("steuermodus");
    expect(v).not.toHaveProperty("skr");
    expect(v).not.toHaveProperty("nummernkreise");
    expect(v).not.toHaveProperty("steuernummer");
    expect(v).not.toHaveProperty("ust_id");
    expect(Object.keys(v).sort()).toEqual(
      ["land", "name", "ort", "plz", "strasse"].sort(),
    );
  });
});

describe("isDuplicateFirmaNameError", () => {
  it("erkennt den PocketBase-Unique-Index", () => {
    expect(
      isDuplicateFirmaNameError(
        new Error(
          "PocketBase 400: Failed to create record. (name: Value must be unique.)",
        ),
      ),
    ).toBe(true);
    expect(isDuplicateFirmaNameError(new Error("Netzwerkfehler"))).toBe(false);
    expect(FIRMA_NAME_DOPPELT_ERROR).toMatch(/bereits/);
  });
});
