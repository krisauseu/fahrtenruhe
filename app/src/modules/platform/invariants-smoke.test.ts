import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  BA1_FACHCOLLECTIONS,
  BA2_FACHCOLLECTIONS,
  BA3_FACHCOLLECTIONS,
  BA4_FACHCOLLECTIONS,
  CLIENT_WRITE_LOCKED,
  FACHCOLLECTIONS,
} from "./write-rules";
import { ABRECHNUNGSSTATI, NUTZUNGSTYPEN } from "@/modules/trips";
import { STAMMORT_ARTEN } from "@/modules/places";

const migrationsDir = path.resolve(
  process.cwd(),
  "../pocketbase/pb_migrations",
);

function allMigrations(): string {
  return readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".js"))
    .map((f) => readFileSync(path.join(migrationsDir, f), "utf8"))
    .join("\n");
}

describe("Fundament-Invarianten", () => {
  it("sperrt Client-Writes auf allen Fachcollections", () => {
    expect(CLIENT_WRITE_LOCKED.createRule).toBeNull();
    expect(CLIENT_WRITE_LOCKED.updateRule).toBeNull();
    expect(CLIENT_WRITE_LOCKED.deleteRule).toBeNull();
    expect([...BA1_FACHCOLLECTIONS]).toEqual([
      "firmen",
      "users",
      "mitgliedschaften",
    ]);
    expect([...BA2_FACHCOLLECTIONS]).toEqual(["fahrzeuge", "stammorte"]);
    expect([...BA3_FACHCOLLECTIONS]).toEqual(["fahrten", "korrekturspuren"]);
    expect([...BA4_FACHCOLLECTIONS]).toEqual(["kunden", "projekte"]);
    expect([...FACHCOLLECTIONS]).toEqual([
      "firmen",
      "users",
      "mitgliedschaften",
      "fahrzeuge",
      "stammorte",
      "fahrten",
      "korrekturspuren",
      "kunden",
      "projekte",
    ]);
  });

  it("kennt genau die drei Nutzungstypen aus CONTEXT.md", () => {
    expect([...NUTZUNGSTYPEN]).toEqual([
      "betrieblich",
      "privat",
      "wohnung_taetigkeitsstaette",
    ]);
  });

  it("kennt Wohnung und erste Tätigkeitsstätte als Stammorte", () => {
    expect([...STAMMORT_ARTEN]).toEqual([
      "wohnung",
      "erste_taetigkeitsstaette",
    ]);
  });
});

describe("PocketBase-Migration BA2", () => {
  it("legt fahrzeuge und stammorte an und sperrt Client-Writes", () => {
    const src = readFileSync(
      path.join(migrationsDir, "1730002000_fahrzeuge_stammorte.js"),
      "utf8",
    );
    expect(src).toMatch(/name:\s*"fahrzeuge"/);
    expect(src).toMatch(/name:\s*"stammorte"/);
    expect(src).toMatch(/name:\s*"kennzeichen"/);
    expect(src).toMatch(/presentable:\s*true/);
    expect(src).toMatch(/name:\s*"eroeffnungs_kilometerstand"/);
    expect(src).toMatch(/onlyInt:\s*true/);
    expect(src).toMatch(/name:\s*"ausser_betrieb"/);
    expect(src).toMatch(/wohnung/);
    expect(src).toMatch(/erste_taetigkeitsstaette/);
    expect(src).toMatch(/createRule:\s*null/);
    expect(src).toMatch(/updateRule:\s*null/);
    expect(src).toMatch(/deleteRule:\s*null/);
    expect(src).not.toMatch(/listenpreis|hubraum|ein_prozent|1_prozent/);
  });
});

describe("PocketBase-Migration BA3", () => {
  it("legt fahrten und korrekturspuren an und sperrt Client-Writes", () => {
    const src = readFileSync(
      path.join(migrationsDir, "1730003000_fahrten_korrekturspuren.js"),
      "utf8",
    );
    expect(src).toMatch(/name:\s*"fahrten"/);
    expect(src).toMatch(/name:\s*"korrekturspuren"/);
    expect(src).toMatch(/name:\s*"kilometerstand_start"/);
    expect(src).toMatch(/name:\s*"kilometerstand_ende"/);
    expect(src).toMatch(/onlyInt:\s*true/);
    expect(src).toMatch(/Leer = offene Fahrt/);
    expect(src).toMatch(/betrieblich/);
    expect(src).toMatch(/wohnung_taetigkeitsstaette/);
    expect(src).toMatch(/name:\s*"ziel"/);
    expect(src).toMatch(/name:\s*"zweck"/);
    expect(src).toMatch(/name:\s*"wer"/);
    expect(src).toMatch(/name:\s*"wann"/);
    expect(src).toMatch(/name:\s*"vorher"/);
    expect(src).toMatch(/name:\s*"nachher"/);
    expect(src).toMatch(/createRule:\s*null/);
    expect(src).toMatch(/updateRule:\s*null/);
    expect(src).toMatch(/deleteRule:\s*null/);
    expect(src).not.toMatch(/abrechnungsstatus|zettelruhe|listenpreis|ein_prozent/);
    expect(src).not.toMatch(/name:\s*"kunde"/);
    expect(src).not.toMatch(/name:\s*"projekt"/);
  });

  it("enthält die Collections in den Migrationen", () => {
    expect(allMigrations()).toMatch(/name:\s*"fahrten"/);
    expect(allMigrations()).toMatch(/name:\s*"korrekturspuren"/);
  });
});

describe("Erfassung BA3", () => {
  it("hat /app/fahrten, aber nicht Zettelruhes /fahrten/neu", () => {
    const appDir = path.resolve(process.cwd(), "src/app");
    const paths = walkFiles(appDir).join("\n");
    expect(paths).toMatch(/app\/fahrten/);
    expect(paths).not.toMatch(/src\/app\/fahrten\/neu/);
  });
});

describe("PocketBase-Migration BA4", () => {
  it("legt kunden und projekte an und sperrt Client-Writes", () => {
    const src = readFileSync(
      path.join(migrationsDir, "1730004000_kunden_projekte.js"),
      "utf8",
    );
    expect(src).toMatch(/name:\s*"kunden"/);
    expect(src).toMatch(/name:\s*"projekte"/);
    expect(src).toMatch(/name:\s*"zettelruhe_kontakt_id"/);
    expect(src).toMatch(/name:\s*"zettelruhe_projekt_id"/);
    expect(src).toMatch(/name:\s*"kunde"/);
    expect(src).toMatch(/name:\s*"projekt"/);
    expect(src).toMatch(/abrechenbar/);
    expect(src).toMatch(/nicht_abrechenbar/);
    expect(src).toMatch(/abgerechnet/);
    expect(src).toMatch(/createRule:\s*null/);
    expect(src).toMatch(/updateRule:\s*null/);
    expect(src).toMatch(/deleteRule:\s*null/);
    expect(src).toMatch(/Kein Live-Sync/);
    expect(src).toMatch(/keine Live-API/);
    expect(src).toMatch(/kein gemeinsames PocketBase/);
    expect(src).not.toMatch(/listenpreis|hubraum|ein_prozent|1_prozent/);
    expect(src).not.toMatch(/ZETTELRUHE_URL/);
  });

  it("kennt die drei Abrechnungsstatus aus CONTEXT.md", () => {
    expect([...ABRECHNUNGSSTATI]).toEqual([
      "abrechenbar",
      "nicht_abrechenbar",
      "abgerechnet",
    ]);
  });
});

describe("Erfassung BA4", () => {
  it("hat /app/kunden und keine Zettelruhe-Live-Suche", () => {
    const appDir = path.resolve(process.cwd(), "src/app");
    const paths = walkFiles(appDir).join("\n");
    expect(paths).toMatch(/app\/kunden/);
    const contacts = readFileSync(
      path.resolve(process.cwd(), "src/modules/contacts/repository.ts"),
      "utf8",
    );
    expect(contacts).not.toMatch(/ZETTELRUHE_URL/);
    expect(contacts).not.toMatch(/zettelruhe\/api/i);
    expect(contacts).toMatch(/Kein Live-Sync/);
  });
});

describe("Kund:innen-CSV aus Zettelruhe", () => {
  it("legt zettelruhe_kontaktnummer an und sperrt Client-Writes", () => {
    const src = readFileSync(
      path.join(migrationsDir, "1730009000_kunden_kontaktnummer.js"),
      "utf8",
    );
    expect(src).toMatch(/name:\s*"zettelruhe_kontaktnummer"/);
    expect(src).toMatch(/idx_kunden_firma_kontaktnummer/);
    expect(src).toMatch(/createRule\s*=\s*null/);
    expect(src).toMatch(/Kein Live-Sync/);
    expect(src).not.toMatch(/ZETTELRUHE_URL/);
  });

  it("hat /app/kunden/import ohne Live-API", () => {
    const appDir = path.resolve(process.cwd(), "src/app");
    const paths = walkFiles(appDir).join("\n");
    expect(paths).toMatch(/app\/kunden\/import/);
    const csv = readFileSync(
      path.resolve(process.cwd(), "src/modules/contacts/csv.ts"),
      "utf8",
    );
    expect(csv).toMatch(/Kein Live-Abgleich/);
    expect(csv).not.toMatch(/ZETTELRUHE_URL/);
  });
});

describe("Erfassung BA5", () => {
  it("hat /app/iststand ohne eigenen PDF/CSV-Download", () => {
    const appDir = path.resolve(process.cwd(), "src/app");
    const paths = walkFiles(appDir).join("\n");
    expect(paths).toMatch(/app\/iststand/);
    const page = readFileSync(
      path.resolve(process.cwd(), "src/app/app/iststand/page.tsx"),
      "utf8",
    );
    expect(page).toMatch(/Iststand/);
    expect(page).not.toMatch(/application\/pdf|text\/csv/);
    const addition = readFileSync(
      path.resolve(process.cwd(), "src/modules/reporting/iststand.ts"),
      "utf8",
    );
    expect(addition).toMatch(/Kilometerpauschale/);
    expect(addition).not.toMatch(/ein_prozent|1_prozent|Entfernungspauschale/);
    expect(addition).not.toMatch(/ZETTELRUHE_URL/);
  });
});

describe("Erfassung BA7", () => {
  it("ist PWA-light ohne Service Worker, GPS und App-Store-Client", () => {
    const srcDir = path.resolve(process.cwd(), "src");
    const files = walkFiles(srcDir).filter(
      (f) => f.endsWith(".ts") || f.endsWith(".tsx"),
    );
    const src = files
      .filter((f) => !f.endsWith(".test.ts"))
      .map((f) =>
        readFileSync(path.join(process.cwd(), f.replace(/^\//, "")), "utf8"),
      )
      .join("\n");
    expect(files.join("\n")).toMatch(/app\/manifest\.ts/);
    expect(src).toMatch(/display:\s*PWA_DISPLAY|display:\s*"standalone"/);
    expect(src).toMatch(/start_url:\s*PWA_START_URL|start_url:\s*"\/app"/);
    expect(src).not.toMatch(/navigator\.serviceWorker/);
    expect(src).not.toMatch(/navigator\.geolocation/);
    expect(src).not.toMatch(/getCurrentPosition|watchPosition/);
    expect(src).not.toMatch(/[^_]related_applications/);
  });

  it("lässt Start und Ende der Fahrt auf /app mit ganzen km und ohne GPS", () => {
    const start = readFileSync(
      path.resolve(process.cwd(), "src/modules/trips/fahrt-start-form.tsx"),
      "utf8",
    );
    const ende = readFileSync(
      path.resolve(process.cwd(), "src/modules/trips/fahrt-ende-form.tsx"),
      "utf8",
    );
    const home = readFileSync(
      path.resolve(process.cwd(), "src/app/app/page.tsx"),
      "utf8",
    );
    expect(home).toMatch(/FahrtStartForm/);
    expect(home).toMatch(/FahrtEndeForm/);
    expect(home).toMatch(/zurueck="\/app"/);
    expect(start).toMatch(/Fahrt starten/);
    expect(start).toMatch(/inputMode="numeric"/);
    expect(start).toMatch(/pattern="\[0-9\]\+"/);
    expect(start).toMatch(/Kilometerstand/);
    expect(start).toMatch(/Nutzungstyp/);
    expect(start).not.toMatch(/geolocation|getCurrentPosition/i);
    expect(ende).toMatch(/Fahrt schließen/);
    expect(ende).toMatch(/Mit Korrekturspur schließen/);
    expect(ende).toMatch(/inputMode="numeric"/);
    expect(ende).toMatch(/pattern="\[0-9\]\+"/);
    expect(ende).not.toMatch(/geolocation|getCurrentPosition/i);
  });
});

describe("Erfassung BA8", () => {
  it("hat Verfahrensdoku-Vorlage und gekennzeichnete Übernahme ohne Import-Assistenten", () => {
    const appDir = path.resolve(process.cwd(), "src/app");
    const paths = walkFiles(appDir).join("\n");
    expect(paths).toMatch(/fahrten\/uebernahme/);
    expect(paths).toMatch(/app\/verfahren/);
    expect(paths).not.toMatch(/xlsx|sheetjs/i);

    const vorlage = readFileSync(
      path.resolve(process.cwd(), "../docs/verfahrensdokumentation.md"),
      "utf8",
    );
    expect(vorlage).toMatch(/kein Zertifikat/i);
    expect(vorlage).toMatch(/Korrekturspur/);

    const migration = readFileSync(
      path.join(migrationsDir, "1730008000_uebernahme.js"),
      "utf8",
    );
    expect(migration).toMatch(/name:\s*"uebernahme"/);
    expect(migration).toMatch(/createRule\s*=\s*null/);
    expect(migration).toMatch(/Kein Import-Assistent/);

    const trips = readFileSync(
      path.resolve(process.cwd(), "src/modules/trips/repository.ts"),
      "utf8",
    );
    expect(trips).toMatch(/uebernehmenFahrt/);
    expect(trips).toMatch(/uebernahme: true/);
    expect(trips).toMatch(/serializeUebernahmeVorher/);
    expect(trips).not.toMatch(/xlsx|excel|sheetjs/i);
    expect(trips).not.toMatch(/privat.*füll|Lücke.*privat/i);
  });
});

describe("Erfassung BA6", () => {
  it("hat /app/jahresnachweis als Datei-Export ohne Live-API", () => {
    const appDir = path.resolve(process.cwd(), "src/app");
    const paths = walkFiles(appDir).join("\n");
    expect(paths).toMatch(/app\/jahresnachweis/);
    expect(paths).toMatch(/jahresnachweis\/pdf/);
    expect(paths).toMatch(/jahresnachweis\/csv/);
    expect(paths).toMatch(/jahresnachweis\/json/);
    const reportingDir = path.resolve(
      process.cwd(),
      "src/modules/reporting",
    );
    const reporting = walkFiles(reportingDir)
      .filter((f) => !f.endsWith(".test.ts"))
      .map((f) =>
        readFileSync(path.join(process.cwd(), f.replace(/^\//, "")), "utf8"),
      )
      .join("\n");
    expect(reporting).toMatch(/Korrekturspur/);
    expect(reporting).toMatch(/abrechenbar/);
    expect(reporting).toMatch(/addiereIststand/);
    expect(reporting).not.toMatch(/ZETTELRUHE_URL/);
    expect(reporting).not.toMatch(/ein_prozent|1_prozent/);
    expect(reporting).not.toMatch(/Entfernungspauschale/);
  });
});

function walkFiles(dir: string): string[] {
  const out: string[] = [];
  for (const ent of readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...walkFiles(p));
    else out.push(p.replace(process.cwd(), ""));
  }
  return out;
}
