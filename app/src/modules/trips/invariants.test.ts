import { describe, expect, it } from "vitest";
import { KILOMETERSTAND_GANZZAHL_ERROR } from "@/modules/vehicles/invariants";
import type { FahrtBuchfelder } from "./types";
import {
  ABGERECHNET_NUR_IMPORT_ERROR,
  ABRECHENBAR_NUR_MIT_KUNDE_ERROR,
  ENDE_VOR_START_ERROR,
  mapPersistiertesEnde,
  persistiertesEnde,
  FAHRT_LOESCHEN_VERBOTEN_ERROR,
  LUECKE_ERROR,
  NUR_KORREKTURSPUR_ERROR,
  NUTZUNGSTYP_UNGUELTIG_ERROR,
  OFFENE_FAHRT_EXISTIERT_ERROR,
  PROJEKT_PASST_NICHT_ERROR,
  UEBERNAHME_OFFEN_ERROR,
  UEBERNAHME_VOR_INBETRIEBNAHME_ERROR,
  UEBERNAHME_VOR_VORIGER_ERROR,
  UEBERNAHME_ZUKUNFT_ERROR,
  WOHNUNG_TAETIGKEITSSTAETTE_NICHT_ANGEBOTEN_ERROR,
  ZWECK_BETRIEBLICH_PFLICHT_ERROR,
  ablehnenFahrtLoeschen,
  angeboteneNutzungstypen,
  applyAenderung,
  assertKeineLuecke,
  assertKeineZweiteOffeneFahrt,
  assertKetteNachbar,
  assertNutzungstypErlaubt,
  brauchtKorrekturspur,
  defaultAbrechnungsstatus,
  erwarteterStartKilometerstand,
  fahrtDarfGeloeschtWerden,
  fahrtenKetteAbPflichtstart,
  istOffeneFahrt,
  istUebernahmeSpur,
  parseBuchfelder,
  parseUebernahmeVorher,
  serializeUebernahmeVorher,
  validateUebernahmeInput,
  parseFahrtKilometerstand,
  resolveAbrechnungsstatus,
  resolveKundeUndProjekt,
  serializeBuchfelder,
  snapshotsGleich,
  validateEndeInput,
  validateStartInput,
  wohnungTaetigkeitsstaetteAnbieten,
} from "./invariants";

const stammorteGleich = {
  gleich: true,
  wohnung: { id: "w" },
  erste_taetigkeitsstaette: { id: "t" },
};

const stammorteVerschieden = {
  gleich: false,
  wohnung: { id: "w" },
  erste_taetigkeitsstaette: { id: "t" },
};

const stammorteUnvollstaendig = {
  gleich: false,
  wohnung: { id: "w" },
  erste_taetigkeitsstaette: null,
};

const buch: FahrtBuchfelder = {
  datum: "2026-08-19",
  kilometerstand_start: 42100,
  kilometerstand_ende: null,
  nutzungstyp: "betrieblich",
  ziel: "Finanzamt Berlin",
  zweck: "Steuerakte abgeben",
  kunde: null,
  projekt: null,
  abrechnungsstatus: "nicht_abrechenbar",
};

describe("eine offene Fahrt", () => {
  it("erkennt Ende leer als offene Fahrt", () => {
    expect(istOffeneFahrt({ kilometerstand_ende: null })).toBe(true);
    expect(istOffeneFahrt({ kilometerstand_ende: 42140 })).toBe(false);
  });

  it("blockt eine zweite offene Fahrt", () => {
    expect(() => assertKeineZweiteOffeneFahrt(true)).toThrow(
      OFFENE_FAHRT_EXISTIERT_ERROR,
    );
    expect(() => assertKeineZweiteOffeneFahrt(false)).not.toThrow();
  });
});

describe("Lücken-Block", () => {
  it("erwartet den Eröffnungs-Kilometerstand ohne Vorgänger", () => {
    expect(erwarteterStartKilometerstand(42100, null)).toBe(42100);
  });

  it("erwartet das Ende der vorigen Fahrt", () => {
    expect(
      erwarteterStartKilometerstand(42100, { kilometerstand_ende: 42140 }),
    ).toBe(42140);
  });

  it("blockt ende(n) ≠ start(n+1)", () => {
    expect(() => assertKeineLuecke(42140, 42150)).toThrow(LUECKE_ERROR);
    expect(() => assertKeineLuecke(42140, 42140)).not.toThrow();
  });

  it("blockt eine Lücke zur nächsten Fahrt nach Korrektur", () => {
    expect(() =>
      assertKetteNachbar(
        { kilometerstand_ende: 42100 },
        { kilometerstand_start: 42100, kilometerstand_ende: 42180 },
        { kilometerstand_start: 42140 },
      ),
    ).toThrow(LUECKE_ERROR);
  });
});

describe("persistiertes Ende", () => {
  it("liest leer als offene Fahrt und 0 als geschlossene 0 km", () => {
    expect(mapPersistiertesEnde("")).toBeNull();
    expect(mapPersistiertesEnde(null)).toBeNull();
    expect(mapPersistiertesEnde("42140")).toBe(42140);
    expect(mapPersistiertesEnde(0)).toBe(0);
    expect(persistiertesEnde(null)).toBe("");
    expect(persistiertesEnde(42140)).toBe("42140");
  });
});

describe("ganzzahlige Kilometer", () => {
  it("nimmt ganze Kilometer an", () => {
    expect(parseFahrtKilometerstand("42100", "start")).toBe(42100);
    expect(validateEndeInput({ kilometerstand_start: 42100, kilometerstand_ende: "42140" })).toBe(
      42140,
    );
  });

  it("lehnt Nachkommastellen ab, statt still zu runden", () => {
    expect(() => parseFahrtKilometerstand("42100.5", "start")).toThrow(
      KILOMETERSTAND_GANZZAHL_ERROR,
    );
    expect(() => parseFahrtKilometerstand("42100,5", "ende")).toThrow(
      KILOMETERSTAND_GANZZAHL_ERROR,
    );
    expect(() =>
      validateStartInput({
        kilometerstand_start: "42100.0",
        nutzungstyp: "privat",
        stammorte: stammorteGleich,
      }),
    ).toThrow(KILOMETERSTAND_GANZZAHL_ERROR);
  });

  it("lehnt Ende unter Start ab", () => {
    expect(() =>
      validateEndeInput({ kilometerstand_start: 42100, kilometerstand_ende: "42099" }),
    ).toThrow(ENDE_VOR_START_ERROR);
  });
});

describe("Nutzungstyp Wohnung–Tätigkeitsstätte", () => {
  it("bietet den Typ nur bei verschiedenen Stammorten an", () => {
    expect(wohnungTaetigkeitsstaetteAnbieten(stammorteGleich)).toBe(false);
    expect(angeboteneNutzungstypen(stammorteGleich)).toEqual([
      "betrieblich",
      "privat",
    ]);
    expect(wohnungTaetigkeitsstaetteAnbieten(stammorteVerschieden)).toBe(true);
    expect(angeboteneNutzungstypen(stammorteVerschieden)).toContain(
      "wohnung_taetigkeitsstaette",
    );
  });

  it("bietet den Typ nicht an, wenn ein Stammort fehlt", () => {
    expect(wohnungTaetigkeitsstaetteAnbieten(stammorteUnvollstaendig)).toBe(
      false,
    );
    expect(angeboteneNutzungstypen(stammorteUnvollstaendig)).not.toContain(
      "wohnung_taetigkeitsstaette",
    );
  });

  it("lehnt den Typ ab, wenn die Stammorte gleich sind", () => {
    expect(() =>
      assertNutzungstypErlaubt("wohnung_taetigkeitsstaette", stammorteGleich),
    ).toThrow(WOHNUNG_TAETIGKEITSSTAETTE_NICHT_ANGEBOTEN_ERROR);
    expect(() =>
      validateStartInput({
        kilometerstand_start: "42100",
        nutzungstyp: "wohnung_taetigkeitsstaette",
        stammorte: stammorteGleich,
      }),
    ).toThrow(WOHNUNG_TAETIGKEITSSTAETTE_NICHT_ANGEBOTEN_ERROR);
  });

  it("nimmt den Typ bei verschiedenen Stammorten an", () => {
    const v = validateStartInput({
      kilometerstand_start: "42100",
      nutzungstyp: "wohnung_taetigkeitsstaette",
      ziel: "Büro",
      stammorte: stammorteVerschieden,
    });
    expect(v.nutzungstyp).toBe("wohnung_taetigkeitsstaette");
  });
});

describe("Nutzungstyp und Zweck", () => {
  it("kennt genau die drei Typen", () => {
    expect(() =>
      validateStartInput({
        kilometerstand_start: "1",
        nutzungstyp: "dienstlich",
        stammorte: stammorteGleich,
      }),
    ).toThrow(NUTZUNGSTYP_UNGUELTIG_ERROR);
  });

  it("verlangt bei betrieblich ohne Kund:in den Zweck", () => {
    expect(() =>
      validateStartInput({
        kilometerstand_start: "42100",
        nutzungstyp: "betrieblich",
        ziel: "Bank",
        zweck: "  ",
        stammorte: stammorteGleich,
      }),
    ).toThrow(ZWECK_BETRIEBLICH_PFLICHT_ERROR);
  });

  it("lässt betrieblich mit Kund:in ohne Zweck zu", () => {
    const v = validateStartInput({
      kilometerstand_start: "42100",
      nutzungstyp: "betrieblich",
      ziel: "Baustelle",
      zweck: "",
      kunde: "kunde1",
      stammorte: stammorteGleich,
    });
    expect(v.kunde).toBe("kunde1");
    expect(v.zweck).toBe("");
  });

  it("lässt privat ohne Zweck zu", () => {
    const v = validateStartInput({
      kilometerstand_start: "42100",
      nutzungstyp: "privat",
      stammorte: stammorteGleich,
    });
    expect(v.zweck).toBe("");
    expect(v.nutzungstyp).toBe("privat");
    expect(v.kunde).toBeNull();
  });
});

describe("Kund:in und Projekt an der Fahrt", () => {
  it("hängt das Projekt an die Kund:in", () => {
    expect(
      resolveKundeUndProjekt({
        nutzungstyp: "betrieblich",
        kunde: "kunde1",
        projekt: "proj1",
        projektGehoertZu: "kunde1",
      }),
    ).toEqual({ kunde: "kunde1", projekt: "proj1" });
  });

  it("zieht die Kund:in aus dem Projekt nach, wenn sie fehlt", () => {
    expect(
      resolveKundeUndProjekt({
        nutzungstyp: "betrieblich",
        kunde: null,
        projekt: "proj1",
        projektGehoertZu: "kunde1",
      }),
    ).toEqual({ kunde: "kunde1", projekt: "proj1" });
  });

  it("lehnt ein Projekt einer anderen Kund:in ab", () => {
    expect(() =>
      resolveKundeUndProjekt({
        nutzungstyp: "betrieblich",
        kunde: "kunde1",
        projekt: "proj2",
        projektGehoertZu: "kunde2",
      }),
    ).toThrow(PROJEKT_PASST_NICHT_ERROR);
  });

  it("trägt an privat und Wohnung–Tätigkeitsstätte keine Kund:in", () => {
    expect(
      resolveKundeUndProjekt({
        nutzungstyp: "privat",
        kunde: "kunde1",
        projekt: "proj1",
        projektGehoertZu: "kunde1",
      }),
    ).toEqual({ kunde: null, projekt: null });
    expect(
      resolveKundeUndProjekt({
        nutzungstyp: "wohnung_taetigkeitsstaette",
        kunde: "kunde1",
        projekt: null,
      }),
    ).toEqual({ kunde: null, projekt: null });
  });
});

describe("Abrechnungsstatus", () => {
  it("defaultet abrechenbar nur mit gesetzter Kund:in", () => {
    expect(
      defaultAbrechnungsstatus({
        nutzungstyp: "betrieblich",
        kunde: "kunde1",
      }),
    ).toBe("abrechenbar");
    expect(
      defaultAbrechnungsstatus({
        nutzungstyp: "betrieblich",
        kunde: null,
      }),
    ).toBe("nicht_abrechenbar");
  });

  it("defaultet privat und Wohnung–Tätigkeitsstätte auf nicht abrechenbar", () => {
    expect(
      defaultAbrechnungsstatus({ nutzungstyp: "privat", kunde: null }),
    ).toBe("nicht_abrechenbar");
    expect(
      defaultAbrechnungsstatus({
        nutzungstyp: "wohnung_taetigkeitsstaette",
        kunde: null,
      }),
    ).toBe("nicht_abrechenbar");
  });

  it("lässt Kulanz zu: Kund:in gesetzt und nicht abrechenbar", () => {
    expect(
      resolveAbrechnungsstatus({
        nutzungstyp: "betrieblich",
        kunde: "kunde1",
        explizit: "nicht_abrechenbar",
      }),
    ).toBe("nicht_abrechenbar");
  });

  it("lehnt abrechenbar ohne Kund:in ab", () => {
    expect(() =>
      resolveAbrechnungsstatus({
        nutzungstyp: "betrieblich",
        kunde: null,
        explizit: "abrechenbar",
      }),
    ).toThrow(ABRECHENBAR_NUR_MIT_KUNDE_ERROR);
  });

  it("setzt in v1 nicht selbst auf abgerechnet", () => {
    expect(() =>
      resolveAbrechnungsstatus({
        nutzungstyp: "betrieblich",
        kunde: "kunde1",
        explizit: "abgerechnet",
      }),
    ).toThrow(ABGERECHNET_NUR_IMPORT_ERROR);
  });

  it("behält Kulanz, wenn nur Ziel/Zweck wechseln", () => {
    expect(
      resolveAbrechnungsstatus({
        nutzungstyp: "betrieblich",
        kunde: "kunde1",
        bisher: "nicht_abrechenbar",
        kontextGeaendert: false,
      }),
    ).toBe("nicht_abrechenbar");
  });

  it("defaultet auf abrechenbar, wenn die Kund:in neu gesetzt wird", () => {
    expect(
      resolveAbrechnungsstatus({
        nutzungstyp: "betrieblich",
        kunde: "kunde1",
        bisher: "nicht_abrechenbar",
        kontextGeaendert: true,
      }),
    ).toBe("abrechenbar");
  });
});

describe("gleicher Kalendertag und Korrekturspur", () => {
  it("braucht am selben Kalendertag (Europe/Berlin) keine Korrekturspur", () => {
    expect(
      brauchtKorrekturspur("2026-08-19", new Date("2026-08-19T23:50:00+02:00")),
    ).toBe(false);
  });

  it("braucht nach Mitternacht Europe/Berlin eine Korrekturspur", () => {
    expect(
      brauchtKorrekturspur("2026-08-19", new Date("2026-08-20T00:10:00+02:00")),
    ).toBe(true);
    expect(NUR_KORREKTURSPUR_ERROR).toMatch(/Korrekturspur/);
  });

  it("erkennt eine Änderung der Buchfelder", () => {
    const closed = { ...buch, kilometerstand_ende: 42140 };
    expect(snapshotsGleich(buch, buch)).toBe(true);
    expect(snapshotsGleich(buch, closed)).toBe(false);
    expect(JSON.parse(serializeBuchfelder(closed)).kilometerstand_ende).toBe(
      42140,
    );
  });

  it("wendet eine Änderung an, ohne still zu löschen", () => {
    const next = applyAenderung(buch, {
      kilometerstand_ende: 42140,
      zweck: undefined,
    });
    expect(next.kilometerstand_ende).toBe(42140);
    expect(next.zweck).toBe(buch.zweck);
    expect(fahrtDarfGeloeschtWerden()).toBe(false);
    expect(() => ablehnenFahrtLoeschen()).toThrow(FAHRT_LOESCHEN_VERBOTEN_ERROR);
    expect(FAHRT_LOESCHEN_VERBOTEN_ERROR).not.toMatch(/Storno|Soft.delete/i);
  });

  it("liest alte Korrekturspur-JSON ohne Kund:in", () => {
    const alt = serializeBuchfelder({
      ...buch,
      kunde: null,
      projekt: null,
      abrechnungsstatus: "nicht_abrechenbar",
    });
    const parsed = parseBuchfelder(
      JSON.stringify({
        datum: "2026-08-19",
        kilometerstand_start: 42100,
        kilometerstand_ende: 42140,
        nutzungstyp: "betrieblich",
        ziel: "Bank",
        zweck: "Einzahlung",
      }),
    );
    expect(parsed?.kunde).toBeNull();
    expect(parsed?.abrechnungsstatus).toBe("nicht_abrechenbar");
    expect(JSON.parse(alt).zweck).toBe(buch.zweck);
  });
});

describe("fahrtenKetteAbPflichtstart", () => {
  it("ist ohne Fahrten nicht nachweistauglich", () => {
    expect(
      fahrtenKetteAbPflichtstart({
        eroeffnungs_kilometerstand: 42100,
        pflichtstart: "2026-03-15",
        fahrten: [],
      }),
    ).toBe(false);
  });

  it("bleibt falsch, wenn die erste Fahrt nach dem Pflichtstart liegt", () => {
    expect(
      fahrtenKetteAbPflichtstart({
        eroeffnungs_kilometerstand: 42100,
        pflichtstart: "2026-03-15",
        fahrten: [
          {
            datum: "2026-08-19",
            kilometerstand_start: 42100,
            kilometerstand_ende: 42140,
          },
        ],
      }),
    ).toBe(false);
  });

  it("wird wahr bei Kette ab Pflichtstart und Eröffnung", () => {
    expect(
      fahrtenKetteAbPflichtstart({
        eroeffnungs_kilometerstand: 42100,
        pflichtstart: "2026-03-15",
        fahrten: [
          {
            datum: "2026-03-15",
            kilometerstand_start: 42100,
            kilometerstand_ende: 42140,
          },
          {
            datum: "2026-03-16",
            kilometerstand_start: 42140,
            kilometerstand_ende: null,
          },
        ],
      }),
    ).toBe(true);
  });

  it("bleibt falsch, wenn die Übernahme erst nach dem Pflichtstart ansetzt", () => {
    expect(
      fahrtenKetteAbPflichtstart({
        eroeffnungs_kilometerstand: 42100,
        pflichtstart: "2026-03-15",
        fahrten: [
          {
            datum: "2026-08-19",
            kilometerstand_start: 42100,
            kilometerstand_ende: 42140,
          },
        ],
      }),
    ).toBe(false);
  });

  it("wird wahr bei lückenloser Übernahme ab Pflichtstart und Eröffnung", () => {
    expect(
      fahrtenKetteAbPflichtstart({
        eroeffnungs_kilometerstand: 42100,
        pflichtstart: "2026-03-15",
        fahrten: [
          {
            datum: "2026-03-15",
            kilometerstand_start: 42100,
            kilometerstand_ende: 42140,
          },
          {
            datum: "2026-03-16",
            kilometerstand_start: 42140,
            kilometerstand_ende: 42180,
          },
        ],
      }),
    ).toBe(true);
  });

  it("bleibt falsch bei einer Lücke in der Kette", () => {
    expect(
      fahrtenKetteAbPflichtstart({
        eroeffnungs_kilometerstand: 42100,
        pflichtstart: "2026-03-15",
        fahrten: [
          {
            datum: "2026-03-15",
            kilometerstand_start: 42100,
            kilometerstand_ende: 42140,
          },
          {
            datum: "2026-03-16",
            kilometerstand_start: 42180,
            kilometerstand_ende: 42200,
          },
        ],
      }),
    ).toBe(false);
  });
});

const uebernahmeBasis = {
  nutzungstyp: "betrieblich",
  ziel: "Finanzamt",
  zweck: "Steuerakte",
  stammorte: stammorteGleich,
  inbetriebnahme_am: "2026-03-15",
  heuteIso: "2026-08-19",
  erwarteterStart: 42100,
  vorigeDatum: null as string | null,
  hatOffeneFahrt: false,
};

describe("Übernahme-Altbestand light", () => {
  it("nimmt eine geschlossene gekennzeichnete Fahrt an der Kette an", () => {
    const v = validateUebernahmeInput({
      ...uebernahmeBasis,
      datum: "2026-03-15",
      kilometerstand_start: "42100",
      kilometerstand_ende: "42140",
      quelle: "Papier-Fahrtenbuch",
    });
    expect(v.datum).toBe("2026-03-15");
    expect(v.kilometerstand_start).toBe(42100);
    expect(v.kilometerstand_ende).toBe(42140);
    expect(v.quelle).toBe("Papier-Fahrtenbuch");
    expect(istUebernahmeSpur({ vorher: serializeUebernahmeVorher(v.quelle) })).toBe(
      true,
    );
    expect(parseUebernahmeVorher(serializeUebernahmeVorher(v.quelle))?.quelle).toBe(
      "Papier-Fahrtenbuch",
    );
  });

  it("blockt eine Lücke statt privat zu füllen", () => {
    expect(() =>
      validateUebernahmeInput({
        ...uebernahmeBasis,
        datum: "2026-03-15",
        kilometerstand_start: "42180",
        kilometerstand_ende: "42200",
      }),
    ).toThrow(LUECKE_ERROR);
  });

  it("lehnt eine offene Übernahme ab", () => {
    expect(() =>
      validateUebernahmeInput({
        ...uebernahmeBasis,
        datum: "2026-03-15",
        kilometerstand_start: "42100",
        kilometerstand_ende: "",
      }),
    ).toThrow(UEBERNAHME_OFFEN_ERROR);
  });

  it("lehnt Zukunft, Datum vor Inbetriebnahme und vor der vorigen Fahrt ab", () => {
    expect(() =>
      validateUebernahmeInput({
        ...uebernahmeBasis,
        datum: "2026-08-20",
        kilometerstand_start: "42100",
        kilometerstand_ende: "42140",
      }),
    ).toThrow(UEBERNAHME_ZUKUNFT_ERROR);
    expect(() =>
      validateUebernahmeInput({
        ...uebernahmeBasis,
        datum: "2026-03-14",
        kilometerstand_start: "42100",
        kilometerstand_ende: "42140",
      }),
    ).toThrow(UEBERNAHME_VOR_INBETRIEBNAHME_ERROR);
    expect(() =>
      validateUebernahmeInput({
        ...uebernahmeBasis,
        datum: "2026-03-16",
        kilometerstand_start: "42140",
        kilometerstand_ende: "42180",
        erwarteterStart: 42140,
        vorigeDatum: "2026-03-20",
      }),
    ).toThrow(UEBERNAHME_VOR_VORIGER_ERROR);
  });

  it("blockt eine zweite offene Fahrt und Nachkommastellen", () => {
    expect(() =>
      validateUebernahmeInput({
        ...uebernahmeBasis,
        datum: "2026-03-15",
        kilometerstand_start: "42100",
        kilometerstand_ende: "42140",
        hatOffeneFahrt: true,
      }),
    ).toThrow(OFFENE_FAHRT_EXISTIERT_ERROR);
    expect(() =>
      validateUebernahmeInput({
        ...uebernahmeBasis,
        datum: "2026-03-15",
        kilometerstand_start: "42100.5",
        kilometerstand_ende: "42140",
      }),
    ).toThrow(KILOMETERSTAND_GANZZAHL_ERROR);
  });

  it("erkennt die Korrekturspur der Übernahme, nicht eine stille Änderung", () => {
    const vorher = serializeUebernahmeVorher("Datei 2026");
    expect(istUebernahmeSpur({ vorher })).toBe(true);
    expect(istUebernahmeSpur({ vorher: serializeBuchfelder(buch) })).toBe(
      false,
    );
    expect(parseBuchfelder(vorher)).toBeNull();
  });
});
