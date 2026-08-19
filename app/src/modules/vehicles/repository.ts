/**
 * Persistenz Fahrzeuge über PocketBase (Superuser).
 * Kein Löschen — nur außer Betrieb.
 */

import {
  createRecord,
  getRecord,
  listRecords,
  pbEq,
  updateRecord,
} from "@/lib/pb";
import { validateNeuesFahrzeugInput } from "./invariants";
import type { Fahrzeug, NeuesFahrzeugInput } from "./types";

const COL = "fahrzeuge";

type PbFahrzeug = {
  id: string;
  firma: string;
  kennzeichen: string;
  eroeffnungs_kilometerstand: number;
  ausser_betrieb?: boolean;
  inbetriebnahme_am?: string;
};

function mapFahrzeug(r: PbFahrzeug): Fahrzeug {
  return {
    id: r.id,
    firma: r.firma,
    kennzeichen: r.kennzeichen,
    eroeffnungs_kilometerstand: Number(r.eroeffnungs_kilometerstand),
    ausser_betrieb: Boolean(r.ausser_betrieb),
    inbetriebnahme_am: (r.inbetriebnahme_am ?? "").trim() || null,
  };
}

export async function listFahrzeuge(firmaId: string): Promise<Fahrzeug[]> {
  const list = await listRecords<PbFahrzeug>(COL, {
    page: 1,
    perPage: 200,
    filter: pbEq("firma", firmaId),
    sort: "kennzeichen",
  });
  const items = list.items.map(mapFahrzeug);
  items.sort((a, b) => {
    if (a.ausser_betrieb !== b.ausser_betrieb) {
      return a.ausser_betrieb ? 1 : -1;
    }
    return a.kennzeichen.localeCompare(b.kennzeichen, "de");
  });
  return items;
}

export async function getFahrzeug(
  firmaId: string,
  id: string,
): Promise<Fahrzeug | null> {
  try {
    const r = await getRecord<PbFahrzeug>(COL, id);
    if (r.firma !== firmaId) return null;
    return mapFahrzeug(r);
  } catch {
    return null;
  }
}

export async function createFahrzeug(
  firmaId: string,
  input: {
    kennzeichen: string;
    eroeffnungs_kilometerstand: string | number;
    inbetriebnahme_am?: string | null;
  },
): Promise<Fahrzeug> {
  const v: NeuesFahrzeugInput = validateNeuesFahrzeugInput(input);
  const r = await createRecord<PbFahrzeug>(COL, {
    firma: firmaId,
    kennzeichen: v.kennzeichen,
    eroeffnungs_kilometerstand: v.eroeffnungs_kilometerstand,
    ausser_betrieb: false,
    inbetriebnahme_am: v.inbetriebnahme_am ?? "",
  });
  return mapFahrzeug(r);
}

export async function updateFahrzeug(
  firmaId: string,
  id: string,
  input: {
    kennzeichen: string;
    eroeffnungs_kilometerstand: string | number;
    inbetriebnahme_am?: string | null;
  },
): Promise<Fahrzeug> {
  const existing = await getFahrzeug(firmaId, id);
  if (!existing) {
    throw new Error("Fahrzeug nicht gefunden.");
  }
  const v = validateNeuesFahrzeugInput(input);
  const r = await updateRecord<PbFahrzeug>(COL, existing.id, {
    kennzeichen: v.kennzeichen,
    eroeffnungs_kilometerstand: v.eroeffnungs_kilometerstand,
    inbetriebnahme_am: v.inbetriebnahme_am ?? "",
  });
  return mapFahrzeug(r);
}

export async function setFahrzeugAusserBetrieb(
  firmaId: string,
  id: string,
  ausserBetrieb: boolean,
): Promise<Fahrzeug> {
  const existing = await getFahrzeug(firmaId, id);
  if (!existing) {
    throw new Error("Fahrzeug nicht gefunden.");
  }
  const r = await updateRecord<PbFahrzeug>(COL, existing.id, {
    ausser_betrieb: ausserBetrieb,
  });
  return mapFahrzeug(r);
}
