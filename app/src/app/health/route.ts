import { collectHealth } from "@/lib/health";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Liveness/Readiness light — öffentlich, ohne Session.
 * HTTP 200 bleibt für Liveness, auch wenn PocketBase degraded ist.
 */
export async function GET(): Promise<Response> {
  const body = await collectHealth();
  return Response.json(body, {
    status: 200,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
