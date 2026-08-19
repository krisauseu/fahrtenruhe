# Modularer Monolith, Module nach dem Buch

Ein Next-Prozess, Domain-Ordner unter `app/src/modules/`: **platform**, **vehicles**, **places**, **contacts**, **trips**, **reporting**. PocketBase ist Beistelldienst (Daten/Auth/Dateien), nicht ein zweites Domänen-Backend. Fahrtenbuch-Writes nur über Next (analog Zettelruhe ADR-0006). Begründung: Solo+AI, eine deploybare Einheit, Modulgrenzen die CONTEXT.md spiegeln. Keine Microservices, kein Event-Sourcing-Pflicht.
