import { describe, expect, it } from "vitest";
import { SERVICE_NAME, buildHealthBody } from "./health";

describe("health", () => {
  it("nennt den Dienst fahrtenruhe", () => {
    expect(SERVICE_NAME).toBe("fahrtenruhe");
  });

  it("bleibt HTTP-liveness-tauglich wenn ENV ok und PB ok", () => {
    const body = buildHealthBody({
      env: { ok: true, errors: [], warnings: [] },
      pocketbase: "ok",
    });
    expect(body.ok).toBe(true);
    expect(body.service).toBe("fahrtenruhe");
    expect(body.env).toBe("ok");
    expect(body.pocketbase).toBe("ok");
  });

  it("markiert ok=false bei ENV-Fehler, ohne den Prozess zu crashen", () => {
    const body = buildHealthBody({
      env: {
        ok: false,
        errors: ["SESSION_SECRET fehlt oder ist kürzer als 32 Zeichen."],
        warnings: [],
      },
      pocketbase: "skipped",
    });
    expect(body.ok).toBe(false);
    expect(body.env).toBe("error");
    expect(body.env_errors?.[0]).toMatch(/SESSION_SECRET/);
  });
});
