/**
 * Kalenderdatum in Europe/Berlin (Buchjahr, Inbetriebnahme).
 * Kein Wirtschaftsjahr.
 */

export function isoDatumInBerlin(date: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Berlin",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function kalenderjahrInBerlin(date: Date = new Date()): number {
  return Number(isoDatumInBerlin(date).slice(0, 4));
}

export const ISO_DATUM_FORMAT_ERROR =
  "Datum muss ein Datum im Format JJJJ-MM-TT sein.";

export const ISO_DATUM_UNGUELTIG_ERROR =
  "Datum ist kein gültiges Kalenderdatum.";

/** Kalendertag YYYY-MM-DD, ohne stilles Umrechnen. */
export function parseIsoKalenderdatum(raw: string): string {
  const t = (raw ?? "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(t)) {
    throw new Error(ISO_DATUM_FORMAT_ERROR);
  }
  const year = Number(t.slice(0, 4));
  const month = Number(t.slice(5, 7));
  const day = Number(t.slice(8, 10));
  const dt = new Date(Date.UTC(year, month - 1, day));
  if (
    dt.getUTCFullYear() !== year ||
    dt.getUTCMonth() !== month - 1 ||
    dt.getUTCDate() !== day
  ) {
    throw new Error(ISO_DATUM_UNGUELTIG_ERROR);
  }
  return t;
}

export function formatDatumDe(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return iso;
  return `${Number(m[3])}.${Number(m[2])}.${m[1]}`;
}

/** Zeitstempel (ISO) in Europe/Berlin, de-DE. */
export function formatZeitstempelDe(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("de-DE", {
    timeZone: "Europe/Berlin",
    day: "numeric",
    month: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}
