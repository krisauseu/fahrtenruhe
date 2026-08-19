/// <reference path="../pb_data/types.d.ts" />

/**
 * Bauabschnitt 4 — Kund:in / Projekt dünn, Abrechnungsstatus
 * - kunden: lokaler Stamm, optionale zettelruhe_kontakt_id (nur Merker)
 * - projekte: hängt an der:m Kund:in, optionale zettelruhe_projekt_id
 * - fahrten: optionale kunde/projekt, abrechnungsstatus
 * Client-Writes gesperrt. Next schreibt mit Superuser.
 * Kein Live-Sync, keine Live-API, kein gemeinsames PocketBase mit Zettelruhe.
 */
migrate(
  (app) => {
    const firmen = app.findCollectionByNameOrId("firmen");

    let kunden;
    try {
      kunden = app.findCollectionByNameOrId("kunden");
    } catch {
      kunden = new Collection({
        type: "base",
        name: "kunden",
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
            name: "name",
            required: true,
            min: 1,
            max: 200,
            presentable: true,
          },
          {
            type: "text",
            name: "zettelruhe_kontakt_id",
            required: false,
            max: 40,
          },
        ],
        indexes: ["CREATE INDEX idx_kunden_firma ON kunden (firma)"],
      });
      app.save(kunden);
    }

    const kundeHas = (name) =>
      (kunden.fields || []).some((f) => f.name === name);
    if (!kundeHas("firma")) {
      kunden.fields.push(
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
    if (!kundeHas("name")) {
      kunden.fields.push(
        new Field({
          type: "text",
          name: "name",
          required: true,
          min: 1,
          max: 200,
          presentable: true,
        }),
      );
    }
    if (!kundeHas("zettelruhe_kontakt_id")) {
      kunden.fields.push(
        new Field({
          type: "text",
          name: "zettelruhe_kontakt_id",
          required: false,
          max: 40,
        }),
      );
    }
    kunden.listRule = "@request.auth.id != ''";
    kunden.viewRule = "@request.auth.id != ''";
    kunden.createRule = null;
    kunden.updateRule = null;
    kunden.deleteRule = null;
    app.save(kunden);

    let projekte;
    try {
      projekte = app.findCollectionByNameOrId("projekte");
    } catch {
      projekte = new Collection({
        type: "base",
        name: "projekte",
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
            type: "relation",
            name: "kunde",
            required: true,
            collectionId: kunden.id,
            maxSelect: 1,
            cascadeDelete: false,
          },
          {
            type: "text",
            name: "name",
            required: true,
            min: 1,
            max: 200,
            presentable: true,
          },
          {
            type: "text",
            name: "zettelruhe_projekt_id",
            required: false,
            max: 40,
          },
        ],
        indexes: [
          "CREATE INDEX idx_projekte_firma ON projekte (firma)",
          "CREATE INDEX idx_projekte_kunde ON projekte (kunde)",
        ],
      });
      app.save(projekte);
    }

    const projektHas = (name) =>
      (projekte.fields || []).some((f) => f.name === name);
    if (!projektHas("firma")) {
      projekte.fields.push(
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
    if (!projektHas("kunde")) {
      projekte.fields.push(
        new Field({
          type: "relation",
          name: "kunde",
          required: true,
          collectionId: kunden.id,
          maxSelect: 1,
          cascadeDelete: false,
        }),
      );
    }
    if (!projektHas("name")) {
      projekte.fields.push(
        new Field({
          type: "text",
          name: "name",
          required: true,
          min: 1,
          max: 200,
          presentable: true,
        }),
      );
    }
    if (!projektHas("zettelruhe_projekt_id")) {
      projekte.fields.push(
        new Field({
          type: "text",
          name: "zettelruhe_projekt_id",
          required: false,
          max: 40,
        }),
      );
    }
    projekte.listRule = "@request.auth.id != ''";
    projekte.viewRule = "@request.auth.id != ''";
    projekte.createRule = null;
    projekte.updateRule = null;
    projekte.deleteRule = null;
    app.save(projekte);

    let fahrten;
    try {
      fahrten = app.findCollectionByNameOrId("fahrten");
    } catch {
      fahrten = null;
    }
    if (fahrten) {
      const fahrtHas = (name) =>
        (fahrten.fields || []).some((f) => f.name === name);
      if (!fahrtHas("kunde")) {
        fahrten.fields.push(
          new Field({
            type: "relation",
            name: "kunde",
            required: false,
            collectionId: kunden.id,
            maxSelect: 1,
            cascadeDelete: false,
          }),
        );
      }
      if (!fahrtHas("projekt")) {
        fahrten.fields.push(
          new Field({
            type: "relation",
            name: "projekt",
            required: false,
            collectionId: projekte.id,
            maxSelect: 1,
            cascadeDelete: false,
          }),
        );
      }
      if (!fahrtHas("abrechnungsstatus")) {
        fahrten.fields.push(
          new Field({
            type: "select",
            name: "abrechnungsstatus",
            required: false,
            maxSelect: 1,
            values: ["abrechenbar", "nicht_abrechenbar", "abgerechnet"],
          }),
        );
      }
      fahrten.createRule = null;
      fahrten.updateRule = null;
      fahrten.deleteRule = null;
      app.save(fahrten);
    }
  },
  (app) => {
    try {
      const fahrten = app.findCollectionByNameOrId("fahrten");
      fahrten.fields = (fahrten.fields || []).filter(
        (f) =>
          f.name !== "kunde" &&
          f.name !== "projekt" &&
          f.name !== "abrechnungsstatus",
      );
      app.save(fahrten);
    } catch {
      /* ignore */
    }
    try {
      const projekte = app.findCollectionByNameOrId("projekte");
      app.delete(projekte);
    } catch {
      /* ignore */
    }
    try {
      const kunden = app.findCollectionByNameOrId("kunden");
      app.delete(kunden);
    } catch {
      /* ignore */
    }
  },
);
