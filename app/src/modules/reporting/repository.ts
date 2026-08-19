/**
 * Iststand und Jahresnachweis aus dem Buch lesen. Keine Writes.
 */

import { getFirmaById } from "@/lib/pb";
import { listKunden, listProjekte } from "@/modules/contacts";
import {
  fahrtenKetteAbPflichtstart,
  listFahrten,
  listKorrekturspurenFuerFahrten,
} from "@/modules/trips";
import { buchjahrHinweis, type BuchjahrHinweis } from "@/modules/vehicles/buchjahr";
import { getFahrzeug, listFahrzeuge, type Fahrzeug } from "@/modules/vehicles";
import { addiereIststand } from "./iststand";
import { baueJahresnachweis, type Jahresnachweis } from "./jahresnachweis";
import type { Iststand, IststandFilter } from "./types";

export type IststandBlick = {
  fahrzeug: Fahrzeug;
  iststand: Iststand;
  hinweis: BuchjahrHinweis;
};

export async function getIststandBlick(
  firmaId: string,
  fahrzeugId: string,
  filter: IststandFilter,
  satz?: string | null,
): Promise<IststandBlick | null> {
  const fahrzeug = await getFahrzeug(firmaId, fahrzeugId);
  if (!fahrzeug) return null;
  const fahrten = await listFahrten(firmaId, fahrzeug.id);
  const hinweisBasis = buchjahrHinweis({
    inbetriebnahme_am: fahrzeug.inbetriebnahme_am,
    ketteAbPflichtstart: false,
    buchjahr: filter.jahr,
  });
  const hinweis = buchjahrHinweis({
    inbetriebnahme_am: fahrzeug.inbetriebnahme_am,
    ketteAbPflichtstart: fahrtenKetteAbPflichtstart({
      eroeffnungs_kilometerstand: fahrzeug.eroeffnungs_kilometerstand,
      pflichtstart: hinweisBasis.pflichtstart,
      fahrten,
    }),
    buchjahr: filter.jahr,
  });
  return {
    fahrzeug,
    hinweis,
    iststand: addiereIststand({
      fahrzeug: fahrzeug.id,
      fahrten,
      filter,
      satz,
    }),
  };
}

export async function listIststandBlicke(
  firmaId: string,
  filter: IststandFilter,
  fahrzeugId?: string | null,
  satz?: string | null,
): Promise<IststandBlick[]> {
  if (fahrzeugId) {
    const eins = await getIststandBlick(firmaId, fahrzeugId, filter, satz);
    return eins ? [eins] : [];
  }
  const fahrzeuge = await listFahrzeuge(firmaId);
  const aktiv = fahrzeuge.filter((f) => !f.ausser_betrieb);
  const out: IststandBlick[] = [];
  for (const fahrzeug of aktiv) {
    const blick = await getIststandBlick(firmaId, fahrzeug.id, filter, satz);
    if (blick) out.push(blick);
  }
  return out;
}

export async function getJahresnachweisBlick(
  firmaId: string,
  fahrzeugId: string,
  buchjahr: number,
  satz?: string | null,
): Promise<Jahresnachweis | null> {
  const fahrzeug = await getFahrzeug(firmaId, fahrzeugId);
  if (!fahrzeug) return null;
  const firma = await getFirmaById(firmaId);
  if (!firma) return null;
  const [fahrten, kunden, projekte] = await Promise.all([
    listFahrten(firmaId, fahrzeug.id),
    listKunden(firmaId),
    listProjekte(firmaId),
  ]);
  const desJahres = fahrten.filter((f) =>
    f.datum.slice(0, 4) === String(buchjahr),
  );
  const korrekturspuren = await listKorrekturspurenFuerFahrten(
    desJahres.map((f) => f.id),
  );
  return baueJahresnachweis({
    firma,
    fahrzeug,
    buchjahr,
    fahrten,
    korrekturspuren,
    kunden,
    projekte,
    satz,
  });
}

export async function listJahresnachweisBlicke(
  firmaId: string,
  buchjahr: number,
  fahrzeugId?: string | null,
  satz?: string | null,
): Promise<Jahresnachweis[]> {
  if (fahrzeugId) {
    const eins = await getJahresnachweisBlick(
      firmaId,
      fahrzeugId,
      buchjahr,
      satz,
    );
    return eins ? [eins] : [];
  }
  const fahrzeuge = await listFahrzeuge(firmaId);
  const out: Jahresnachweis[] = [];
  for (const fahrzeug of fahrzeuge) {
    const blick = await getJahresnachweisBlick(
      firmaId,
      fahrzeug.id,
      buchjahr,
      satz,
    );
    if (blick) out.push(blick);
  }
  return out;
}
