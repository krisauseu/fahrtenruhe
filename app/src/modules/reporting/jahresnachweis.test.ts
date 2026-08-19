import { describe, expect, it } from "vitest";
import type { FirmaRecord } from "@/lib/pb";
import type { Kunde, Projekt } from "@/modules/contacts/types";
import {
  serializeBuchfelder,
  serializeUebernahmeVorher,
} from "@/modules/trips/invariants";
import type { Fahrt, FahrtBuchfelder, Korrekturspur } from "@/modules/trips/types";
import type { Fahrzeug } from "@/modules/vehicles/types";
import { addiereIststand } from "./iststand";
import {
  baueJahresnachweis,
  beschreibeKorrekturspur,
  istAbrechenbareExportfahrt,
  jahresnachweisAlsJson,
  jahresnachweisDateiname,
  parseExportUmfang,
  parseJahresnachweisAnfrage,
  serializeJahresnachweisCsv,
  serializeJahresnachweisJson,
  UMFANG_UNGUELTIG_ERROR,
  zeilenFuerUmfang,
} from "./jahresnachweis";

const firma: FirmaRecord = {
  id: "firma1",
  name: "Beispiel UG",
  strasse: "Musterstraße 1",
  plz: "10115",
  ort: "Berlin",
  land: "DE",
};

const fahrzeug: Fahrzeug = {
  id: "fz1",
  firma: "firma1",
  kennzeichen: "B-CD 5678",
  eroeffnungs_kilometerstand: 42100,
  ausser_betrieb: false,
  inbetriebnahme_am: "2026-03-15",
};

const mueller: Kunde = {
  id: "mueller",
  firma: "firma1",
  name: "Müller GmbH",
  zettelruhe_kontakt_id: "zr-k-1",
};

const dachausbau: Projekt = {
  id: "dach",
  firma: "firma1",
  kunde: "mueller",
  name: "Dachausbau",
  zettelruhe_projekt_id: "zr-p-1",
};

function buchfelder(
  over: Partial<FahrtBuchfelder> &
    Pick<FahrtBuchfelder, "datum" | "kilometerstand_start" | "kilometerstand_ende">,
): FahrtBuchfelder {
  return {
    nutzungstyp: "betrieblich",
    ziel: "Baustelle",
    zweck: "Aufmaß",
    kunde: "mueller",
    projekt: "dach",
    abrechnungsstatus: "abrechenbar",
    ...over,
  };
}

function fahrt(
  over: Partial<Fahrt> &
    Pick<
      Fahrt,
      | "id"
      | "datum"
      | "kilometerstand_start"
      | "kilometerstand_ende"
      | "nutzungstyp"
    >,
): Fahrt {
  return {
    firma: "firma1",
    fahrzeug: "fz1",
    ziel: "",
    zweck: "",
    angelegt_am: "2026-08-19T08:00:00.000Z",
    vervollstaendigt_am: null,
    kunde: null,
    projekt: null,
    abrechnungsstatus: "nicht_abrechenbar",
    uebernahme: false,
    ...over,
  };
}

const betrieblich = fahrt({
  id: "f1",
  datum: "2026-08-19",
  kilometerstand_start: 42100,
  kilometerstand_ende: 42140,
  nutzungstyp: "betrieblich",
  ziel: "Baustelle Müller",
  zweck: "Aufmaß Dachausbau",
  kunde: "mueller",
  projekt: "dach",
  abrechnungsstatus: "abrechenbar",
});

const privat = fahrt({
  id: "f2",
  datum: "2026-08-19",
  kilometerstand_start: 42140,
  kilometerstand_ende: 42180,
  nutzungstyp: "privat",
  zweck: "privat",
});

const betrieblichOhneKunde = fahrt({
  id: "f3",
  datum: "2026-08-20",
  kilometerstand_start: 42180,
  kilometerstand_ende: 42360,
  nutzungstyp: "betrieblich",
  ziel: "Baumarkt",
  zweck: "Material",
  abrechnungsstatus: "nicht_abrechenbar",
});

const offen = fahrt({
  id: "f4",
  datum: "2026-08-21",
  kilometerstand_start: 42360,
  kilometerstand_ende: null,
  nutzungstyp: "betrieblich",
  ziel: "Behörde",
  zweck: "Antrag",
  kunde: "mueller",
  abrechnungsstatus: "abrechenbar",
});

const vorjahr = fahrt({
  id: "f0",
  datum: "2025-12-31",
  kilometerstand_start: 42000,
  kilometerstand_ende: 42100,
  nutzungstyp: "privat",
});

const spur: Korrekturspur = {
  id: "ks1",
  fahrt: "f1",
  wer: "alex@example.de",
  wann: "2026-08-20T07:12:00.000Z",
  vorher: serializeBuchfelder(
    buchfelder({
      datum: "2026-08-19",
      kilometerstand_start: 42100,
      kilometerstand_ende: 42140,
      zweck: "Aufmaß",
    }),
  ),
  nachher: serializeBuchfelder(
    buchfelder({
      datum: "2026-08-19",
      kilometerstand_start: 42100,
      kilometerstand_ende: 42140,
      zweck: "Aufmaß Dachausbau",
    }),
  ),
};

const fahrten = [vorjahr, betrieblich, privat, betrieblichOhneKunde, offen];

function nachweis() {
  return baueJahresnachweis({
    firma,
    fahrzeug,
    buchjahr: 2026,
    fahrten,
    korrekturspuren: [spur],
    kunden: [mueller],
    projekte: [dachausbau],
  });
}

describe("baueJahresnachweis — dieselbe Addition wie der Iststand", () => {
  it("nimmt addiereIststand und erfindet keine zweite Summe", () => {
    const n = nachweis();
    const erwartet = addiereIststand({
      fahrzeug: fahrzeug.id,
      fahrten,
      filter: { jahr: 2026 },
    });
    expect(n.iststand).toEqual(erwartet);
    expect(n.iststand.kilometer_betrieblich).toBe(220);
    expect(n.iststand.kilometer_privat).toBe(40);
    expect(n.iststand.kilometer_wohnung_taetigkeitsstaette).toBe(0);
    expect(n.iststand.kilometer_gesamt).toBe(260);
    expect(n.iststand.jahresquote).toBe(220 / 260);
    expect(n.iststand.vermoegenszuordnung_band).toBe(
      "notwendiges_betriebsvermoegen",
    );
    expect(n.iststand.kilometerpauschale_cent).toBe(6600);
  });

  it("rechnet nicht auf den 31.12. hoch", () => {
    const n = nachweis();
    expect(n.iststand.kilometer_gesamt).toBe(260);
    expect(n.iststand.kilometer_gesamt).not.toBe(520);
    expect(JSON.stringify(n.iststand)).not.toMatch(
      /voraussichtlich|Forecast|Hochrechnung/i,
    );
  });

  it("lässt offene Fahrten und andere Buchjahre aus der Addition", () => {
    const n = nachweis();
    expect(n.iststand.kilometer_betrieblich).toBe(220);
    expect(n.zeilen.some((z) => z.fahrt.id === "f4")).toBe(true);
    expect(n.zeilen.some((z) => z.fahrt.id === "f0")).toBe(false);
  });

  it("kennzeichnet das angebrochene Buchjahr als nicht nachweistauglich", () => {
    const n = nachweis();
    expect(n.hinweis.nachweistauglich).toBe(false);
    expect(n.hinweis.text).toMatch(/nicht nachweistauglich/);
    expect(n.hinweis.pflichtstart).toBe("2026-03-15");
  });

  it("hängt die Korrekturspur an die Fahrt, nicht als stilles Protokoll", () => {
    const n = nachweis();
    const zeile = n.zeilen.find((z) => z.fahrt.id === "f1");
    expect(zeile?.korrekturspuren).toHaveLength(1);
    expect(zeile?.korrekturspuren[0]?.wer).toBe("alex@example.de");
    const beschreibung = beschreibeKorrekturspur(zeile!.korrekturspuren[0]!);
    expect(beschreibung.aenderungen).toEqual([
      {
        feld: "Zweck",
        vorher: "Aufmaß",
        nachher: "Aufmaß Dachausbau",
      },
    ]);
  });
});

describe("CSV/JSON — Buch und abrechenbare Fahrten", () => {
  it("exportiert das ganze Buch inklusive privat und Korrekturspur", () => {
    const n = nachweis();
    const csv = serializeJahresnachweisCsv(n, "buch");
    expect(csv.charCodeAt(0)).toBe(0xfeff);
    expect(csv).toContain("id;datum;kennzeichen");
    expect(csv).toContain("f1;2026-08-19;B-CD 5678;42100;42140;40;betrieblich");
    expect(csv).toContain("Müller GmbH");
    expect(csv).toContain("Dachausbau");
    expect(csv).toContain("f2;");
    expect(csv).toContain("privat");
    expect(csv).toContain("f3;");
    expect(csv).toContain("# Korrekturspur");
    expect(csv).toContain("f1;alex@example.de");
    expect(csv).toContain("Aufmaß Dachausbau");
    expect(csv).not.toMatch(/ein_prozent|1_prozent|Entfernungspauschale|ZETTELRUHE_URL/);
  });

  it("exportiert nur geschlossene abrechenbare Fahrten", () => {
    const n = nachweis();
    expect(istAbrechenbareExportfahrt(betrieblich)).toBe(true);
    expect(istAbrechenbareExportfahrt(privat)).toBe(false);
    expect(istAbrechenbareExportfahrt(betrieblichOhneKunde)).toBe(false);
    expect(istAbrechenbareExportfahrt(offen)).toBe(false);

    const csv = serializeJahresnachweisCsv(n, "abrechenbar");
    expect(csv).toContain("f1;");
    expect(csv).toContain("abrechenbar");
    expect(csv).toContain("zr-k-1");
    expect(csv).toContain("zr-p-1");
    expect(csv).not.toContain("f2;");
    expect(csv).not.toContain("f3;");
    expect(csv).not.toContain("f4;");
    expect(csv).not.toContain("# Korrekturspur");
    expect(csv).not.toMatch(/nicht_abrechenbar/);
  });

  it("legt ins JSON des Buchs Iststand und Korrekturspur", () => {
    const n = nachweis();
    const json = jahresnachweisAlsJson(n, "buch");
    expect(json.umfang).toBe("buch");
    expect(json.nachweistauglich).toBe(false);
    expect(json.iststand).toEqual(n.iststand);
    expect(json.fahrten).toHaveLength(4);
    const erste = json.fahrten.find((f) => f.id === "f1");
    expect(erste?.kunde_name).toBe("Müller GmbH");
    expect(erste?.korrekturspuren).toHaveLength(1);
    expect(erste?.korrekturspuren[0]?.wer).toBe("alex@example.de");
    const text = serializeJahresnachweisJson(n, "buch");
    expect(text).toContain("korrekturspuren");
    expect(text).toContain("alex@example.de");
    expect(text).not.toMatch(/Forecast|Hochrechnung|ein_prozent|Entfernungspauschale/);
  });

  it("schneidet den JSON-Umfang abrechenbar, lässt die Jahresaddition unangetastet", () => {
    const n = nachweis();
    const json = jahresnachweisAlsJson(n, "abrechenbar");
    expect(json.umfang).toBe("abrechenbar");
    expect(json.fahrten).toHaveLength(1);
    expect(json.fahrten[0]?.id).toBe("f1");
    expect(json.iststand.kilometer_gesamt).toBe(260);
    expect(zeilenFuerUmfang(n, "abrechenbar")).toHaveLength(1);
  });
});

describe("Dateiname und Anfrage", () => {
  it("bildet de-DE-Dateinamen ohne Leerzeichen im Kennzeichen", () => {
    expect(
      jahresnachweisDateiname({
        art: "pdf",
        umfang: "buch",
        kennzeichen: "B-CD 5678",
        jahr: 2026,
      }),
    ).toBe("fahrtenbuch-B-CD-5678-2026.pdf");
    expect(
      jahresnachweisDateiname({
        art: "csv",
        umfang: "abrechenbar",
        kennzeichen: "B-CD 5678",
        jahr: 2026,
      }),
    ).toBe("abrechenbare-fahrten-B-CD-5678-2026.csv");
  });

  it("nimmt buch als Default und lehnt einen unbekannten Umfang ab", () => {
    expect(parseExportUmfang(undefined)).toEqual({
      umfang: "buch",
      error: null,
    });
    expect(parseExportUmfang("abrechenbar").umfang).toBe("abrechenbar");
    expect(parseExportUmfang("live-api").error).toBe(UMFANG_UNGUELTIG_ERROR);
  });

  it("nimmt das laufende Buchjahr als Default", () => {
    const { jahr, error } = parseJahresnachweisAnfrage(
      { fahrzeug: "fz1" },
      new Date("2026-08-19T12:00:00+02:00"),
    );
    expect(error).toBeNull();
    expect(jahr).toBe(2026);
  });
});

describe("Übernahme im Jahresnachweis", () => {
  it("bleibt nicht nachweistauglich, wenn die Übernahme nach dem Pflichtstart liegt", () => {
    const uebernahme = fahrt({
      id: "u1",
      datum: "2026-08-19",
      kilometerstand_start: 42100,
      kilometerstand_ende: 42140,
      nutzungstyp: "betrieblich",
      zweck: "Altbestand",
      uebernahme: true,
    });
    const n = baueJahresnachweis({
      firma,
      fahrzeug,
      buchjahr: 2026,
      fahrten: [uebernahme],
      korrekturspuren: [
        {
          id: "ks-u",
          fahrt: "u1",
          wer: "alex@example.de",
          wann: "2026-08-19T12:00:00.000Z",
          vorher: serializeUebernahmeVorher("Papier"),
          nachher: serializeBuchfelder(
            buchfelder({
              datum: "2026-08-19",
              kilometerstand_start: 42100,
              kilometerstand_ende: 42140,
              zweck: "Altbestand",
            }),
          ),
        },
      ],
      kunden: [mueller],
      projekte: [dachausbau],
    });
    expect(n.hinweis.nachweistauglich).toBe(false);
    expect(n.hinweis.text).toMatch(/nicht nachweistauglich/);
    expect(n.zeilen[0]?.fahrt.uebernahme).toBe(true);
    const csv = serializeJahresnachweisCsv(n, "buch");
    expect(csv).toMatch(/uebernahme/);
    expect(csv).toMatch(/u1;2026-08-19;B-CD 5678;42100;42140;40;betrieblich/);
    expect(csv).toMatch(/;1\r?\n/);
    const json = jahresnachweisAlsJson(n, "buch");
    expect(json.fahrten[0]?.uebernahme).toBe(true);
    const beschreibung = beschreibeKorrekturspur(n.zeilen[0]!.korrekturspuren[0]!);
    expect(beschreibung.aenderungen[0]).toEqual({
      feld: "Übernahme",
      vorher: "nicht im Buch",
      nachher: "Papier",
    });
  });

  it("wird nachweistauglich nur bei lückenloser Kette ab Pflichtstart", () => {
    const kette = [
      fahrt({
        id: "u1",
        datum: "2026-03-15",
        kilometerstand_start: 42100,
        kilometerstand_ende: 42140,
        nutzungstyp: "privat",
        uebernahme: true,
      }),
      fahrt({
        id: "u2",
        datum: "2026-03-16",
        kilometerstand_start: 42140,
        kilometerstand_ende: 42180,
        nutzungstyp: "betrieblich",
        zweck: "Behörde",
        uebernahme: true,
      }),
    ];
    const n = baueJahresnachweis({
      firma,
      fahrzeug,
      buchjahr: 2026,
      fahrten: kette,
      korrekturspuren: [],
      kunden: [],
      projekte: [],
    });
    expect(n.hinweis.nachweistauglich).toBe(true);
    expect(n.hinweis.text).toBe("");
  });
});
