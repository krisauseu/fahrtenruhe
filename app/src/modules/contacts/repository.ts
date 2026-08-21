/**
 * Persistenz Kund:in / Projekt über PocketBase (Superuser).
 * Kein Live-Sync mit Zettelruhe.
 */

import {
  createRecord,
  getRecord,
  listRecords,
  pbEq,
  updateRecord,
} from "@/lib/pb";
import {
  beschreibeKundenImport,
  parseKundenCsv,
  planeKundenImport,
} from "./csv";
import {
  isDuplicateKontaktnummerError,
  KONTAKTNUMMER_DOPPELT_ERROR,
  validateKundeInput,
  validateProjektInput,
} from "./invariants";
import type { Kunde, Projekt } from "./types";

const COL_KUNDEN = "kunden";
const COL_PROJEKTE = "projekte";

type PbKunde = {
  id: string;
  firma: string;
  name: string;
  zettelruhe_kontakt_id?: string;
  zettelruhe_kontaktnummer?: string;
};

type PbProjekt = {
  id: string;
  firma: string;
  kunde: string;
  name: string;
  zettelruhe_projekt_id?: string;
};

function mapKunde(r: PbKunde): Kunde {
  return {
    id: r.id,
    firma: r.firma,
    name: r.name,
    zettelruhe_kontakt_id: (r.zettelruhe_kontakt_id ?? "").trim() || null,
    zettelruhe_kontaktnummer:
      (r.zettelruhe_kontaktnummer ?? "").trim() || null,
  };
}

function wrapKontaktnummerError<T>(fn: () => Promise<T>): Promise<T> {
  return fn().catch((e: unknown) => {
    if (isDuplicateKontaktnummerError(e)) {
      throw new Error(KONTAKTNUMMER_DOPPELT_ERROR);
    }
    throw e;
  });
}

function mapProjekt(r: PbProjekt): Projekt {
  return {
    id: r.id,
    firma: r.firma,
    kunde: r.kunde,
    name: r.name,
    zettelruhe_projekt_id: (r.zettelruhe_projekt_id ?? "").trim() || null,
  };
}

export async function listKunden(firmaId: string): Promise<Kunde[]> {
  const items: Kunde[] = [];
  let page = 1;
  for (;;) {
    const list = await listRecords<PbKunde>(COL_KUNDEN, {
      page,
      perPage: 200,
      filter: pbEq("firma", firmaId),
      sort: "name",
    });
    items.push(...list.items.map(mapKunde));
    if (page >= list.totalPages || list.items.length === 0) break;
    page += 1;
  }
  return items;
}

export async function getKunde(
  firmaId: string,
  id: string,
): Promise<Kunde | null> {
  try {
    const r = await getRecord<PbKunde>(COL_KUNDEN, id);
    if (r.firma !== firmaId) return null;
    return mapKunde(r);
  } catch {
    return null;
  }
}

export async function createKunde(
  firmaId: string,
  input: { name: string; zettelruhe_kontaktnummer?: string | null },
): Promise<Kunde> {
  const v = validateKundeInput(input);
  const r = await wrapKontaktnummerError(() =>
    createRecord<PbKunde>(COL_KUNDEN, {
      firma: firmaId,
      name: v.name,
      zettelruhe_kontaktnummer: v.zettelruhe_kontaktnummer ?? "",
    }),
  );
  return mapKunde(r);
}

export async function updateKunde(
  firmaId: string,
  id: string,
  input: { name: string; zettelruhe_kontaktnummer?: string | null },
): Promise<Kunde> {
  const existing = await getKunde(firmaId, id);
  if (!existing) {
    throw new Error("Kund:in nicht gefunden.");
  }
  const v = validateKundeInput(input);
  const r = await wrapKontaktnummerError(() =>
    updateRecord<PbKunde>(COL_KUNDEN, existing.id, {
      name: v.name,
      zettelruhe_kontaktnummer: v.zettelruhe_kontaktnummer ?? "",
    }),
  );
  return mapKunde(r);
}

export type KundenImportErgebnis = {
  angelegt: number;
  aktualisiert: number;
  uebersprungen: number;
  text: string;
};

export async function importKundenAusCsv(
  firmaId: string,
  text: string,
): Promise<KundenImportErgebnis> {
  const parsed = parseKundenCsv(text);
  if (parsed.errors.length > 0 && parsed.items.length === 0) {
    throw new Error(parsed.errors.join(" "));
  }
  const bestehend = await listKunden(firmaId);
  const plan = planeKundenImport(parsed, bestehend);

  let angelegt = 0;
  let aktualisiert = 0;
  const failures: string[] = [];

  for (const zeile of plan.anlegen) {
    try {
      await createKunde(firmaId, zeile);
      angelegt += 1;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "unbekannt";
      failures.push(`${zeile.name}: ${msg}`);
    }
  }
  for (const zeile of plan.aktualisieren) {
    try {
      await updateKunde(firmaId, zeile.id, {
        name: zeile.name,
        zettelruhe_kontaktnummer: zeile.zettelruhe_kontaktnummer,
      });
      aktualisiert += 1;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "unbekannt";
      failures.push(`${zeile.name}: ${msg}`);
    }
  }

  const ergebnis = {
    angelegt,
    aktualisiert,
    uebersprungen: plan.uebersprungen,
  };
  const zusammenfassung = beschreibeKundenImport(ergebnis);
  if (failures.length > 0) {
    throw new Error(
      `${zusammenfassung} ${failures.length} Fehler: ${failures.slice(0, 3).join("; ")}`,
    );
  }
  return { ...ergebnis, text: zusammenfassung };
}

export async function listProjekte(
  firmaId: string,
  kundeId?: string,
): Promise<Projekt[]> {
  const filter = kundeId
    ? `${pbEq("firma", firmaId)} && ${pbEq("kunde", kundeId)}`
    : pbEq("firma", firmaId);
  const items: Projekt[] = [];
  let page = 1;
  for (;;) {
    const list = await listRecords<PbProjekt>(COL_PROJEKTE, {
      page,
      perPage: 200,
      filter,
      sort: "name",
    });
    items.push(...list.items.map(mapProjekt));
    if (page >= list.totalPages || list.items.length === 0) break;
    page += 1;
  }
  return items;
}

export async function getProjekt(
  firmaId: string,
  id: string,
): Promise<Projekt | null> {
  try {
    const r = await getRecord<PbProjekt>(COL_PROJEKTE, id);
    if (r.firma !== firmaId) return null;
    return mapProjekt(r);
  } catch {
    return null;
  }
}

export async function createProjekt(
  firmaId: string,
  input: {
    kunde: string;
    name: string;
    zettelruhe_projekt_id?: string | null;
  },
): Promise<Projekt> {
  const v = validateProjektInput(input);
  const kunde = await getKunde(firmaId, v.kunde);
  if (!kunde) {
    throw new Error("Kund:in nicht gefunden.");
  }
  const r = await createRecord<PbProjekt>(COL_PROJEKTE, {
    firma: firmaId,
    kunde: kunde.id,
    name: v.name,
    zettelruhe_projekt_id: v.zettelruhe_projekt_id ?? "",
  });
  return mapProjekt(r);
}

export async function updateProjekt(
  firmaId: string,
  id: string,
  input: {
    kunde: string;
    name: string;
    zettelruhe_projekt_id?: string | null;
  },
): Promise<Projekt> {
  const existing = await getProjekt(firmaId, id);
  if (!existing) {
    throw new Error("Projekt nicht gefunden.");
  }
  const v = validateProjektInput(input);
  if (v.kunde !== existing.kunde) {
    throw new Error("Ein Projekt bleibt bei der:m Kund:in.");
  }
  const r = await updateRecord<PbProjekt>(COL_PROJEKTE, existing.id, {
    name: v.name,
    zettelruhe_projekt_id: v.zettelruhe_projekt_id ?? "",
  });
  return mapProjekt(r);
}
