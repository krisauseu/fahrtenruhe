import { checkRuntimeEnv, type EnvCheck } from "./env";

export const SERVICE_NAME = "fahrtenruhe";

export type PocketBaseHealth = "ok" | "unreachable" | "skipped";

export type HealthBody = {
  ok: boolean;
  service: typeof SERVICE_NAME;
  env: "ok" | "error";
  pocketbase: PocketBaseHealth;
  env_errors?: string[];
  env_warnings?: string[];
};

export function buildHealthBody(input: {
  env: EnvCheck;
  pocketbase: PocketBaseHealth;
}): HealthBody {
  const body: HealthBody = {
    ok: input.env.ok && input.pocketbase !== "unreachable",
    service: SERVICE_NAME,
    env: input.env.ok ? "ok" : "error",
    pocketbase: input.pocketbase,
  };
  if (input.env.errors.length > 0) {
    body.env_errors = input.env.errors;
  }
  if (input.env.warnings.length > 0) {
    body.env_warnings = input.env.warnings;
  }
  return body;
}

export async function pingPocketBase(
  pbUrl: string | undefined,
): Promise<PocketBaseHealth> {
  const url = pbUrl?.replace(/\/$/, "");
  if (!url) return "skipped";
  try {
    const res = await fetch(`${url}/api/health`, {
      cache: "no-store",
      signal: AbortSignal.timeout(2500),
    });
    return res.ok ? "ok" : "unreachable";
  } catch {
    return "unreachable";
  }
}

export async function collectHealth(): Promise<HealthBody> {
  const env = checkRuntimeEnv();
  const pocketbase = await pingPocketBase(process.env.PB_URL);
  return buildHealthBody({ env, pocketbase });
}
