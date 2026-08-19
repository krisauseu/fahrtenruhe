import { describe, expect, it } from "vitest";
import type { Fahrzeug } from "./types";
import {
  FAHRZEUG_LOESCHEN_VERBOTEN_ERROR,
  KILOMETERSTAND_GANZZAHL_ERROR,
  ablehnenFahrzeugLoeschen,
  fahrzeugDarfGeloeschtWerden,
  parseGanzzahligerKilometerstand,
  validateNeuesFahrzeugInput,
  withAusserBetrieb,
  withKennzeichen,
} from "./invariants";

const basis: Fahrzeug = {
  id: "rec_stabil_01",
  firma: "firma1",
  kennzeichen: "B-AB 1234",
  eroeffnungs_kilometerstand: 42100,
  ausser_betrieb: false,
  inbetriebnahme_am: null,
};

describe("parseGanzzahligerKilometerstand", () => {
  it("nimmt ganze Kilometer an", () => {
    expect(parseGanzzahligerKilometerstand("0")).toBe(0);
    expect(parseGanzzahligerKilometerstand("42100")).toBe(42100);
    expect(parseGanzzahligerKilometerstand(12)).toBe(12);
    expect(parseGanzzahligerKilometerstand(" 8 ")).toBe(8);
  });

  it("lehnt Nachkommastellen ab, statt still zu runden", () => {
    expect(() => parseGanzzahligerKilometerstand("123.4")).toThrow(
      KILOMETERSTAND_GANZZAHL_ERROR,
    );
    expect(() => parseGanzzahligerKilometerstand("123,4")).toThrow(
      KILOMETERSTAND_GANZZAHL_ERROR,
    );
    expect(() => parseGanzzahligerKilometerstand("123.0")).toThrow(
      KILOMETERSTAND_GANZZAHL_ERROR,
    );
    expect(() => parseGanzzahligerKilometerstand(123.4)).toThrow(
      KILOMETERSTAND_GANZZAHL_ERROR,
    );
    expect(() => parseGanzzahligerKilometerstand(123.7)).toThrow(
      KILOMETERSTAND_GANZZAHL_ERROR,
    );
  });

  it("lehnt negative und nicht-numerische Werte ab", () => {
    expect(() => parseGanzzahligerKilometerstand("-1")).toThrow(/negativ/);
    expect(() => parseGanzzahligerKilometerstand("1e3")).toThrow(
      KILOMETERSTAND_GANZZAHL_ERROR,
    );
    expect(() => parseGanzzahligerKilometerstand("")).toThrow(/erforderlich/);
  });
});

describe("validateNeuesFahrzeugInput", () => {
  it("normalisiert das Kennzeichen und verlangt ganze km", () => {
    const v = validateNeuesFahrzeugInput({
      kennzeichen: "  b-ab  1234 ",
      eroeffnungs_kilometerstand: "100",
    });
    expect(v.kennzeichen).toBe("B-AB 1234");
    expect(v.eroeffnungs_kilometerstand).toBe(100);
    expect(v.inbetriebnahme_am).toBeNull();
  });

  it("trägt keine 1-%-Felder, keinen Listenpreis, keinen Hubraum", () => {
    const v = validateNeuesFahrzeugInput({
      kennzeichen: "M-XY 1",
      eroeffnungs_kilometerstand: "1",
      inbetriebnahme_am: "",
    });
    expect(v).not.toHaveProperty("listenpreis");
    expect(v).not.toHaveProperty("hubraum");
    expect(v).not.toHaveProperty("ein_prozent");
    expect(Object.keys(v).sort()).toEqual(
      ["eroeffnungs_kilometerstand", "inbetriebnahme_am", "kennzeichen"].sort(),
    );
  });

  it("lehnt leeres Kennzeichen ab", () => {
    expect(() =>
      validateNeuesFahrzeugInput({
        kennzeichen: "   ",
        eroeffnungs_kilometerstand: "1",
      }),
    ).toThrow(/Kennzeichen/);
  });
});

describe("Kennzeichenwechsel", () => {
  it("bricht die id nicht", () => {
    const next = withKennzeichen(basis, "m-cd 99");
    expect(next.id).toBe(basis.id);
    expect(next.firma).toBe(basis.firma);
    expect(next.kennzeichen).toBe("M-CD 99");
    expect(next.eroeffnungs_kilometerstand).toBe(42100);
  });
});

describe("außer Betrieb statt Löschen", () => {
  it("setzt nur das Flag", () => {
    const next = withAusserBetrieb(basis, true);
    expect(next.id).toBe(basis.id);
    expect(next.ausser_betrieb).toBe(true);
    expect(next.kennzeichen).toBe(basis.kennzeichen);
  });

  it("verbietet Löschen", () => {
    expect(fahrzeugDarfGeloeschtWerden()).toBe(false);
    expect(() => ablehnenFahrzeugLoeschen()).toThrow(
      FAHRZEUG_LOESCHEN_VERBOTEN_ERROR,
    );
  });
});
