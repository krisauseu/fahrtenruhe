import { afterEach, describe, expect, it } from "vitest";
import { originIsAllowed, UNGUELTIGE_HERKUNFT_ERROR } from "./origin";

const previous = process.env.APP_URL;

afterEach(() => {
  if (previous === undefined) delete process.env.APP_URL;
  else process.env.APP_URL = previous;
});

describe("originIsAllowed", () => {
  it("erlaubt fehlenden Origin (curl, Health-Tools)", () => {
    expect(originIsAllowed(null, null)).toBe(true);
  });

  it("erlaubt localhost und 127.0.0.1", () => {
    expect(originIsAllowed("http://localhost")).toBe(true);
    expect(originIsAllowed("http://localhost:3000")).toBe(true);
    expect(originIsAllowed("http://127.0.0.1")).toBe(true);
  });

  it("lehnt fremde Origins ab", () => {
    expect(originIsAllowed("https://evil.example")).toBe(false);
    expect(UNGUELTIGE_HERKUNFT_ERROR).toMatch(/Herkunft/);
  });

  it("nimmt den Host aus APP_URL auf", () => {
    process.env.APP_URL = "https://buch.example.local";
    expect(originIsAllowed("https://buch.example.local")).toBe(true);
    expect(originIsAllowed("https://other.example.local")).toBe(false);
  });
});
