import { describe, expect, it } from "vitest";
import type { FirmaRecord } from "@/lib/pb";
import type { Kunde, Projekt } from "@/modules/contacts/types";
import {
  serializeBuchfelder,
  serializeUebernahmeVorher,
} from "@/modules/trips/invariants";
import type { Fahrt, FahrtBuchfelder, Korrekturspur } from "@/modules/trips/types";
import type { Fahrzeug } from "@/modules/vehicles/types";
import { baueJahresnachweis } from "./jahresnachweis";
import { renderJahresnachweisPdf } from "./pdf";
import { extractPdfText } from "./pdf-text";

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
  zettelruhe_kontakt_id: null,
};

const dach: Projekt = {
  id: "dach",
  firma: "firma1",
  kunde: "mueller",
  name: "Dachausbau",
  zettelruhe_projekt_id: null,
};

function buch(
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

const fahrt: Fahrt = {
  id: "f1",
  firma: "firma1",
  fahrzeug: "fz1",
  datum: "2026-08-19",
  kilometerstand_start: 42100,
  kilometerstand_ende: 42140,
  nutzungstyp: "betrieblich",
  ziel: "Baustelle Müller",
  zweck: "Aufmaß Dachausbau",
  angelegt_am: "2026-08-19T08:00:00.000Z",
  vervollstaendigt_am: null,
  kunde: "mueller",
  projekt: "dach",
  abrechnungsstatus: "abrechenbar",
  uebernahme: false,
};

const privat: Fahrt = {
  ...fahrt,
  id: "f2",
  kilometerstand_start: 42140,
  kilometerstand_ende: 42180,
  nutzungstyp: "privat",
  ziel: "",
  zweck: "privat",
  kunde: null,
  projekt: null,
  abrechnungsstatus: "nicht_abrechenbar",
};

const spur: Korrekturspur = {
  id: "ks1",
  fahrt: "f1",
  wer: "alex@example.de",
  wann: "2026-08-20T07:12:00.000Z",
  vorher: serializeBuchfelder(
    buch({
      datum: "2026-08-19",
      kilometerstand_start: 42100,
      kilometerstand_ende: 42140,
      zweck: "Aufmaß",
    }),
  ),
  nachher: serializeBuchfelder(
    buch({
      datum: "2026-08-19",
      kilometerstand_start: 42100,
      kilometerstand_ende: 42140,
      zweck: "Aufmaß Dachausbau",
    }),
  ),
};

describe("Jahresnachweis-PDF", () => {
  it("ist ein PDF und enthält die Korrekturspur im selben Dokument", async () => {
    const nachweis = baueJahresnachweis({
      firma,
      fahrzeug,
      buchjahr: 2026,
      fahrten: [fahrt, privat],
      korrekturspuren: [spur],
      kunden: [mueller],
      projekte: [dach],
    });
    const buf = await renderJahresnachweisPdf(
      nachweis,
      new Date("2026-08-19T12:00:00+02:00"),
    );
    expect(buf.subarray(0, 5).toString("latin1")).toBe("%PDF-");
    expect(buf.length).toBeGreaterThan(800);
    const text = extractPdfText(buf);
    expect(text).toMatch(/Fahrtenbuch/);
    expect(text).toMatch(/Jahresnachweis/);
    expect(text).toMatch(/Korrekturspur/);
    expect(text).toMatch(/alex@example\.de/);
    expect(text).toMatch(/B-CD 5678/);
    expect(text).toMatch(/nicht nachweistauglich/i);
    expect(text).toMatch(/Müller GmbH|Müller/);
    expect(text).toMatch(/betrieblich/);
    expect(text).toMatch(/privat/);
    expect(text).toMatch(/Keine Hochrechnung/);
    expect(text).not.toMatch(/ein_prozent|1_prozent|Entfernungspauschale|Forecast/i);
  });

  it("zeigt eine gekennzeichnete Übernahme und ihre Korrekturspur", async () => {
    const uebernahme: Fahrt = {
      ...fahrt,
      id: "u1",
      datum: "2026-08-19",
      uebernahme: true,
    };
    const spurUebernahme: Korrekturspur = {
      id: "ks-u",
      fahrt: "u1",
      wer: "alex@example.de",
      wann: "2026-08-19T12:00:00.000Z",
      vorher: serializeUebernahmeVorher("Papier-Fahrtenbuch"),
      nachher: serializeBuchfelder(
        buch({
          datum: "2026-08-19",
          kilometerstand_start: 42100,
          kilometerstand_ende: 42140,
        }),
      ),
    };
    const nachweis = baueJahresnachweis({
      firma,
      fahrzeug,
      buchjahr: 2026,
      fahrten: [uebernahme],
      korrekturspuren: [spurUebernahme],
      kunden: [mueller],
      projekte: [dach],
    });
    expect(nachweis.hinweis.nachweistauglich).toBe(false);
    const buf = await renderJahresnachweisPdf(
      nachweis,
      new Date("2026-08-19T12:00:00+02:00"),
    );
    const text = extractPdfText(buf);
    expect(text).toMatch(/Übernahme/);
    expect(text).toMatch(/nicht im Buch|Altbestand|Papier/);
    expect(text).toMatch(/Korrekturspur/);
    expect(text).toMatch(/nicht nachweistauglich/i);
  });
});
