import { describe, expect, it } from "vitest";
import {
  hatRecht,
  isMitgliedschaftRolle,
  istInstanzEigentuemer,
} from "./rechte";

describe("hatRecht", () => {
  it("gibt Lesen allen Rollen", () => {
    expect(hatRecht("lesen", "lesen")).toBe(true);
    expect(hatRecht("bearbeiten", "lesen")).toBe(true);
    expect(hatRecht("eigentuemer", "lesen")).toBe(true);
  });

  it("schreibt nur Bearbeiten und Eigentümer:in", () => {
    expect(hatRecht("lesen", "schreiben")).toBe(false);
    expect(hatRecht("bearbeiten", "schreiben")).toBe(true);
    expect(hatRecht("eigentuemer", "schreiben")).toBe(true);
  });

  it("verwaltet nur Eigentümer:in", () => {
    expect(hatRecht("lesen", "verwalten")).toBe(false);
    expect(hatRecht("bearbeiten", "verwalten")).toBe(false);
    expect(hatRecht("eigentuemer", "verwalten")).toBe(true);
  });
});

describe("istInstanzEigentuemer", () => {
  it("erkennt nur die Setup-Rolle", () => {
    expect(istInstanzEigentuemer("eigentuemer")).toBe(true);
    expect(istInstanzEigentuemer("nutzer")).toBe(false);
    expect(istInstanzEigentuemer("")).toBe(false);
  });
});

describe("isMitgliedschaftRolle", () => {
  it("nimmt nur die drei groben Rollen", () => {
    expect(isMitgliedschaftRolle("eigentuemer")).toBe(true);
    expect(isMitgliedschaftRolle("bearbeiten")).toBe(true);
    expect(isMitgliedschaftRolle("lesen")).toBe(true);
    expect(isMitgliedschaftRolle("admin")).toBe(false);
    expect(isMitgliedschaftRolle("nutzer")).toBe(false);
  });
});
