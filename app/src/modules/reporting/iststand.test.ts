import { describe, expect, it } from "vitest";
import type { FahrtFuerIststand } from "./iststand";
import {
  BUCHJAHR_UNGUELTIG_ERROR,
  DEFAULT_KILOMETERPAUSCHALE_SATZ,
  MONAT_UNGUELTIG_ERROR,
  ZEITRAUM_REIHENFOLGE_ERROR,
  addiereIststand,
  istVollesBuchjahr,
  kilometerpauschaleCent,
  parseIststandFilter,
  parseKilometerpauschaleSatz,
  vermoegenszuordnungBand,
} from "./iststand";
import type { IststandFilter } from "./types";

const jahrFilter: IststandFilter = { jahr: 2026 };

function fahrt(
  partial: Omit<FahrtFuerIststand, "kunde"> & { kunde?: string | null },
): FahrtFuerIststand {
  return { kunde: null, ...partial };
}

/** Geschlossene Fahrten 2026 plus Störquellen (offen, anderes Jahr). */
const buch: FahrtFuerIststand[] = [
  fahrt({
    datum: "2026-03-15",
    kilometerstand_start: 42100,
    kilometerstand_ende: 42140,
    nutzungstyp: "betrieblich",
    kunde: "mueller",
  }),
  fahrt({
    datum: "2026-03-20",
    kilometerstand_start: 42140,
    kilometerstand_ende: 42180,
    nutzungstyp: "privat",
  }),
  fahrt({
    datum: "2026-04-02",
    kilometerstand_start: 42180,
    kilometerstand_ende: 42240,
    nutzungstyp: "betrieblich",
    kunde: "schmidt",
  }),
  fahrt({
    datum: "2026-04-02",
    kilometerstand_start: 42240,
    kilometerstand_ende: 42280,
    nutzungstyp: "wohnung_taetigkeitsstaette",
  }),
  fahrt({
    datum: "2026-04-03",
    kilometerstand_start: 42280,
    kilometerstand_ende: null,
    nutzungstyp: "betrieblich",
    kunde: "mueller",
  }),
  fahrt({
    datum: "2025-12-31",
    kilometerstand_start: 42000,
    kilometerstand_ende: 42100,
    nutzungstyp: "privat",
  }),
];

describe("addiereIststand — Buchjahr", () => {
  it("addiert Kilometer je Nutzungstyp im laufenden Buchjahr", () => {
    const s = addiereIststand({
      fahrzeug: "fz1",
      fahrten: buch,
      filter: jahrFilter,
    });
    expect(s.fahrzeug).toBe("fz1");
    expect(s.jahr).toBe(2026);
    expect(s.kilometer_betrieblich).toBe(100);
    expect(s.kilometer_privat).toBe(40);
    expect(s.kilometer_wohnung_taetigkeitsstaette).toBe(40);
    expect(s.kilometer_gesamt).toBe(180);
  });

  it("setzt die Jahresquote aus betrieblich plus Wohnung–Tätigkeitsstätte", () => {
    const s = addiereIststand({
      fahrzeug: "fz1",
      fahrten: buch,
      filter: jahrFilter,
    });
    expect(s.jahresquote).toBe(140 / 180);
    expect(s.vermoegenszuordnung_band).toBe("notwendiges_betriebsvermoegen");
  });

  it("speist die Kilometerpauschale nur aus betrieblich, nicht aus Wohnung–Tätigkeitsstätte", () => {
    const s = addiereIststand({
      fahrzeug: "fz1",
      fahrten: buch,
      filter: jahrFilter,
    });
    expect(s.kilometerpauschale_satz).toBe(DEFAULT_KILOMETERPAUSCHALE_SATZ);
    expect(s.kilometerpauschale_cent).toBe(3000);
  });

  it("zählt eine offene Fahrt nicht und nimmt kein anderes Buchjahr", () => {
    const s = addiereIststand({
      fahrzeug: "fz1",
      fahrten: buch,
      filter: jahrFilter,
    });
    expect(s.kilometer_betrieblich).not.toBe(140);
    expect(s.kilometer_privat).not.toBe(140);
  });

  it("liefert leere Quote und leeres Band ohne geschlossene Fahrt", () => {
    const s = addiereIststand({
      fahrzeug: "fz1",
      fahrten: [
        fahrt({
          datum: "2026-03-15",
          kilometerstand_start: 42100,
          kilometerstand_ende: null,
          nutzungstyp: "betrieblich",
        }),
      ],
      filter: jahrFilter,
    });
    expect(s.kilometer_gesamt).toBe(0);
    expect(s.jahresquote).toBeNull();
    expect(s.vermoegenszuordnung_band).toBeNull();
    expect(s.kilometerpauschale_cent).toBe(0);
  });
});

describe("addiereIststand — Band der Vermögenszuordnung", () => {
  it("ordnet über 50 % dem notwendigen Betriebsvermögen zu", () => {
    expect(vermoegenszuordnungBand(51, 100)).toBe(
      "notwendiges_betriebsvermoegen",
    );
    const s = addiereIststand({
      fahrzeug: "fz1",
      filter: jahrFilter,
      fahrten: [
        fahrt({
          datum: "2026-01-10",
          kilometerstand_start: 0,
          kilometerstand_ende: 51,
          nutzungstyp: "betrieblich",
        }),
        fahrt({
          datum: "2026-01-11",
          kilometerstand_start: 51,
          kilometerstand_ende: 100,
          nutzungstyp: "privat",
        }),
      ],
    });
    expect(s.jahresquote).toBe(0.51);
    expect(s.vermoegenszuordnung_band).toBe("notwendiges_betriebsvermoegen");
  });

  it("ordnet 50 % und 10 % dem gewillkürten Betriebsvermögen zu", () => {
    expect(vermoegenszuordnungBand(50, 100)).toBe(
      "gewillkuertes_betriebsvermoegen",
    );
    expect(vermoegenszuordnungBand(10, 100)).toBe(
      "gewillkuertes_betriebsvermoegen",
    );
    const haelfte = addiereIststand({
      fahrzeug: "fz1",
      filter: jahrFilter,
      fahrten: [
        fahrt({
          datum: "2026-02-01",
          kilometerstand_start: 0,
          kilometerstand_ende: 50,
          nutzungstyp: "betrieblich",
        }),
        fahrt({
          datum: "2026-02-02",
          kilometerstand_start: 50,
          kilometerstand_ende: 100,
          nutzungstyp: "privat",
        }),
      ],
    });
    expect(haelfte.jahresquote).toBe(0.5);
    expect(haelfte.vermoegenszuordnung_band).toBe(
      "gewillkuertes_betriebsvermoegen",
    );
  });

  it("ordnet unter 10 % dem Privatvermögen zu", () => {
    expect(vermoegenszuordnungBand(9, 100)).toBe("privatvermoegen");
    const s = addiereIststand({
      fahrzeug: "fz1",
      filter: jahrFilter,
      fahrten: [
        fahrt({
          datum: "2026-02-01",
          kilometerstand_start: 0,
          kilometerstand_ende: 9,
          nutzungstyp: "betrieblich",
        }),
        fahrt({
          datum: "2026-02-02",
          kilometerstand_start: 9,
          kilometerstand_ende: 100,
          nutzungstyp: "privat",
        }),
      ],
    });
    expect(s.jahresquote).toBe(0.09);
    expect(s.vermoegenszuordnung_band).toBe("privatvermoegen");
  });

  it("zählt Wohnung–Tätigkeitsstätte in die Quote, nicht in die Pauschale", () => {
    const s = addiereIststand({
      fahrzeug: "fz1",
      filter: jahrFilter,
      fahrten: [
        fahrt({
          datum: "2026-05-01",
          kilometerstand_start: 0,
          kilometerstand_ende: 100,
          nutzungstyp: "wohnung_taetigkeitsstaette",
        }),
      ],
    });
    expect(s.jahresquote).toBe(1);
    expect(s.vermoegenszuordnung_band).toBe("notwendiges_betriebsvermoegen");
    expect(s.kilometerpauschale_cent).toBe(0);
    expect(s.kilometer_betrieblich).toBe(0);
  });
});

describe("addiereIststand — Filter sind dieselbe Addition", () => {
  it("schneidet auf den Monat, ohne eine zweite Quote zu erfinden", () => {
    const jahr = addiereIststand({
      fahrzeug: "fz1",
      fahrten: buch,
      filter: jahrFilter,
    });
    const maerz = addiereIststand({
      fahrzeug: "fz1",
      fahrten: buch,
      filter: { jahr: 2026, monat: 3 },
    });
    expect(maerz.kilometer_betrieblich).toBe(40);
    expect(maerz.kilometer_privat).toBe(40);
    expect(maerz.kilometer_wohnung_taetigkeitsstaette).toBe(0);
    expect(maerz.kilometer_gesamt).toBe(80);
    expect(maerz.jahresquote).toBe(0.5);
    expect(maerz.vermoegenszuordnung_band).toBe(
      "gewillkuertes_betriebsvermoegen",
    );
    expect(maerz.kilometerpauschale_cent).toBe(1200);
    expect(jahr.kilometer_gesamt).toBe(180);
    expect(istVollesBuchjahr({ jahr: 2026, monat: 3 })).toBe(false);
  });

  it("schneidet auf die Kund:in", () => {
    const s = addiereIststand({
      fahrzeug: "fz1",
      fahrten: buch,
      filter: { jahr: 2026, kunde: "mueller" },
    });
    expect(s.kilometer_betrieblich).toBe(40);
    expect(s.kilometer_privat).toBe(0);
    expect(s.kilometer_wohnung_taetigkeitsstaette).toBe(0);
    expect(s.jahresquote).toBe(1);
    expect(s.kilometerpauschale_cent).toBe(1200);
  });

  it("schneidet auf den Zeitraum", () => {
    const s = addiereIststand({
      fahrzeug: "fz1",
      fahrten: buch,
      filter: { jahr: 2026, von: "2026-04-01", bis: "2026-04-30" },
    });
    expect(s.kilometer_betrieblich).toBe(60);
    expect(s.kilometer_wohnung_taetigkeitsstaette).toBe(40);
    expect(s.kilometer_privat).toBe(0);
    expect(s.kilometer_gesamt).toBe(100);
    expect(s.jahresquote).toBe(1);
    expect(s.kilometerpauschale_cent).toBe(1800);
  });

  it("rechnet nicht auf den 31.12. hoch", () => {
    const s = addiereIststand({
      fahrzeug: "fz1",
      fahrten: [
        fahrt({
          datum: "2026-03-10",
          kilometerstand_start: 0,
          kilometerstand_ende: 100,
          nutzungstyp: "betrieblich",
        }),
      ],
      filter: { jahr: 2026, monat: 3 },
    });
    expect(s.kilometer_gesamt).toBe(100);
    expect(s.kilometerpauschale_cent).toBe(3000);
    expect(s.kilometer_gesamt).not.toBe(1200);
    expect(s.kilometerpauschale_cent).not.toBe(36000);
    expect(JSON.stringify(s)).not.toMatch(/voraussichtlich|Forecast/i);
  });
});

describe("Kilometerpauschale-Parameter", () => {
  it("nimmt 0,30 € als Default und rechnet in Cent", () => {
    expect(parseKilometerpauschaleSatz("0,30")).toBe("0.30");
    expect(parseKilometerpauschaleSatz("")).toBe("0.30");
    expect(kilometerpauschaleCent(10)).toBe(300);
    expect(kilometerpauschaleCent(10, "0,40")).toBe(400);
  });
});

describe("parseIststandFilter", () => {
  const heute = new Date("2026-08-19T12:00:00+02:00");

  it("nimmt das laufende Buchjahr als Default", () => {
    const { filter, error } = parseIststandFilter({}, heute);
    expect(error).toBeNull();
    expect(filter).toEqual({ jahr: 2026 });
    expect(istVollesBuchjahr(filter)).toBe(true);
  });

  it("nimmt Monat, Zeitraum und Kund:in", () => {
    const { filter, error } = parseIststandFilter(
      {
        jahr: "2026",
        monat: "3",
        von: "2026-03-10",
        bis: "2026-03-20",
        kunde: "mueller",
      },
      heute,
    );
    expect(error).toBeNull();
    expect(filter).toEqual({
      jahr: 2026,
      monat: 3,
      von: "2026-03-10",
      bis: "2026-03-20",
      kunde: "mueller",
    });
    expect(istVollesBuchjahr(filter)).toBe(false);
  });

  it("lehnt einen unmöglichen Monat und eine vertauschte Spanne ab", () => {
    expect(parseIststandFilter({ monat: "13" }, heute).error).toBe(
      MONAT_UNGUELTIG_ERROR,
    );
    expect(parseIststandFilter({ jahr: "foo" }, heute).error).toBe(
      BUCHJAHR_UNGUELTIG_ERROR,
    );
    expect(
      parseIststandFilter({ von: "2026-04-02", bis: "2026-04-01" }, heute)
        .error,
    ).toBe(ZEITRAUM_REIHENFOLGE_ERROR);
  });

  it("erkennt ein volles Buchjahr auch mit explizitem 1.1.–31.12.", () => {
    expect(
      istVollesBuchjahr({
        jahr: 2026,
        von: "2026-01-01",
        bis: "2026-12-31",
      }),
    ).toBe(true);
  });
});
