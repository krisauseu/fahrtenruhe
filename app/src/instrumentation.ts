/**
 * Next.js instrumentation — ENV-Check light.
 * Läuft im Node-Runtime des Next-Containers (Compose).
 */
export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME === "edge") return;

  const { logEnvCheckAtStartup } = await import("@/lib/env");
  logEnvCheckAtStartup();
}
