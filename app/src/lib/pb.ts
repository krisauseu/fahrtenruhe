/**
 * PocketBase-Zugriff (server-only).
 * Superuser für Setup und Fach-Writes. Kein Client-SDK aufs Buch.
 * fetch statt SDK, um Edge/Server-Action-Stolpersteine zu vermeiden.
 */

import { eigentuemerCreateBody } from "./setup-verified";

function pbUrl(): string {
  const url = process.env.PB_URL;
  if (!url) {
    throw new Error("PB_URL ist nicht gesetzt.");
  }
  return url.replace(/\/$/, "");
}

export type FirmaRecord = {
  id: string;
  name: string;
  strasse: string;
  plz: string;
  ort: string;
  land: string;
};

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: string;
  firma: string | null;
};

type PbList<T> = {
  items: T[];
  page: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
};

let adminToken: string | null = null;
let adminTokenAt = 0;
const ADMIN_TTL_MS = 10 * 60 * 1000;

async function pbFetch<T>(
  path: string,
  init: RequestInit & { token?: string | null } = {},
): Promise<T> {
  const { token, headers: extraHeaders, ...rest } = init;
  const headers = new Headers(extraHeaders);
  if (
    !headers.has("Content-Type") &&
    rest.body &&
    typeof rest.body === "string"
  ) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", token);
  }

  const res = await fetch(`${pbUrl()}${path}`, {
    ...rest,
    headers,
    cache: "no-store",
  });

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = (await res.json()) as {
        message?: string;
        data?: Record<string, { message?: string; code?: string }>;
      };
      detail = body.message || JSON.stringify(body);
      if (body.data && typeof body.data === "object") {
        const fieldMsgs = Object.entries(body.data)
          .map(([field, err]) => {
            const msg =
              err && typeof err === "object" && "message" in err
                ? String(err.message)
                : JSON.stringify(err);
            return `${field}: ${msg}`;
          })
          .filter(Boolean);
        if (fieldMsgs.length) {
          detail = `${detail} (${fieldMsgs.join("; ")})`;
        }
      }
    } catch {
      /* ignore */
    }
    throw new Error(`PocketBase ${res.status}: ${detail}`);
  }

  if (res.status === 204) {
    return undefined as T;
  }
  return (await res.json()) as T;
}

export async function getAdminToken(): Promise<string> {
  const now = Date.now();
  if (adminToken && now - adminTokenAt < ADMIN_TTL_MS) {
    return adminToken;
  }

  const email = process.env.PB_SUPERUSER_EMAIL;
  const password = process.env.PB_SUPERUSER_PASSWORD;
  if (!email || !password) {
    throw new Error("PB_SUPERUSER_EMAIL / PB_SUPERUSER_PASSWORD fehlen.");
  }

  const result = await pbFetch<{ token: string }>(
    "/api/collections/_superusers/auth-with-password",
    {
      method: "POST",
      body: JSON.stringify({ identity: email, password }),
    },
  );

  adminToken = result.token;
  adminTokenAt = now;
  return adminToken;
}

/** True, wenn noch keine Firma existiert → Setup-Wizard */
export async function isSetupRequired(): Promise<boolean> {
  try {
    const token = await getAdminToken();
    const list = await pbFetch<PbList<{ id: string }>>(
      "/api/collections/firmen/records?page=1&perPage=1&fields=id",
      { token },
    );
    return list.totalItems === 0;
  } catch {
    return true;
  }
}

type PbFirma = {
  id: string;
  name: string;
  strasse?: string;
  plz?: string;
  ort?: string;
  land?: string;
};

function mapFirma(r: PbFirma): FirmaRecord {
  return {
    id: r.id,
    name: r.name,
    strasse: r.strasse ?? "",
    plz: r.plz ?? "",
    ort: r.ort ?? "",
    land: r.land ?? "DE",
  };
}

export async function getFirstFirma(): Promise<FirmaRecord | null> {
  const token = await getAdminToken();
  const list = await pbFetch<PbList<PbFirma>>(
    "/api/collections/firmen/records?page=1&perPage=1",
    { token },
  );
  if (list.totalItems === 0) return null;
  return mapFirma(list.items[0]);
}

export async function getFirmaById(id: string): Promise<FirmaRecord | null> {
  try {
    const token = await getAdminToken();
    const r = await pbFetch<PbFirma>(`/api/collections/firmen/records/${id}`, {
      token,
    });
    return mapFirma(r);
  } catch {
    return null;
  }
}

/** Zuletzt aktive Firma merken (Login-Landung). */
export async function setUserFirma(
  userId: string,
  firmaId: string,
): Promise<void> {
  await updateRecord("users", userId, { firma: firmaId });
}

export async function createFirma(input: {
  name: string;
  strasse?: string;
  plz?: string;
  ort?: string;
  land?: string;
}): Promise<FirmaRecord> {
  const token = await getAdminToken();
  const r = await pbFetch<PbFirma>("/api/collections/firmen/records", {
    method: "POST",
    token,
    body: JSON.stringify({
      name: input.name,
      strasse: (input.strasse ?? "").trim(),
      plz: (input.plz ?? "").trim(),
      ort: (input.ort ?? "").trim(),
      land: (input.land ?? "DE").trim() || "DE",
    }),
  });
  return mapFirma(r);
}

/** Erst-User im Setup. verified immer true — Login ohne SMTP. */
export async function createEigentuemer(input: {
  email: string;
  password: string;
  name: string;
  firmaId: string;
}): Promise<AuthUser> {
  const token = await getAdminToken();
  const r = await pbFetch<{
    id: string;
    email: string;
    name: string;
    role: string;
    firma: string;
  }>("/api/collections/users/records", {
    method: "POST",
    token,
    body: JSON.stringify(eigentuemerCreateBody(input)),
  });
  await createRecord("mitgliedschaften", {
    user: r.id,
    firma: input.firmaId,
    rolle: "eigentuemer",
  });
  return {
    id: r.id,
    email: r.email,
    name: r.name,
    role: r.role,
    firma: r.firma || null,
  };
}

/** Login der Nutzer:in gegen PocketBase Auth — nie Superuser. */
export async function authWithPassword(
  email: string,
  password: string,
): Promise<AuthUser> {
  const result = await pbFetch<{
    record: {
      id: string;
      email: string;
      name?: string;
      role?: string;
      firma?: string;
    };
  }>("/api/collections/users/auth-with-password", {
    method: "POST",
    body: JSON.stringify({ identity: email, password }),
  });

  const record = result.record;
  return {
    id: record.id,
    email: record.email,
    name: record.name || email,
    role: record.role || "nutzer",
    firma: record.firma || null,
  };
}

export type PbListResult<T> = {
  items: T[];
  page: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
};

export type ListRecordsOptions = {
  page?: number;
  perPage?: number;
  filter?: string;
  sort?: string;
  fields?: string;
};

export async function listRecords<T>(
  collection: string,
  options: ListRecordsOptions = {},
): Promise<PbListResult<T>> {
  const token = await getAdminToken();
  const page = options.page ?? 1;
  const perPage = options.perPage ?? 50;
  const params = new URLSearchParams({
    page: String(page),
    perPage: String(perPage),
  });
  if (options.filter) params.set("filter", options.filter);
  if (options.sort) params.set("sort", options.sort);
  if (options.fields) params.set("fields", options.fields);

  return pbFetch<PbListResult<T>>(
    `/api/collections/${collection}/records?${params.toString()}`,
    { token },
  );
}

export async function getRecord<T>(
  collection: string,
  id: string,
): Promise<T> {
  const token = await getAdminToken();
  return pbFetch<T>(`/api/collections/${collection}/records/${id}`, {
    token,
  });
}

export async function createRecord<T>(
  collection: string,
  body: Record<string, unknown>,
): Promise<T> {
  const token = await getAdminToken();
  return pbFetch<T>(`/api/collections/${collection}/records`, {
    method: "POST",
    token,
    body: JSON.stringify(body),
  });
}

export async function updateRecord<T>(
  collection: string,
  id: string,
  body: Record<string, unknown>,
): Promise<T> {
  const token = await getAdminToken();
  return pbFetch<T>(`/api/collections/${collection}/records/${id}`, {
    method: "PATCH",
    token,
    body: JSON.stringify(body),
  });
}

/** PocketBase-Filter: exakte String-Gleichheit (escaped) */
export function pbEq(field: string, value: string): string {
  const escaped = value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  return `${field}="${escaped}"`;
}
