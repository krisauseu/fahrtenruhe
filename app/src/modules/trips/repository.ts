/**
 * Persistenz Fahrten und Korrekturspuren über PocketBase (Superuser).
 * Kein Löschen, keine stille Überschreibung nach Mitternacht.
 */

import { isoDatumInBerlin } from "@/lib/berlin-datum";
import {
  createRecord,
  getRecord,
  listRecords,
  pbEq,
  updateRecord,
} from "@/lib/pb";
import { getKunde, getProjekt } from "@/modules/contacts";
import { getStammorteStand } from "@/modules/places";
import { getFahrzeug } from "@/modules/vehicles";
import {
  FAHRT_BEREITS_GESCHLOSSEN_ERROR,
  FAHRZEUG_AUSSER_BETRIEB_ERROR,
  KEINE_AENDERUNG_ERROR,
  KUNDE_NICHT_GEFUNDEN_ERROR,
  NUR_KORREKTURSPUR_ERROR,
  PROJEKT_NICHT_GEFUNDEN_ERROR,
  applyAenderung,
  mapPersistiertesEnde,
  persistiertesEnde,
  assertKeineZweiteOffeneFahrt,
  assertKeineLuecke,
  assertKetteNachbar,
  assertZweckWennBetrieblich,
  brauchtKorrekturspur,
  erwarteterStartKilometerstand,
  isAbrechnungsstatus,
  istOffeneFahrt,
  resolveAbrechnungsstatus,
  resolveKundeUndProjekt,
  serializeBuchfelder,
  serializeUebernahmeVorher,
  snapshotBuchfelder,
  snapshotsGleich,
  validateAenderungInput,
  validateEndeInput,
  validateStartInput,
  validateUebernahmeInput,
} from "./invariants";
import type {
  Abrechnungsstatus,
  Fahrt,
  FahrtBuchfelder,
  Korrekturspur,
  Nutzungstyp,
} from "./types";

const COL_FAHRTEN = "fahrten";
const COL_SPUREN = "korrekturspuren";

type PbFahrt = {
  id: string;
  firma: string;
  fahrzeug: string;
  datum: string;
  kilometerstand_start: number;
  kilometerstand_ende?: string | number | null;
  nutzungstyp: string;
  ziel?: string;
  zweck?: string;
  angelegt_am?: string;
  vervollstaendigt_am?: string;
  kunde?: string;
  projekt?: string;
  abrechnungsstatus?: string;
  uebernahme?: boolean;
};

type PbKorrekturspur = {
  id: string;
  fahrt: string;
  wer: string;
  wann: string;
  vorher: string;
  nachher: string;
};

function mapFahrt(r: PbFahrt): Fahrt {
  const nutzungstyp = r.nutzungstyp as Nutzungstyp;
  const statusRaw = (r.abrechnungsstatus ?? "").trim();
  const abrechnungsstatus: Abrechnungsstatus = isAbrechnungsstatus(statusRaw)
    ? statusRaw
    : "nicht_abrechenbar";
  return {
    id: r.id,
    firma: r.firma,
    fahrzeug: r.fahrzeug,
    datum: r.datum,
    kilometerstand_start: Number(r.kilometerstand_start),
    kilometerstand_ende: mapPersistiertesEnde(r.kilometerstand_ende),
    nutzungstyp,
    ziel: r.ziel ?? "",
    zweck: r.zweck ?? "",
    angelegt_am: r.angelegt_am ?? "",
    vervollstaendigt_am: (r.vervollstaendigt_am ?? "").trim() || null,
    kunde: (r.kunde ?? "").trim() || null,
    projekt: (r.projekt ?? "").trim() || null,
    abrechnungsstatus,
    uebernahme: Boolean(r.uebernahme),
  };
}

async function bindKontakt(
  firmaId: string,
  nutzungstyp: Nutzungstyp,
  kundeId: string | null,
  projektId: string | null,
): Promise<{ kunde: string | null; projekt: string | null }> {
  let projektGehoertZu: string | null = null;
  if (projektId) {
    const projekt = await getProjekt(firmaId, projektId);
    if (!projekt) {
      throw new Error(PROJEKT_NICHT_GEFUNDEN_ERROR);
    }
    projektGehoertZu = projekt.kunde;
  }
  if (kundeId) {
    const kunde = await getKunde(firmaId, kundeId);
    if (!kunde) {
      throw new Error(KUNDE_NICHT_GEFUNDEN_ERROR);
    }
  }
  const bound = resolveKundeUndProjekt({
    nutzungstyp,
    kunde: kundeId,
    projekt: projektId,
    projektGehoertZu,
  });
  if (bound.kunde && bound.kunde !== kundeId) {
    const kunde = await getKunde(firmaId, bound.kunde);
    if (!kunde) {
      throw new Error(KUNDE_NICHT_GEFUNDEN_ERROR);
    }
  }
  return bound;
}

async function applyKontaktPatch(
  firmaId: string,
  current: FahrtBuchfelder,
  patch: {
    nutzungstyp?: Nutzungstyp;
    ziel?: string;
    zweck?: string;
    kilometerstand_start?: number;
    kilometerstand_ende?: number | null;
    kunde?: string | null;
    projekt?: string | null;
    abrechnungsstatus?: string | null;
  },
): Promise<FahrtBuchfelder> {
  const nutzungstyp = patch.nutzungstyp ?? current.nutzungstyp;
  const kundeId = patch.kunde !== undefined ? patch.kunde : current.kunde;
  const projektId =
    patch.projekt !== undefined ? patch.projekt : current.projekt;
  const bound = await bindKontakt(firmaId, nutzungstyp, kundeId, projektId);
  const kontextGeaendert =
    bound.kunde !== current.kunde || nutzungstyp !== current.nutzungstyp;
  const abrechnungsstatus = resolveAbrechnungsstatus({
    nutzungstyp,
    kunde: bound.kunde,
    explizit: patch.abrechnungsstatus,
    bisher: current.abrechnungsstatus,
    kontextGeaendert,
  });
  const {
    abrechnungsstatus: _status,
    kunde: _kunde,
    projekt: _projekt,
    ...rest
  } = patch;
  return applyAenderung(current, {
    ...rest,
    kunde: bound.kunde,
    projekt: bound.projekt,
    abrechnungsstatus,
  });
}

function mapSpur(r: PbKorrekturspur): Korrekturspur {
  return {
    id: r.id,
    fahrt: r.fahrt,
    wer: r.wer,
    wann: r.wann,
    vorher: r.vorher,
    nachher: r.nachher,
  };
}

export async function listFahrten(
  firmaId: string,
  fahrzeugId: string,
): Promise<Fahrt[]> {
  const items: Fahrt[] = [];
  let page = 1;
  for (;;) {
    const list = await listRecords<PbFahrt>(COL_FAHRTEN, {
      page,
      perPage: 200,
      filter: `${pbEq("firma", firmaId)} && ${pbEq("fahrzeug", fahrzeugId)}`,
      sort: "kilometerstand_start",
    });
    items.push(...list.items.map(mapFahrt));
    if (page >= list.totalPages || list.items.length === 0) break;
    page += 1;
  }
  return items;
}

export async function listFahrtenDerFirma(firmaId: string): Promise<Fahrt[]> {
  const items: Fahrt[] = [];
  let page = 1;
  for (;;) {
    const list = await listRecords<PbFahrt>(COL_FAHRTEN, {
      page,
      perPage: 200,
      filter: pbEq("firma", firmaId),
      sort: "-datum,kilometerstand_start",
    });
    items.push(...list.items.map(mapFahrt));
    if (page >= list.totalPages || list.items.length === 0) break;
    page += 1;
  }
  return items;
}

export async function getFahrt(
  firmaId: string,
  id: string,
): Promise<Fahrt | null> {
  try {
    const r = await getRecord<PbFahrt>(COL_FAHRTEN, id);
    if (r.firma !== firmaId) return null;
    return mapFahrt(r);
  } catch {
    return null;
  }
}

export function getOffeneFahrtAusListe(fahrten: Fahrt[]): Fahrt | null {
  return fahrten.find((f) => istOffeneFahrt(f)) ?? null;
}

export function getLetzteGeschlosseneAusListe(fahrten: Fahrt[]): Fahrt | null {
  const geschlossene = fahrten.filter((f) => !istOffeneFahrt(f));
  if (geschlossene.length === 0) return null;
  return geschlossene[geschlossene.length - 1];
}

export async function getOffeneFahrt(
  firmaId: string,
  fahrzeugId: string,
): Promise<Fahrt | null> {
  const fahrten = await listFahrten(firmaId, fahrzeugId);
  return getOffeneFahrtAusListe(fahrten);
}

export async function listKorrekturspuren(
  fahrtId: string,
): Promise<Korrekturspur[]> {
  const list = await listRecords<PbKorrekturspur>(COL_SPUREN, {
    page: 1,
    perPage: 200,
    filter: pbEq("fahrt", fahrtId),
    sort: "wann",
  });
  return list.items.map(mapSpur);
}

/** Korrekturspuren zu vielen Fahrten, ohne N+1. */
export async function listKorrekturspurenFuerFahrten(
  fahrtIds: string[],
): Promise<Map<string, Korrekturspur[]>> {
  const out = new Map<string, Korrekturspur[]>();
  const unique = [...new Set(fahrtIds.filter(Boolean))];
  for (const id of unique) out.set(id, []);
  const chunkSize = 40;
  for (let i = 0; i < unique.length; i += chunkSize) {
    const chunk = unique.slice(i, i + chunkSize);
    const filter = chunk.map((id) => pbEq("fahrt", id)).join(" || ");
    let page = 1;
    for (;;) {
      const list = await listRecords<PbKorrekturspur>(COL_SPUREN, {
        page,
        perPage: 200,
        filter,
        sort: "wann",
      });
      for (const r of list.items) {
        const spur = mapSpur(r);
        const arr = out.get(spur.fahrt);
        if (arr) arr.push(spur);
        else out.set(spur.fahrt, [spur]);
      }
      if (page >= list.totalPages || list.items.length === 0) break;
      page += 1;
    }
  }
  return out;
}

async function schreibeKorrekturspurText(input: {
  fahrtId: string;
  wer: string;
  wann: Date;
  vorher: string;
  nachher: string;
}): Promise<Korrekturspur> {
  const r = await createRecord<PbKorrekturspur>(COL_SPUREN, {
    fahrt: input.fahrtId,
    wer: input.wer,
    wann: input.wann.toISOString(),
    vorher: input.vorher,
    nachher: input.nachher,
  });
  return mapSpur(r);
}

async function schreibeKorrekturspur(input: {
  fahrtId: string;
  wer: string;
  wann: Date;
  vorher: FahrtBuchfelder;
  nachher: FahrtBuchfelder;
}): Promise<Korrekturspur> {
  return schreibeKorrekturspurText({
    fahrtId: input.fahrtId,
    wer: input.wer,
    wann: input.wann,
    vorher: serializeBuchfelder(input.vorher),
    nachher: serializeBuchfelder(input.nachher),
  });
}

export async function startFahrt(
  firmaId: string,
  input: {
    fahrzeug: string;
    kilometerstand_start: string | number;
    nutzungstyp: string;
    ziel?: string;
    zweck?: string;
    kunde?: string | null;
    projekt?: string | null;
    abrechnungsstatus?: string | null;
  },
  jetzt: Date = new Date(),
): Promise<Fahrt> {
  const fahrzeug = await getFahrzeug(firmaId, input.fahrzeug);
  if (!fahrzeug) {
    throw new Error("Fahrzeug nicht gefunden.");
  }
  if (fahrzeug.ausser_betrieb) {
    throw new Error(FAHRZEUG_AUSSER_BETRIEB_ERROR);
  }

  const stammorte = await getStammorteStand(firmaId);
  const v = validateStartInput({
    kilometerstand_start: input.kilometerstand_start,
    nutzungstyp: input.nutzungstyp,
    ziel: input.ziel,
    zweck: input.zweck,
    kunde: input.kunde,
    projekt: input.projekt,
    abrechnungsstatus: input.abrechnungsstatus,
    stammorte,
  });

  const bound = await bindKontakt(
    firmaId,
    v.nutzungstyp,
    v.kunde,
    v.projekt,
  );
  assertZweckWennBetrieblich(v.nutzungstyp, v.zweck, bound.kunde);
  const abrechnungsstatus = resolveAbrechnungsstatus({
    nutzungstyp: v.nutzungstyp,
    kunde: bound.kunde,
    explizit: v.abrechnungsstatus,
  });

  const fahrten = await listFahrten(firmaId, fahrzeug.id);
  assertKeineZweiteOffeneFahrt(getOffeneFahrtAusListe(fahrten) !== null);

  const letzte = getLetzteGeschlosseneAusListe(fahrten);
  const erwartet = erwarteterStartKilometerstand(
    fahrzeug.eroeffnungs_kilometerstand,
    letzte,
  );
  assertKeineLuecke(erwartet, v.kilometerstand_start);

  const r = await createRecord<PbFahrt>(COL_FAHRTEN, {
    firma: firmaId,
    fahrzeug: fahrzeug.id,
    datum: isoDatumInBerlin(jetzt),
    kilometerstand_start: v.kilometerstand_start,
    nutzungstyp: v.nutzungstyp,
    ziel: v.ziel,
    zweck: v.zweck,
    kilometerstand_ende: persistiertesEnde(null),
    angelegt_am: jetzt.toISOString(),
    vervollstaendigt_am: "",
    kunde: bound.kunde ?? "",
    projekt: bound.projekt ?? "",
    abrechnungsstatus,
    uebernahme: false,
  });
  return mapFahrt(r);
}

export async function schliessenFahrt(
  firmaId: string,
  fahrtId: string,
  input: {
    kilometerstand_ende: string | number;
    ziel?: string;
    zweck?: string;
  },
  wer: string,
  jetzt: Date = new Date(),
): Promise<{ fahrt: Fahrt; korrekturspur: Korrekturspur | null }> {
  const existing = await getFahrt(firmaId, fahrtId);
  if (!existing) {
    throw new Error("Fahrt nicht gefunden.");
  }
  if (!istOffeneFahrt(existing)) {
    throw new Error(FAHRT_BEREITS_GESCHLOSSEN_ERROR);
  }

  const ende = validateEndeInput({
    kilometerstand_start: existing.kilometerstand_start,
    kilometerstand_ende: input.kilometerstand_ende,
  });

  const stammorte = await getStammorteStand(firmaId);
  const patch = validateAenderungInput({
    ziel: input.ziel,
    zweck: input.zweck,
    stammorte,
  });

  const vorher = snapshotBuchfelder(existing);
  const nachher = applyAenderung(vorher, {
    ziel: patch.ziel,
    zweck: patch.zweck,
    kilometerstand_ende: ende,
  });
  assertZweckWennBetrieblich(
    nachher.nutzungstyp,
    nachher.zweck,
    nachher.kunde,
  );

  const fahrten = await listFahrten(firmaId, existing.fahrzeug);
  const idx = fahrten.findIndex((f) => f.id === existing.id);
  const naechste = idx >= 0 ? (fahrten[idx + 1] ?? null) : null;
  assertKetteNachbar(
    idx > 0 ? fahrten[idx - 1] : null,
    nachher,
    naechste,
  );

  const r = await updateRecord<PbFahrt>(COL_FAHRTEN, existing.id, {
    kilometerstand_ende: persistiertesEnde(ende),
    ziel: nachher.ziel,
    zweck: nachher.zweck,
  });
  const fahrt = mapFahrt(r);

  let korrekturspur: Korrekturspur | null = null;
  if (brauchtKorrekturspur(existing.datum, jetzt)) {
    korrekturspur = await schreibeKorrekturspur({
      fahrtId: existing.id,
      wer,
      wann: jetzt,
      vorher,
      nachher,
    });
  }

  return { fahrt, korrekturspur };
}

export async function vervollstaendigenFahrt(
  firmaId: string,
  fahrtId: string,
  input: {
    nutzungstyp?: string;
    ziel?: string;
    zweck?: string;
    kunde?: string | null;
    projekt?: string | null;
    abrechnungsstatus?: string | null;
  },
  jetzt: Date = new Date(),
): Promise<Fahrt> {
  const existing = await getFahrt(firmaId, fahrtId);
  if (!existing) {
    throw new Error("Fahrt nicht gefunden.");
  }
  if (brauchtKorrekturspur(existing.datum, jetzt)) {
    throw new Error(NUR_KORREKTURSPUR_ERROR);
  }

  const stammorte = await getStammorteStand(firmaId);
  const patch = validateAenderungInput({
    nutzungstyp: input.nutzungstyp,
    ziel: input.ziel,
    zweck: input.zweck,
    kunde: input.kunde,
    projekt: input.projekt,
    abrechnungsstatus: input.abrechnungsstatus,
    stammorte,
  });
  const vorher = snapshotBuchfelder(existing);
  const nachher = await applyKontaktPatch(firmaId, vorher, patch);
  if (snapshotsGleich(vorher, nachher)) {
    throw new Error(KEINE_AENDERUNG_ERROR);
  }

  const r = await updateRecord<PbFahrt>(COL_FAHRTEN, existing.id, {
    nutzungstyp: nachher.nutzungstyp,
    ziel: nachher.ziel,
    zweck: nachher.zweck,
    kunde: nachher.kunde ?? "",
    projekt: nachher.projekt ?? "",
    abrechnungsstatus: nachher.abrechnungsstatus,
    vervollstaendigt_am: jetzt.toISOString(),
  });
  return mapFahrt(r);
}

export async function korrigierenFahrt(
  firmaId: string,
  fahrtId: string,
  input: {
    nutzungstyp?: string;
    ziel?: string;
    zweck?: string;
    kilometerstand_start?: string | number;
    kilometerstand_ende?: string | number | null;
    kunde?: string | null;
    projekt?: string | null;
    abrechnungsstatus?: string | null;
  },
  wer: string,
  jetzt: Date = new Date(),
): Promise<{ fahrt: Fahrt; korrekturspur: Korrekturspur }> {
  const existing = await getFahrt(firmaId, fahrtId);
  if (!existing) {
    throw new Error("Fahrt nicht gefunden.");
  }

  const stammorte = await getStammorteStand(firmaId);
  const patch = validateAenderungInput({
    nutzungstyp: input.nutzungstyp,
    ziel: input.ziel,
    zweck: input.zweck,
    kilometerstand_start: input.kilometerstand_start,
    kilometerstand_ende: input.kilometerstand_ende,
    kunde: input.kunde,
    projekt: input.projekt,
    abrechnungsstatus: input.abrechnungsstatus,
    stammorte,
  });

  const vorher = snapshotBuchfelder(existing);
  const nachher = await applyKontaktPatch(firmaId, vorher, patch);
  if (snapshotsGleich(vorher, nachher)) {
    throw new Error(KEINE_AENDERUNG_ERROR);
  }

  const fahrten = await listFahrten(firmaId, existing.fahrzeug);
  const idx = fahrten.findIndex((f) => f.id === existing.id);
  const vorherige = idx > 0 ? fahrten[idx - 1] : null;
  const naechste = idx >= 0 ? (fahrten[idx + 1] ?? null) : null;
  assertKetteNachbar(vorherige, nachher, naechste);

  const r = await updateRecord<PbFahrt>(COL_FAHRTEN, existing.id, {
    kilometerstand_start: nachher.kilometerstand_start,
    kilometerstand_ende: persistiertesEnde(nachher.kilometerstand_ende),
    nutzungstyp: nachher.nutzungstyp,
    ziel: nachher.ziel,
    zweck: nachher.zweck,
    kunde: nachher.kunde ?? "",
    projekt: nachher.projekt ?? "",
    abrechnungsstatus: nachher.abrechnungsstatus,
  });
  const fahrt = mapFahrt(r);

  const korrekturspur = await schreibeKorrekturspur({
    fahrtId: existing.id,
    wer,
    wann: jetzt,
    vorher,
    nachher,
  });

  return { fahrt, korrekturspur };
}

export async function uebernehmenFahrt(
  firmaId: string,
  input: {
    fahrzeug: string;
    datum: string;
    kilometerstand_start: string | number;
    kilometerstand_ende: string | number;
    nutzungstyp: string;
    ziel?: string;
    zweck?: string;
    kunde?: string | null;
    projekt?: string | null;
    abrechnungsstatus?: string | null;
    quelle?: string;
  },
  wer: string,
  jetzt: Date = new Date(),
): Promise<{ fahrt: Fahrt; korrekturspur: Korrekturspur }> {
  const fahrzeug = await getFahrzeug(firmaId, input.fahrzeug);
  if (!fahrzeug) {
    throw new Error("Fahrzeug nicht gefunden.");
  }
  if (fahrzeug.ausser_betrieb) {
    throw new Error(FAHRZEUG_AUSSER_BETRIEB_ERROR);
  }

  const stammorte = await getStammorteStand(firmaId);
  const fahrten = await listFahrten(firmaId, fahrzeug.id);
  const offen = getOffeneFahrtAusListe(fahrten);
  const letzte = getLetzteGeschlosseneAusListe(fahrten);
  const erwartet = erwarteterStartKilometerstand(
    fahrzeug.eroeffnungs_kilometerstand,
    letzte,
  );

  const v = validateUebernahmeInput({
    datum: input.datum,
    kilometerstand_start: input.kilometerstand_start,
    kilometerstand_ende: input.kilometerstand_ende,
    nutzungstyp: input.nutzungstyp,
    ziel: input.ziel,
    zweck: input.zweck,
    kunde: input.kunde,
    projekt: input.projekt,
    abrechnungsstatus: input.abrechnungsstatus,
    quelle: input.quelle,
    stammorte,
    inbetriebnahme_am: fahrzeug.inbetriebnahme_am,
    heuteIso: isoDatumInBerlin(jetzt),
    erwarteterStart: erwartet,
    vorigeDatum: letzte?.datum ?? null,
    hatOffeneFahrt: offen !== null,
  });

  const bound = await bindKontakt(
    firmaId,
    v.nutzungstyp,
    v.kunde,
    v.projekt,
  );
  assertZweckWennBetrieblich(v.nutzungstyp, v.zweck, bound.kunde);
  const abrechnungsstatus = resolveAbrechnungsstatus({
    nutzungstyp: v.nutzungstyp,
    kunde: bound.kunde,
    explizit: v.abrechnungsstatus,
  });

  const nachher = {
    datum: v.datum,
    kilometerstand_start: v.kilometerstand_start,
    kilometerstand_ende: v.kilometerstand_ende,
    nutzungstyp: v.nutzungstyp,
    ziel: v.ziel,
    zweck: v.zweck,
    kunde: bound.kunde,
    projekt: bound.projekt,
    abrechnungsstatus,
  };

  const r = await createRecord<PbFahrt>(COL_FAHRTEN, {
    firma: firmaId,
    fahrzeug: fahrzeug.id,
    datum: v.datum,
    kilometerstand_start: v.kilometerstand_start,
    kilometerstand_ende: persistiertesEnde(v.kilometerstand_ende),
    nutzungstyp: v.nutzungstyp,
    ziel: v.ziel,
    zweck: v.zweck,
    angelegt_am: jetzt.toISOString(),
    vervollstaendigt_am: "",
    kunde: bound.kunde ?? "",
    projekt: bound.projekt ?? "",
    abrechnungsstatus,
    uebernahme: true,
  });
  const fahrt = mapFahrt(r);

  const korrekturspur = await schreibeKorrekturspurText({
    fahrtId: fahrt.id,
    wer,
    wann: jetzt,
    vorher: serializeUebernahmeVorher(v.quelle),
    nachher: serializeBuchfelder(nachher),
  });

  return { fahrt, korrekturspur };
}
