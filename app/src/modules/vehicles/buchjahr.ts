/**
 * Buchjahr-Hinweis light (ADR-0018).
 * Kalenderjahr; ohne lückenlose Kette ab 1. Januar bzw. Inbetriebnahme
 * nicht nachweistauglich. Kein Forecast, kein voller Übernahme-Assistent.
 */

import {
  formatDatumDe,
  isoDatumInBerlin,
  kalenderjahrInBerlin,
} from "@/lib/berlin-datum";

export type BuchjahrHinweis = {
  buchjahr: number;
  nachweistauglich: boolean;
  /** YYYY-MM-DD — 1. Januar des Buchjahrs oder Inbetriebnahme */
  pflichtstart: string;
  text: string;
};

export function buchjahrHinweis(input: {
  inbetriebnahme_am: string | null;
  /** True, wenn die Fahrtenkette ab Pflichtstart lückenlos ist. */
  ketteAbPflichtstart: boolean;
  heute?: Date;
  /** Kalenderjahr des Buchs; Default: laufendes Jahr in Europe/Berlin */
  buchjahr?: number;
}): BuchjahrHinweis {
  const heute = input.heute ?? new Date();
  const buchjahr = input.buchjahr ?? kalenderjahrInBerlin(heute);
  const heuteIso = isoDatumInBerlin(heute);
  const jan1 = `${buchjahr}-01-01`;

  const inbetriebnahme = input.inbetriebnahme_am;
  const inbetriebnahmeDiesesJahr =
    inbetriebnahme !== null &&
    inbetriebnahme.length >= 4 &&
    Number(inbetriebnahme.slice(0, 4)) === buchjahr;

  let pflichtstart = jan1;
  if (inbetriebnahmeDiesesJahr && inbetriebnahme) {
    pflichtstart = inbetriebnahme;
  }

  if (input.ketteAbPflichtstart) {
    return {
      buchjahr,
      nachweistauglich: true,
      pflichtstart,
      text: "",
    };
  }

  if (inbetriebnahme && inbetriebnahme > heuteIso) {
    return {
      buchjahr,
      nachweistauglich: false,
      pflichtstart,
      text: `Das Buchjahr ${buchjahr} ist nicht nachweistauglich. Die Inbetriebnahme liegt noch nicht in diesem Kalenderjahr.`,
    };
  }

  if (inbetriebnahmeDiesesJahr && inbetriebnahme) {
    return {
      buchjahr,
      nachweistauglich: false,
      pflichtstart,
      text: `Das Buchjahr ${buchjahr} ist nicht nachweistauglich. Ohne lückenlose Fahrten ab der Inbetriebnahme am ${formatDatumDe(inbetriebnahme)} täuscht Fahrtenruhe kein volles Buch vor.`,
    };
  }

  return {
    buchjahr,
    nachweistauglich: false,
    pflichtstart,
    text: `Das Buchjahr ${buchjahr} ist nicht nachweistauglich. Ohne lückenlose Fahrten ab dem 1. Januar ${buchjahr} täuscht Fahrtenruhe kein volles Buch vor.`,
  };
}
