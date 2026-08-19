/**
 * Persistenz Stammorte über PocketBase (Superuser).
 * Gehören zur Firma, nicht zum Fahrzeug.
 */

import {
  createRecord,
  getRecord,
  listRecords,
  pbEq,
  updateRecord,
} from "@/lib/pb";
import {
  assertKeineZweiteArt,
  isDuplicateStammortArtError,
  isStammortArt,
  stammorteSindGleich,
  validateStammortInput,
  WOHNUNG_DOPPELT_ERROR,
  TAETIGKEITSSTAETTE_DOPPELT_ERROR,
} from "./invariants";
import type { Stammort, StammortArt, StammorteStand } from "./types";

const COL = "stammorte";

type PbStammort = {
  id: string;
  firma: string;
  art: string;
  bezeichnung: string;
  strasse?: string;
  plz?: string;
  ort?: string;
};

function mapStammort(r: PbStammort): Stammort | null {
  if (!isStammortArt(r.art)) return null;
  return {
    id: r.id,
    firma: r.firma,
    art: r.art,
    bezeichnung: r.bezeichnung,
    strasse: r.strasse ?? "",
    plz: r.plz ?? "",
    ort: r.ort ?? "",
  };
}

export async function listStammorte(firmaId: string): Promise<Stammort[]> {
  const list = await listRecords<PbStammort>(COL, {
    page: 1,
    perPage: 20,
    filter: pbEq("firma", firmaId),
  });
  return list.items
    .map(mapStammort)
    .filter((s): s is Stammort => s !== null);
}

export async function getStammort(
  firmaId: string,
  id: string,
): Promise<Stammort | null> {
  try {
    const r = await getRecord<PbStammort>(COL, id);
    if (r.firma !== firmaId) return null;
    return mapStammort(r);
  } catch {
    return null;
  }
}

export async function getStammorteStand(
  firmaId: string,
): Promise<StammorteStand> {
  const alle = await listStammorte(firmaId);
  const wohnung = alle.find((s) => s.art === "wohnung") ?? null;
  const erste =
    alle.find((s) => s.art === "erste_taetigkeitsstaette") ?? null;
  return {
    wohnung,
    erste_taetigkeitsstaette: erste,
    gleich: stammorteSindGleich(wohnung, erste),
  };
}

export async function upsertStammort(
  firmaId: string,
  input: {
    art: string;
    bezeichnung: string;
    strasse?: string;
    plz?: string;
    ort?: string;
  },
): Promise<Stammort> {
  const v = validateStammortInput(input);
  const stand = await getStammorteStand(firmaId);
  const existing = stammortFuerArt(stand, v.art);

  if (existing) {
    const r = await updateRecord<PbStammort>(COL, existing.id, {
      bezeichnung: v.bezeichnung,
      strasse: v.strasse,
      plz: v.plz,
      ort: v.ort,
    });
    const mapped = mapStammort(r);
    if (!mapped) throw new Error("Stammort ungültig.");
    return mapped;
  }

  const bestehende = [stand.wohnung, stand.erste_taetigkeitsstaette].filter(
    (s): s is Stammort => s !== null,
  );
  assertKeineZweiteArt(bestehende, v.art);

  try {
    const r = await createRecord<PbStammort>(COL, {
      firma: firmaId,
      art: v.art,
      bezeichnung: v.bezeichnung,
      strasse: v.strasse,
      plz: v.plz,
      ort: v.ort,
    });
    const mapped = mapStammort(r);
    if (!mapped) throw new Error("Stammort ungültig.");
    return mapped;
  } catch (err) {
    if (isDuplicateStammortArtError(err)) {
      throw new Error(
        v.art === "wohnung"
          ? WOHNUNG_DOPPELT_ERROR
          : TAETIGKEITSSTAETTE_DOPPELT_ERROR,
      );
    }
    throw err;
  }
}

function stammortFuerArt(
  stand: StammorteStand,
  art: StammortArt,
): Stammort | null {
  return art === "wohnung" ? stand.wohnung : stand.erste_taetigkeitsstaette;
}
