/**
 * Origin-Check für mutierende Auth-Routen (CSRF light).
 * Gleiche Host-Liste wie next.config serverActions.allowedOrigins.
 */

export function allowedActionHosts(): string[] {
  const base = [
    "localhost",
    "localhost:80",
    "localhost:3000",
    "127.0.0.1",
    "127.0.0.1:80",
    "127.0.0.1:3000",
  ];
  const appUrl = process.env.APP_URL?.trim();
  if (appUrl) {
    try {
      const u = new URL(appUrl);
      if (u.host) base.push(u.host);
      if (u.hostname && u.hostname !== u.host) base.push(u.hostname);
    } catch {
      /* ungültige APP_URL → nur Defaults */
    }
  }
  return [...new Set(base)];
}

/**
 * Fehlt Origin/Referer (curl, Health-Tools), bleibt die Anfrage erlaubt.
 * Ein gesetzter fremder Origin wird abgelehnt.
 */
export function originIsAllowed(
  originHeader: string | null,
  refererHeader: string | null = null,
): boolean {
  const raw = originHeader?.trim() || refererHeader?.trim() || "";
  if (!raw) return true;

  try {
    const url = new URL(raw);
    return allowedActionHosts().includes(url.host);
  } catch {
    return false;
  }
}

export const UNGUELTIGE_HERKUNFT_ERROR =
  "Ungültige Herkunft der Anfrage.";
