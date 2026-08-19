/// <reference path="../pb_data/types.d.ts" />

/**
 * Bauabschnitt 1 — Fundament
 * - Collection "firmen" dünn: Name + Anschrift (kein Steuer-Modus, SKR, Nummernkreis)
 * - Auth-Collection "users" (Rolle eigentuemer/nutzer, firma = zuletzt aktiv)
 * Client-Writes auf firmen/users sind gesperrt. Next schreibt mit Superuser.
 */
migrate(
  (app) => {
    let firmen;
    try {
      firmen = app.findCollectionByNameOrId("firmen");
    } catch {
      firmen = new Collection({
        type: "base",
        name: "firmen",
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: null,
        updateRule: null,
        deleteRule: null,
        fields: [
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
          {
            type: "text",
            name: "land",
            required: false,
            max: 2,
          },
        ],
        indexes: [
          "CREATE UNIQUE INDEX idx_firmen_name ON firmen (name)",
        ],
      });
      app.save(firmen);
    }

    let users;
    try {
      users = app.findCollectionByNameOrId("users");
    } catch {
      users = new Collection({
        type: "auth",
        name: "users",
        listRule: "id = @request.auth.id",
        viewRule: "id = @request.auth.id",
        createRule: null,
        updateRule: null,
        deleteRule: null,
        fields: [
          {
            type: "text",
            name: "name",
            required: true,
            min: 1,
            max: 200,
          },
          {
            type: "select",
            name: "role",
            required: true,
            maxSelect: 1,
            values: ["eigentuemer", "nutzer"],
          },
          {
            type: "relation",
            name: "firma",
            required: false,
            collectionId: firmen.id,
            maxSelect: 1,
            cascadeDelete: false,
          },
        ],
        passwordAuth: {
          enabled: true,
          identityFields: ["email"],
        },
        oauth2: {
          enabled: false,
        },
        otp: {
          enabled: false,
        },
        mfa: {
          enabled: false,
        },
      });
      app.save(users);
    }

    const hasField = (name) =>
      (users.fields || []).some((f) => f.name === name);
    if (!hasField("name")) {
      users.fields.push(
        new Field({
          type: "text",
          name: "name",
          required: true,
          min: 1,
          max: 200,
        }),
      );
    }
    if (!hasField("role")) {
      users.fields.push(
        new Field({
          type: "select",
          name: "role",
          required: false,
          maxSelect: 1,
          values: ["eigentuemer", "nutzer"],
        }),
      );
    } else {
      const roleField = users.fields.getByName("role");
      if (roleField) {
        const values = Array.isArray(roleField.values)
          ? [...roleField.values]
          : [];
        if (!values.includes("eigentuemer")) {
          values.unshift("eigentuemer");
        }
        if (!values.includes("nutzer")) {
          values.push("nutzer");
        }
        roleField.values = values;
      }
    }
    if (!hasField("firma")) {
      users.fields.push(
        new Field({
          type: "relation",
          name: "firma",
          required: false,
          collectionId: firmen.id,
          maxSelect: 1,
          cascadeDelete: false,
        }),
      );
    }

    users.listRule = "id = @request.auth.id";
    users.viewRule = "id = @request.auth.id";
    users.createRule = null;
    users.updateRule = null;
    users.deleteRule = null;
    app.save(users);

    firmen.listRule = "@request.auth.id != ''";
    firmen.viewRule = "@request.auth.id != ''";
    firmen.createRule = null;
    firmen.updateRule = null;
    firmen.deleteRule = null;
    app.save(firmen);
  },
  (app) => {
    try {
      const users = app.findCollectionByNameOrId("users");
      app.delete(users);
    } catch (_) {
      /* ignore */
    }
    try {
      const firmen = app.findCollectionByNameOrId("firmen");
      app.delete(firmen);
    } catch (_) {
      /* ignore */
    }
  },
);
