import { describe, expect, it } from "vitest";
import {
  ISO_DATUM_FORMAT_ERROR,
  ISO_DATUM_UNGUELTIG_ERROR,
  formatDatumDe,
  formatZeitstempelDe,
  isoDatumInBerlin,
  kalenderjahrInBerlin,
  parseIsoKalenderdatum,
} from "./berlin-datum";

describe("berlin-datum", () => {
  it("formatiert ISO nach de-DE ohne führende Nullen-Pflicht", () => {
    expect(formatDatumDe("2026-03-15")).toBe("15.3.2026");
    expect(formatDatumDe("2026-01-01")).toBe("1.1.2026");
  });

  it("nimmt das Kalenderjahr in Europe/Berlin", () => {
    expect(kalenderjahrInBerlin(new Date("2026-08-19T12:00:00+02:00"))).toBe(
      2026,
    );
    expect(isoDatumInBerlin(new Date("2026-01-01T00:30:00+01:00"))).toBe(
      "2026-01-01",
    );
  });

  it("formatiert einen ISO-Zeitstempel in Europe/Berlin", () => {
    expect(formatZeitstempelDe("2026-08-19T22:10:00.000Z")).toMatch(
      /20\.8\.2026/,
    );
  });

  it("nimmt nur echte Kalendertage im Format JJJJ-MM-TT", () => {
    expect(parseIsoKalenderdatum("2026-03-15")).toBe("2026-03-15");
    expect(() => parseIsoKalenderdatum("15.3.2026")).toThrow(
      ISO_DATUM_FORMAT_ERROR,
    );
    expect(() => parseIsoKalenderdatum("2026-02-30")).toThrow(
      ISO_DATUM_UNGUELTIG_ERROR,
    );
  });
});
