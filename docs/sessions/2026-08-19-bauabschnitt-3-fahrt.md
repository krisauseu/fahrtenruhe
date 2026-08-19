# Session 2026-08-19 — bauabschnitt-3-fahrt

## Done

- PocketBase-Migration `fahrten` (firma, fahrzeug, datum, `kilometerstand_start` onlyInt, `kilometerstand_ende` Text leer=offen, Nutzungstyp, Ziel, Zweck, Zeitstempel) und `korrekturspuren` (fahrt, wer, wann, vorher, nachher). Client create/update/delete = null. Keine Kund:in, kein Abrechnungsstatus.
- `kilometerstand_ende` bewusst Text: PocketBase-Number ist nie leer, sondern 0 — das würde die offene Fahrt zerstören.
- Modul `trips`: eine offene Fahrt je Fahrzeug, Lücken-Block, ganze km, Wohnung–Tätigkeitsstätte nur bei `!getStammorteStand().gleich` und beiden Stammorten, betrieblich → Zweck Pflicht, gleicher Kalendertag Europe/Berlin ohne Spur, danach sichtbare Korrekturspur. Kein Soft-Delete, kein Storno.
- App-Shell: Start/Ende auf `/app`, Buch `/app/fahrten` und `/app/fahrten/[id]`. Keine Route `/fahrten/neu`. Ohne Fahrzeug weiterhin kein Tachofeld. Buchjahr-Hinweis bleibt nicht nachweistauglich ohne Kette ab Pflichtstart.
- Tests: 85, `cd app && npm test` grün. Form-POST/curl E2E (Start, zweite offene Fahrt blockt, Lücke, Nachkommastellen, Wohnung–Tätigkeitsstätte bei gleicher Anschrift fehlt/blockt, Schließen selben Tags ohne Spur, Vervollständigung, Schließen nach Mitternacht mit sichtbarer Korrekturspur, Client-Writes 403, `/fahrten/neu` 404).

## Open / Blocked

- Workspace-Ordner heißt weiter `reiseruhe`
- Kein Browser-MCP gegen localhost; UI per Form-POST/curl verifiziert
- Für das E2E wurde das App-Passwort von `alex@example.de` lokal auf das Fixture `sicheres-passwort` gesetzt (Original unbekannt). Superuser unverändert.

## Next step

Bauabschnitt 4: Kund:in/Projekt dünn, Abrechnungsstatus, optionale Zettelruhe-Ids.

## Context snapshot

- Writes aufs Buch nur Next/Superuser. App-Login `alex@example.de` (Eigentümer:in), nicht der PB-Superuser.
- Form-Submits: `/app/fahrten/start`, `/app/fahrten/[id]/ende`, `/app/fahrten/[id]/vervollstaendigen`, `/app/fahrten/[id]/korrigieren`.
- Volume `fahrtenruhe_pb_data`: Firma **Beispiel UG**, Fahrzeug `B-CD 5678` (Eröffnung 42100, Inbetriebnahme 2026-03-15), Stammorte Wohnung/Büro beide Musterweg 1. Aus dem E2E: zwei geschlossene Fahrten (42100–42140 betrieblich mit Vervollständigung; 42140–42180 privat, Datum auf den Vortag gesetzt, Korrekturspur beim Schließen). Nächster erwarteter Start: 42180.
- Zettelruhes Collection `fahrten` und das travel-Modul nicht übernommen.

## Übergabeprompt für den nächsten Chat

Siehe [`2026-08-19-uebergabe-bauabschnitt-4.md`](./2026-08-19-uebergabe-bauabschnitt-4.md).
