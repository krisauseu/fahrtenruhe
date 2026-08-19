/// <reference path="../pb_data/types.d.ts" />

/**
 * Bauabschnitt 3 — Fahrt und Korrekturspur
 * - fahrten: Atombewegung je Fahrzeug (nicht Zettelruhes Abrechnungszeile)
 * - korrekturspuren: sichtbare spätere Änderung (wer, wann, vorher, nachher)
 * Client-Writes gesperrt. Next schreibt mit Superuser.
 * Keine Kund:in, kein Abrechnungsstatus, keine 1-%-Felder.
 */
migrate(
  (app) => {
    const firmen = app.findCollectionByNameOrId("firmen");
    const fahrzeuge = app.findCollectionByNameOrId("fahrzeuge");

    let fahrten;
    try {
      fahrten = app.findCollectionByNameOrId("fahrten");
    } catch {
      fahrten = new Collection({
        type: "base",
        name: "fahrten",
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
            name: "fahrzeug",
            required: true,
            collectionId: fahrzeuge.id,
            maxSelect: 1,
            cascadeDelete: false,
          },
          {
            type: "text",
            name: "datum",
            required: true,
            min: 10,
            max: 10,
            pattern: "^\\d{4}-\\d{2}-\\d{2}$",
          },
          {
            type: "number",
            name: "kilometerstand_start",
            required: true,
            min: 0,
            onlyInt: true,
          },
          {
            // Text, nicht Number: PocketBase speichert leere Number als 0.
            // Leer = offene Fahrt (ADR-0015).
            type: "text",
            name: "kilometerstand_ende",
            required: false,
            max: 12,
            pattern: "^\\d*$",
          },
          {
            type: "select",
            name: "nutzungstyp",
            required: true,
            maxSelect: 1,
            values: ["betrieblich", "privat", "wohnung_taetigkeitsstaette"],
          },
          {
            type: "text",
            name: "ziel",
            required: false,
            max: 200,
          },
          {
            type: "text",
            name: "zweck",
            required: false,
            max: 500,
          },
          {
            type: "text",
            name: "angelegt_am",
            required: true,
            max: 40,
          },
          {
            type: "text",
            name: "vervollstaendigt_am",
            required: false,
            max: 40,
          },
        ],
        indexes: [
          "CREATE INDEX idx_fahrten_firma ON fahrten (firma)",
          "CREATE INDEX idx_fahrten_fahrzeug ON fahrten (fahrzeug)",
          "CREATE INDEX idx_fahrten_fahrzeug_start ON fahrten (fahrzeug, kilometerstand_start)",
        ],
      });
      app.save(fahrten);
    }

    const fahrtHas = (name) =>
      (fahrten.fields || []).some((f) => f.name === name);
    if (!fahrtHas("firma")) {
      fahrten.fields.push(
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
    if (!fahrtHas("fahrzeug")) {
      fahrten.fields.push(
        new Field({
          type: "relation",
          name: "fahrzeug",
          required: true,
          collectionId: fahrzeuge.id,
          maxSelect: 1,
          cascadeDelete: false,
        }),
      );
    }
    if (!fahrtHas("datum")) {
      fahrten.fields.push(
        new Field({
          type: "text",
          name: "datum",
          required: true,
          min: 10,
          max: 10,
          pattern: "^\\d{4}-\\d{2}-\\d{2}$",
        }),
      );
    }
    if (!fahrtHas("kilometerstand_start")) {
      fahrten.fields.push(
        new Field({
          type: "number",
          name: "kilometerstand_start",
          required: true,
          min: 0,
          onlyInt: true,
        }),
      );
    }
    if (!fahrtHas("kilometerstand_ende")) {
      fahrten.fields.push(
        new Field({
          type: "text",
          name: "kilometerstand_ende",
          required: false,
          max: 12,
          pattern: "^\\d*$",
        }),
      );
    }
    if (!fahrtHas("nutzungstyp")) {
      fahrten.fields.push(
        new Field({
          type: "select",
          name: "nutzungstyp",
          required: true,
          maxSelect: 1,
          values: ["betrieblich", "privat", "wohnung_taetigkeitsstaette"],
        }),
      );
    }
    if (!fahrtHas("ziel")) {
      fahrten.fields.push(
        new Field({
          type: "text",
          name: "ziel",
          required: false,
          max: 200,
        }),
      );
    }
    if (!fahrtHas("zweck")) {
      fahrten.fields.push(
        new Field({
          type: "text",
          name: "zweck",
          required: false,
          max: 500,
        }),
      );
    }
    if (!fahrtHas("angelegt_am")) {
      fahrten.fields.push(
        new Field({
          type: "text",
          name: "angelegt_am",
          required: true,
          max: 40,
        }),
      );
    }
    if (!fahrtHas("vervollstaendigt_am")) {
      fahrten.fields.push(
        new Field({
          type: "text",
          name: "vervollstaendigt_am",
          required: false,
          max: 40,
        }),
      );
    }
    fahrten.listRule = "@request.auth.id != ''";
    fahrten.viewRule = "@request.auth.id != ''";
    fahrten.createRule = null;
    fahrten.updateRule = null;
    fahrten.deleteRule = null;
    app.save(fahrten);

    let korrekturspuren;
    try {
      korrekturspuren = app.findCollectionByNameOrId("korrekturspuren");
    } catch {
      korrekturspuren = new Collection({
        type: "base",
        name: "korrekturspuren",
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: null,
        updateRule: null,
        deleteRule: null,
        fields: [
          {
            type: "relation",
            name: "fahrt",
            required: true,
            collectionId: fahrten.id,
            maxSelect: 1,
            cascadeDelete: false,
          },
          {
            type: "text",
            name: "wer",
            required: true,
            min: 1,
            max: 200,
          },
          {
            type: "text",
            name: "wann",
            required: true,
            max: 40,
          },
          {
            type: "text",
            name: "vorher",
            required: true,
            max: 8000,
          },
          {
            type: "text",
            name: "nachher",
            required: true,
            max: 8000,
          },
        ],
        indexes: [
          "CREATE INDEX idx_korrekturspuren_fahrt ON korrekturspuren (fahrt)",
        ],
      });
      app.save(korrekturspuren);
    }

    const spurHas = (name) =>
      (korrekturspuren.fields || []).some((f) => f.name === name);
    if (!spurHas("fahrt")) {
      korrekturspuren.fields.push(
        new Field({
          type: "relation",
          name: "fahrt",
          required: true,
          collectionId: fahrten.id,
          maxSelect: 1,
          cascadeDelete: false,
        }),
      );
    }
    if (!spurHas("wer")) {
      korrekturspuren.fields.push(
        new Field({
          type: "text",
          name: "wer",
          required: true,
          min: 1,
          max: 200,
        }),
      );
    }
    if (!spurHas("wann")) {
      korrekturspuren.fields.push(
        new Field({
          type: "text",
          name: "wann",
          required: true,
          max: 40,
        }),
      );
    }
    if (!spurHas("vorher")) {
      korrekturspuren.fields.push(
        new Field({
          type: "text",
          name: "vorher",
          required: true,
          max: 8000,
        }),
      );
    }
    if (!spurHas("nachher")) {
      korrekturspuren.fields.push(
        new Field({
          type: "text",
          name: "nachher",
          required: true,
          max: 8000,
        }),
      );
    }
    korrekturspuren.listRule = "@request.auth.id != ''";
    korrekturspuren.viewRule = "@request.auth.id != ''";
    korrekturspuren.createRule = null;
    korrekturspuren.updateRule = null;
    korrekturspuren.deleteRule = null;
    app.save(korrekturspuren);
  },
  (app) => {
    try {
      const korrekturspuren = app.findCollectionByNameOrId("korrekturspuren");
      app.delete(korrekturspuren);
    } catch {
      /* ignore */
    }
    try {
      const fahrten = app.findCollectionByNameOrId("fahrten");
      app.delete(fahrten);
    } catch {
      /* ignore */
    }
  },
);
