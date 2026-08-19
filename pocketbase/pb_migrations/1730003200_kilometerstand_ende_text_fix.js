/// <reference path="../pb_data/types.d.ts" />

/**
 * 1730003100 hat field.type statt field.type() geprüft — Number blieb Number.
 * Hier wirklich auf Text umstellen (leer = offene Fahrt).
 */
migrate(
  (app) => {
    const fahrten = app.findCollectionByNameOrId("fahrten");
    const field = fahrten.fields.getByName("kilometerstand_ende");
    if (field && field.type() === "number") {
      fahrten.fields.removeById(field.getId());
      fahrten.fields.push(
        new Field({
          type: "text",
          name: "kilometerstand_ende",
          required: false,
          max: 12,
          pattern: "^\\d*$",
        }),
      );
      app.save(fahrten);
    }

    const alle = app.findAllRecords("fahrten");
    for (const rec of alle) {
      const start = Number(rec.get("kilometerstand_start"));
      const ende = rec.get("kilometerstand_ende");
      const alsOffen =
        ende === 0 ||
        ende === "0" ||
        ende === null ||
        ende === undefined ||
        ende === "";
      if (alsOffen && start > 0) {
        rec.set("kilometerstand_ende", "");
        app.save(rec);
      } else if (ende !== null && ende !== undefined && ende !== "") {
        rec.set("kilometerstand_ende", String(ende));
        app.save(rec);
      }
    }
  },
  () => {
    /* nicht zurück auf Number */
  },
);
