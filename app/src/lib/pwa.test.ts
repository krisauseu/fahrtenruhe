import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  PWA_DESCRIPTION,
  PWA_DISPLAY,
  PWA_ICON_192,
  PWA_ICON_512,
  PWA_LANG,
  PWA_MANIFEST,
  PWA_NAME,
  PWA_SCOPE,
  PWA_START_URL,
  PWA_THEME_COLOR,
} from "./pwa";

const PNG_SIG = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

describe("PWA-light", () => {
  it("heißt Fahrtenruhe, startet auf der Erfassung, standalone, de", () => {
    expect(PWA_NAME).toBe("Fahrtenruhe");
    expect(PWA_START_URL).toBe("/app");
    expect(PWA_SCOPE).toBe("/");
    expect(PWA_DISPLAY).toBe("standalone");
    expect(PWA_LANG).toBe("de");
    expect(PWA_DESCRIPTION).toMatch(/Fahrtenbuch/);
    expect(PWA_DESCRIPTION).not.toMatch(/Buchhaltung/);
    expect(PWA_MANIFEST.prefer_related_applications).toBe(false);
    expect(PWA_THEME_COLOR).toBe("#f4fbfc");
    expect(PWA_MANIFEST.theme_color).toBe(PWA_THEME_COLOR);
    expect(PWA_MANIFEST.start_url).toBe("/app");
    expect(PWA_MANIFEST.display).toBe("standalone");
  });

  it("liefert PNG-Icons 192 und 512, maskable ohne App-Store-Client", () => {
    expect(PWA_ICON_192).toBe("/icon-192.png");
    expect(PWA_ICON_512).toBe("/icon-512.png");
    const sizes = PWA_MANIFEST.icons.map((i) => i.sizes);
    expect(sizes).toContain("192x192");
    expect(sizes).toContain("512x512");
    expect(PWA_MANIFEST.icons.every((i) => i.type === "image/png")).toBe(true);
    expect(PWA_MANIFEST.icons.some((i) => i.purpose === "maskable")).toBe(
      true,
    );
    expect(
      Object.prototype.hasOwnProperty.call(
        PWA_MANIFEST,
        "related_applications",
      ),
    ).toBe(false);

    const icon192 = readFileSync(path.join(process.cwd(), "public/icon-192.png"));
    const icon512 = readFileSync(path.join(process.cwd(), "public/icon-512.png"));
    const apple = readFileSync(
      path.join(process.cwd(), "src/app/apple-icon.png"),
    );
    const mark = readFileSync(
      path.join(process.cwd(), "public/brand/fahrtenruhe-mark.png"),
    );
    const favicon = readFileSync(path.join(process.cwd(), "src/app/icon.png"));
    expect(icon192.subarray(0, 8)).toEqual(PNG_SIG);
    expect(icon512.subarray(0, 8)).toEqual(PNG_SIG);
    expect(apple.subarray(0, 8)).toEqual(PNG_SIG);
    expect(mark.subarray(0, 8)).toEqual(PNG_SIG);
    expect(favicon.subarray(0, 8)).toEqual(PNG_SIG);
    expect(existsSync(path.join(process.cwd(), "src/app/manifest.ts"))).toBe(
      true,
    );
    expect(existsSync(path.join(process.cwd(), "src/app/icon.tsx"))).toBe(
      false,
    );
  });
});
