/// <reference path="../pb_data/types.d.ts" />

/**
 * Bauabschnitt 2 — Fahrzeug und Stammorte
 * - fahrzeuge: stabile id, kennzeichen presentable, eroeffnungs_kilometerstand int,
 *   ausser_betrieb (kein Löschen), optionales inbetriebnahme_am
 * - stammorte: je Firma höchstens eine Wohnung und eine erste Tätigkeitsstätte
 * Client-Writes gesperrt. Next schreibt mit Superuser.
 * Keine Collection fahrten (BA3).
 */
migrate(
  (app) => {
    const firmen = app.findCollectionByNameOrId("firmen");

    let fahrzeuge;
    try {
      fahrzeuge = app.findCollectionByNameOrId("fahrzeuge");
    } catch {
      fahrzeuge = new Collection({
        type: "base",
        name: "fahrzeuge",
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: null,
        updateRule: null,
        deleteRule: null,
        fields: [
          {
            type: "relation",
            name: "firma",
            required: true,
            collectionId: firmen.id,
            maxSelect: 1,
            cascadeDelete: false,
          },
          {
            type: "text",
            name: "kennzeichen",
            required: true,
            min: 1,
            max: 20,
            presentable: true,
          },
          {
            type: "number",
            name: "eroeffnungs_kilometerstand",
            required: true,
            min: 0,
            onlyInt: true,
          },
          {
            type: "bool",
            name: "ausser_betrieb",
          },
          {
            type: "text",
            name: "inbetriebnahme_am",
            required: false,
            max: 10,
          },
        ],
        indexes: [
          "CREATE INDEX idx_fahrzeuge_firma ON fahrzeuge (firma)",
        ],
      });
      app.save(fahrzeuge);
    }

    const fahrzeugHas = (name) =>
      (fahrzeuge.fields || []).some((f) => f.name === name);
    if (!fahrzeugHas("firma")) {
      fahrzeuge.fields.push(
        new Field({
          type: "relation",
          name: "firma",
          required: true,
          collectionId: firmen.id,
          maxSelect: 1,
          cascadeDelete: false,
        }),
      );
    }
    if (!fahrzeugHas("kennzeichen")) {
      fahrzeuge.fields.push(
        new Field({
          type: "text",
          name: "kennzeichen",
          required: true,
          min: 1,
          max: 20,
          presentable: true,
        }),
      );
    }
    if (!fahrzeugHas("eroeffnungs_kilometerstand")) {
      fahrzeuge.fields.push(
        new Field({
          type: "number",
          name: "eroeffnungs_kilometerstand",
          required: true,
          min: 0,
          onlyInt: true,
        }),
      );
    }
    if (!fahrzeugHas("ausser_betrieb")) {
      fahrzeuge.fields.push(
        new Field({
          type: "bool",
          name: "ausser_betrieb",
        }),
      );
    }
    if (!fahrzeugHas("inbetriebnahme_am")) {
      fahrzeuge.fields.push(
        new Field({
          type: "text",
          name: "inbetriebnahme_am",
          required: false,
          max: 10,
        }),
      );
    }
    fahrzeuge.listRule = "@request.auth.id != ''";
    fahrzeuge.viewRule = "@request.auth.id != ''";
    fahrzeuge.createRule = null;
    fahrzeuge.updateRule = null;
    fahrzeuge.deleteRule = null;
    app.save(fahrzeuge);

    let stammorte;
    try {
      stammorte = app.findCollectionByNameOrId("stammorte");
    } catch {
      stammorte = new Collection({
        type: "base",
        name: "stammorte",
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: null,
        updateRule: null,
        deleteRule: null,
        fields: [
          {
            type: "relation",
            name: "firma",
            required: true,
            collectionId: firmen.id,
            maxSelect: 1,
            cascadeDelete: true,
          },
          {
            type: "select",
            name: "art",
            required: true,
            maxSelect: 1,
            values: ["wohnung", "erste_taetigkeitsstaette"],
          },
          {
            type: "text",
            name: "bezeichnung",
            required: true,
            min: 1,
            max: 120,
          },
          {
            type: "text",
            name: "strasse",
            required: false,
            max: 200,
          },
          {
            type: "text",
            name: "plz",
            required: false,
            max: 20,
          },
          {
            type: "text",
            name: "ort",
            required: false,
            max: 120,
          },
        ],
        indexes: [
          "CREATE INDEX idx_stammorte_firma ON stammorte (firma)",
          "CREATE UNIQUE INDEX idx_stammorte_firma_art ON stammorte (firma, art)",
        ],
      });
      app.save(stammorte);
    }

    const stammortHas = (name) =>
      (stammorte.fields || []).some((f) => f.name === name);
    if (!stammortHas("firma")) {
      stammorte.fields.push(
        new Field({
          type: "relation",
          name: "firma",
          required: true,
          collectionId: firmen.id,
          maxSelect: 1,
          cascadeDelete: true,
        }),
      );
    }
    if (!stammortHas("art")) {
      stammorte.fields.push(
        new Field({
          type: "select",
          name: "art",
          required: true,
          maxSelect: 1,
          values: ["wohnung", "erste_taetigkeitsstaette"],
        }),
      );
    }
    if (!stammortHas("bezeichnung")) {
      stammorte.fields.push(
        new Field({
          type: "text",
          name: "bezeichnung",
          required: true,
          min: 1,
          max: 120,
        }),
      );
    }
    if (!stammortHas("strasse")) {
      stammorte.fields.push(
        new Field({
          type: "text",
          name: "strasse",
          required: false,
          max: 200,
        }),
      );
    }
    if (!stammortHas("plz")) {
      stammorte.fields.push(
        new Field({
          type: "text",
          name: "plz",
          required: false,
          max: 20,
        }),
      );
    }
    if (!stammortHas("ort")) {
      stammorte.fields.push(
        new Field({
          type: "text",
          name: "ort",
          required: false,
          max: 120,
        }),
      );
    }
    stammorte.listRule = "@request.auth.id != ''";
    stammorte.viewRule = "@request.auth.id != ''";
    stammorte.createRule = null;
    stammorte.updateRule = null;
    stammorte.deleteRule = null;
    app.save(stammorte);
  },
  (app) => {
    try {
      const stammorte = app.findCollectionByNameOrId("stammorte");
      app.delete(stammorte);
    } catch {
      /* ignore */
    }
    try {
      const fahrzeuge = app.findCollectionByNameOrId("fahrzeuge");
      app.delete(fahrzeuge);
    } catch {
      /* ignore */
    }
  },
);
