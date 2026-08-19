import { describe, expect, it } from "vitest";
import { buchjahrHinweis } from "./buchjahr";

const mittenImJahr = new Date("2026-08-19T12:00:00+02:00");

describe("buchjahrHinweis", () => {
  it("kennzeichnet ein angebrochenes Jahr ohne Kette als nicht nachweistauglich", () => {
    const h = buchjahrHinweis({
      inbetriebnahme_am: null,
      ketteAbPflichtstart: false,
      heute: mittenImJahr,
    });
    expect(h.buchjahr).toBe(2026);
    expect(h.nachweistauglich).toBe(false);
    expect(h.pflichtstart).toBe("2026-01-01");
    expect(h.text).toMatch(/nicht nachweistauglich/);
    expect(h.text).toMatch(/1\. Januar 2026/);
    expect(h.text).not.toMatch(/Forecast|Hochrechnung|voraussichtlich/i);
  });

  it("nennt die Inbetriebnahme statt des 1. Januar, wenn sie in diesem Jahr liegt", () => {
    const h = buchjahrHinweis({
      inbetriebnahme_am: "2026-03-15",
      ketteAbPflichtstart: false,
      heute: mittenImJahr,
    });
    expect(h.nachweistauglich).toBe(false);
    expect(h.pflichtstart).toBe("2026-03-15");
    expect(h.text).toMatch(/Inbetriebnahme/);
    expect(h.text).toMatch(/15\.3\.2026/);
    expect(h.text).not.toMatch(/1\. Januar/);
  });

  it("behandelt eine Inbetriebnahme im Vorjahr wie den 1. Januar", () => {
    const h = buchjahrHinweis({
      inbetriebnahme_am: "2024-11-02",
      ketteAbPflichtstart: false,
      heute: mittenImJahr,
    });
    expect(h.pflichtstart).toBe("2026-01-01");
    expect(h.text).toMatch(/1\. Januar 2026/);
  });

  it("nimmt ein übergebenes Buchjahr statt des laufenden Jahres", () => {
    const h = buchjahrHinweis({
      inbetriebnahme_am: null,
      ketteAbPflichtstart: false,
      heute: mittenImJahr,
      buchjahr: 2025,
    });
    expect(h.buchjahr).toBe(2025);
    expect(h.pflichtstart).toBe("2025-01-01");
    expect(h.text).toMatch(/Buchjahr 2025/);
    expect(h.text).toMatch(/1\. Januar 2025/);
  });

  it("wird nachweistauglich, sobald die Kette ab Pflichtstart da ist", () => {
    const h = buchjahrHinweis({
      inbetriebnahme_am: "2026-03-15",
      ketteAbPflichtstart: true,
      heute: mittenImJahr,
    });
    expect(h.nachweistauglich).toBe(true);
    expect(h.text).toBe("");
  });
});
