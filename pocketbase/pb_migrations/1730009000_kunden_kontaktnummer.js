/// <reference path="../pb_data/types.d.ts" />

/**
 * Zettelruhe-Kontaktnummer am lokalen Kund:innenstamm.
 * Datei-Join für den Kontakte-CSV-Import. Kein Live-Sync, keine Live-API.
 * zettelruhe_kontakt_id bleibt in der Collection (Altbestand), UI nutzt die Nummer.
 */
migrate(
  (app) => {
    const kunden = app.findCollectionByNameOrId("kunden");
    const has = (name) =>
      (kunden.fields || []).some((f) => f.name === name);

    if (!has("zettelruhe_kontaktnummer")) {
      kunden.fields.push(
        new Field({
          type: "text",
          name: "zettelruhe_kontaktnummer",
          required: false,
          max: 32,
        }),
      );
    }

    const idx =
      "CREATE UNIQUE INDEX idx_kunden_firma_kontaktnummer ON kunden (firma, zettelruhe_kontaktnummer) WHERE zettelruhe_kontaktnummer != ''";
    const indexes = Array.isArray(kunden.indexes) ? [...kunden.indexes] : [];
    if (!indexes.includes(idx)) {
      indexes.push(idx);
    }
    kunden.indexes = indexes;
    kunden.listRule = "@request.auth.id != ''";
    kunden.viewRule = "@request.auth.id != ''";
    kunden.createRule = null;
    kunden.updateRule = null;
    kunden.deleteRule = null;
    app.save(kunden);
  },
  (app) => {
    try {
      const kunden = app.findCollectionByNameOrId("kunden");
      const idxName =
        "CREATE UNIQUE INDEX idx_kunden_firma_kontaktnummer ON kunden (firma, zettelruhe_kontaktnummer) WHERE zettelruhe_kontaktnummer != ''";
      const indexes = Array.isArray(kunden.indexes) ? [...kunden.indexes] : [];
      const i = indexes.indexOf(idxName);
      if (i >= 0) indexes.splice(i, 1);
      kunden.indexes = indexes;
      const fi = (kunden.fields || []).findIndex(
        (f) => f.name === "zettelruhe_kontaktnummer",
      );
      if (fi >= 0) {
        kunden.fields.splice(fi, 1);
      }
      app.save(kunden);
    } catch {
      /* ignore */
    }
  },
);
