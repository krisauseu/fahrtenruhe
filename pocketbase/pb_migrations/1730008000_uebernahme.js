/// <reference path="../pb_data/types.d.ts" />

/**
 * Bauabschnitt 8 — Übernahme-Altbestand light
 * - fahrten.uebernahme: gekennzeichnete Fahrt aus Papier/Datei
 * Client-Writes bleiben gesperrt. Kein Import-Assistent, keine Lückenfüllung.
 */
migrate(
  (app) => {
    const fahrten = app.findCollectionByNameOrId("fahrten");
    const has = (name) =>
      (fahrten.fields || []).some((f) => f.name === name);
    if (!has("uebernahme")) {
      fahrten.fields.push(
        new Field({
          type: "bool",
          name: "uebernahme",
        }),
      );
    }
    fahrten.listRule = "@request.auth.id != ''";
    fahrten.viewRule = "@request.auth.id != ''";
    fahrten.createRule = null;
    fahrten.updateRule = null;
    fahrten.deleteRule = null;
    app.save(fahrten);
  },
  (app) => {
    try {
      const fahrten = app.findCollectionByNameOrId("fahrten");
      const idx = (fahrten.fields || []).findIndex(
        (f) => f.name === "uebernahme",
      );
      if (idx >= 0) {
        fahrten.fields.splice(idx, 1);
        app.save(fahrten);
      }
    } catch {
      /* ignore */
    }
  },
);
