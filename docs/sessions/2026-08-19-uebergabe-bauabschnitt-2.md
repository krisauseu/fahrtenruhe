# Übergabe — Bauabschnitt 2 (Fahrzeug, Stammorte, Eröffnung)

Paste-ready Prompt für den nächsten Chat. Domain nicht neu grillen.

---

Du arbeitest in `/Users/kf/reiseruhe` am Produkt **Fahrtenruhe** (nicht Reiseruhe). Lies zuerst `AGENTS.md`, `CONTEXT.md`, `docs/90-status.md`, `docs/10-plan.md`, `docs/20-architecture.md` und ADR-0009, 0011, 0018, 0019. ADRs 0001–0022 sind geschlossen. BA1 (Fundament) ist erledigt.

## Auftrag

**Bauabschnitt 2 — Fahrzeug, Stammorte, Eröffnungs-Kilometerstand.** Nach Setup/Login kann die Nutzer:in ein Fahrzeug anlegen und die Stammorte der Firma setzen. Keine Erfassungsmaske für Fahrten, kein Iststand, kein PDF.

Konkret, in dieser Reihenfolge, und erst BA2 für erledigt erklären, wenn alles unten wahr ist:

1. PocketBase-Migration (Git, auto beim Compose-Start): Collection `fahrzeuge` (firma, kennzeichen presentable, `eroeffnungs_kilometerstand` int, `ausser_betrieb` bool) und Collection `stammorte` (firma, art `wohnung` | `erste_taetigkeitsstaette`, bezeichnung, Anschrift). Client create/update/delete = null. Next schreibt mit Superuser. Keine Collection `fahrten`.
2. Modul `vehicles`: Invarianten + Repository + Form-UI. Stabile id; Kennzeichen ist der Name und darf wechseln. Außer Betrieb legen, nicht löschen. `eroeffnungs_kilometerstand` ganzzahlig (ADR-0019) — Nachkommastellen vor dem Speichern ablehnen, nicht still runden. Keine 1-%-Felder, kein Listenpreis, kein Hubraum.
3. Modul `places`: Invarianten + Repository + Form-UI. Stammorte gehören zur **Firma**, nicht zum Fahrzeug. Je Firma höchstens eine Wohnung und höchstens eine erste Tätigkeitsstätte; dieselben Adressen sind erlaubt (ADR-0011). Nutzungstyp Wohnung–Tätigkeitsstätte noch nicht anbieten (das ist BA3) — aber die Gleichheit der Stammorte schon speichern, damit BA3 sie lesen kann.
4. App-Shell: Listen/Anlegen/Bearbeiten unter deutschsprachigen Routen (`/app/fahrzeuge`, `/app/stammorte` oder eine klare Stammdaten-Seite). Startseite zeigt die aktive Firma und, sobald vorhanden, das Kennzeichen. Ohne Fahrzeug: leerer Zustand mit Weg zum Anlegen, kein Tachofeld einer Fahrt.
5. Buchjahr-Hinweis light (ADR-0018): ein angebrochenes Kalenderjahr ohne lückenlose Kette ab 1. Januar bzw. ab Inbetriebnahme als **nicht nachweistauglich** kennzeichnen. Kein Übernahme-Assistent (BA8). Optional dünnes Feld `inbetriebnahme_am` am Fahrzeug, wenn du den Unterschied Inbetriebnahme vs. Jahresmitte-Einstieg brauchst — sonst nur der Hinweis, dass ohne Fahrten ab Jahresanfang das Buchjahr nicht nachweistauglich ist. Kein Forecast.
6. Tests: ganzzahliger Kilometerstand, Kennzeichenwechsel bricht die id nicht, außer Betrieb statt Löschen, Stammorte dürfen zusammenfallen, Client-Writes gesperrt, `cd app && npm test` grün. UI-Änderung im Browser oder, falls kein Browser-Tool gegen localhost, per Form-POST/curl Ende-zu-Ende prüfen.
7. Session-Log unter `docs/sessions/` und `docs/90-status.md` auf BA2-Stand. README nur anfassen, wenn der Schnellstart sonst lügt.

Bestehende Typ-Skelette: `app/src/modules/vehicles/types.ts`, `app/src/modules/places/types.ts`. Auth/Session/Setup nicht neu bauen.

## Fertig, wenn

- `docker compose up --build` bootet weiter ohne Handarbeit am PB-Admin
- Nach Login: Fahrzeug anlegen (Kennzeichen + Eröffnungs-Kilometerstand), Kennzeichen ändern, außer Betrieb legen
- Stammorte Wohnung und erste Tätigkeitsstätte je Firma speicherbar, auch identisch
- Shell zeigt Firmenname und Kennzeichen; ohne Fahrzeug keinen Fahrt-Start
- Keine Route `/fahrten/neu` / `/app/fahrten/neu`, keine offene Fahrt, kein Nutzungstyp-Picker
- PB-Client darf `fahrzeuge`/`stammorte` nicht schreiben
- `cd app && npm test` grün

## Nicht tun

- Domain neu verhandeln (Name, Nutzungstypen, Live-API, Kostenordner, 1 %)
- Zettelruhes Collection `fahrten` oder das travel-Modul übernehmen
- Fahrt anlegen/schließen, Lücken-Block, Korrekturspur, Kund:in, Iststand, PDF
- Fuhrpark/Pool, mehrere Fahrer:innen, GPS
- Rechnungen, Belege, Journal, SMTP, Jobs
- Workspace-Ordner umbenennen, wenn das die Session zerlegt (Produktname bleibt Fahrtenruhe)

## Invarianten, die BA2 schon tragen muss

- Writes auf Fahrzeug und Stammort nur Next
- Kilometerstand ganze Kilometer, keine stillen Zehntel
- Fahrzeug-id stabil; Kennzeichen nur presentable
- Außer Betrieb, nicht löschen
- UI de-DE, Begriffe aus CONTEXT.md (Fahrzeug, Kennzeichen, Stammort, Wohnung, erste Tätigkeitsstätte, Eröffnungs-Kilometerstand, nachweistauglich)
- Prosa DE, Module EN, Fachfelder DE

Quellen für Muster (nicht für Fachobjekte):  
BA1 in diesem Repo (`app/src/lib/pb.ts`, `app/src/app/setup/`, `platform/firma-invariants.ts`). Stammdaten-Form-Muster operational aus `/Users/kf/zettelruhe` (Kontakte/Firma), **nicht** `modules/travel` und nicht Collection `fahrten`.

Hinweis: Das lokale Volume `fahrtenruhe_pb_data` kann aus dem BA1-Smoke schon eine Firma **Beispiel UG** enthalten. Für eine leere Instanz: `docker compose down -v && docker compose up --build`.
