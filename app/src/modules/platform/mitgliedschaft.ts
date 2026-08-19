/**
 * Mitgliedschaften User↔Firma.
 * Writes nur über Next / Superuser.
 */

import {
  createRecord,
  getFirmaById,
  listRecords,
  pbEq,
  type FirmaRecord,
} from "@/lib/pb";
import {
  isMitgliedschaftRolle,
  type MitgliedschaftRolle,
} from "./rechte";

const COL = "mitgliedschaften";

type PbMitgliedschaft = {
  id: string;
  user: string;
  firma: string;
  rolle: string;
};

export type Mitgliedschaft = {
  id: string;
  userId: string;
  firmaId: string;
  rolle: MitgliedschaftRolle;
};

function mapMitgliedschaft(r: PbMitgliedschaft): Mitgliedschaft | null {
  if (!isMitgliedschaftRolle(r.rolle)) return null;
  return {
    id: r.id,
    userId: r.user,
    firmaId: r.firma,
    rolle: r.rolle,
  };
}

export async function createMitgliedschaft(input: {
  userId: string;
  firmaId: string;
  rolle: MitgliedschaftRolle;
}): Promise<Mitgliedschaft> {
  const r = await createRecord<PbMitgliedschaft>(COL, {
    user: input.userId,
    firma: input.firmaId,
    rolle: input.rolle,
  });
  const mapped = mapMitgliedschaft(r);
  if (!mapped) {
    throw new Error("Mitgliedschaft ungültig.");
  }
  return mapped;
}

export async function getMitgliedschaft(
  userId: string,
  firmaId: string,
): Promise<Mitgliedschaft | null> {
  const list = await listRecords<PbMitgliedschaft>(COL, {
    page: 1,
    perPage: 1,
    filter: `${pbEq("user", userId)} && ${pbEq("firma", firmaId)}`,
  });
  if (list.items.length === 0) return null;
  return mapMitgliedschaft(list.items[0]);
}

export async function listMitgliedschaftenFuerNutzer(
  userId: string,
): Promise<Mitgliedschaft[]> {
  const list = await listRecords<PbMitgliedschaft>(COL, {
    page: 1,
    perPage: 200,
    filter: pbEq("user", userId),
  });
  return list.items
    .map(mapMitgliedschaft)
    .filter((m): m is Mitgliedschaft => m !== null);
}

export async function listFirmenFuerNutzer(
  userId: string,
): Promise<FirmaRecord[]> {
  const mitgliedschaften = await listMitgliedschaftenFuerNutzer(userId);
  const firmen: FirmaRecord[] = [];
  for (const m of mitgliedschaften) {
    const firma = await getFirmaById(m.firmaId);
    if (firma) firmen.push(firma);
  }
  firmen.sort((a, b) => a.name.localeCompare(b.name, "de"));
  return firmen;
}

/**
 * Bevorzugte Firma, wenn Mitgliedschaft besteht, sonst erste Mitgliedschaft.
 */
export async function resolveMitgliedschaftFuerSession(
  userId: string,
  preferredFirmaId: string | null,
): Promise<Mitgliedschaft | null> {
  if (preferredFirmaId) {
    const preferred = await getMitgliedschaft(userId, preferredFirmaId);
    if (preferred) return preferred;
  }
  const alle = await listMitgliedschaftenFuerNutzer(userId);
  return alle[0] ?? null;
}
