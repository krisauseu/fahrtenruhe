# Übergabe — Bauabschnitt 3 (Fahrt)

Paste-ready Prompt für den nächsten Chat. Domain nicht neu grillen.

---

Du arbeitest in `/Users/kf/reiseruhe` am Produkt **Fahrtenruhe** (nicht Reiseruhe). Lies zuerst `AGENTS.md`, `CONTEXT.md`, `docs/90-status.md`, `docs/10-plan.md`, `docs/20-architecture.md` und ADR-0003, 0004, 0006, 0011, 0012, 0015, 0018, 0019. ADRs 0001–0022 sind geschlossen. BA1 (Fundament) und BA2 (Fahrzeug, Stammorte) sind erledigt.

## Auftrag

**Bauabschnitt 3 — Fahrt: Live-Start/Ende, Nutzungstyp, Lücken-Block, Vervollständigung, Korrekturspur, offene Fahrt.** Nach Login mit vorhandenem Fahrzeug kann die Nutzer:in eine Fahrt starten und am selben Kalendertag (Europe/Berlin) schließen. Kein Iststand, kein PDF, keine Kund:in.

Konkret, in dieser Reihenfolge, und erst BA3 für erledigt erklären, wenn alles unten wahr ist:

1. PocketBase-Migration (Git, auto beim Compose-Start): Collection `fahrten` (firma, fahrzeug, datum, `kilometerstand_start` int, `kilometerstand_ende` int leer=offen, `nutzungstyp` betrieblich | privat | wohnung_taetigkeitsstaette, ziel, zweck, Zeitstempel). Collection `korrekturspuren` (fahrt, wer, wann, vorher, nachher). Client create/update/delete = null. Next schreibt mit Superuser. **Nicht** Zettelruhes Collection `fahrten` / travel-Modul kopieren — das ist die Abrechnungszeile mit Pflicht-Kund:in.
2. Modul `trips`: Invarianten + Repository + Form-UI. Eine offene Fahrt pro Fahrzeug. Start folgt auf das Ende der vorigen bzw. auf den Eröffnungs-Kilometerstand; `ende(n) ≠ start(n+1)` blockt (Lücke, ADR-0015). Ganze Kilometer, Nachkommastellen ablehnen (ADR-0019). Genau ein Nutzungstyp pro Fahrt (ADR-0006). Nutzungstyp Wohnung–Tätigkeitsstätte nur anbieten, wenn die Stammorte verschieden sind (ADR-0011, `getStammorteStand().gleich`). Betrieblich ohne Kund:in: Zweck Pflicht (ADR-0012) — Kund:in selbst ist BA4, also in BA3 Zweck bei betrieblich immer Pflicht.
3. Offene Fahrt: Start mit Kilometerstand, Ende leer. Schließen am selben Kalendertag (Europe/Berlin). Nach Mitternacht nur noch mit sichtbarer Korrekturspur (ADR-0004). Keine stillen Entwürfe über den Tag hinaus.
4. Korrekturspur: spätere Änderung dokumentiert (wer, wann, was vorher, was nachher). Keine stille Überschreibung, kein Soft-Delete, kein Storno-Synonym.
5. App-Shell: deutschsprachige Routen (`/app/fahrten` bzw. Start/Ende auf der Startseite — klar und ohne `/fahrten/neu` aus Zettelruhe, wenn der Name kollidiert). Startseite: Firma, Kennzeichen, offene Fahrt oder Start-Feld. Ohne Fahrzeug weiterhin kein Tachofeld.
6. Buchjahr-Hinweis bleibt: ohne lückenlose Kette ab 1. Januar bzw. Inbetriebnahme nicht nachweistauglich. Kein Forecast, kein Übernahme-Assistent (BA8).
7. Tests: eine offene Fahrt, Lücken-Block, ganzzahlige km, Wohnung–Tätigkeitsstätte nur bei verschiedenen Stammorten, Client-Writes gesperrt, `cd app && npm test` grün. UI im Browser oder per Form-POST/curl Ende-zu-Ende.
8. Session-Log unter `docs/sessions/` und `docs/90-status.md` auf BA3-Stand. README nur anfassen, wenn der Schnellstart sonst lügt.

Bestehende Typ-Skelette: `app/src/modules/trips/types.ts`. Auth/Session/Setup/Fahrzeug/Stammorte nicht neu bauen.

## Fertig, wenn

- `docker compose up --build` bootet weiter ohne Handarbeit am PB-Admin
- Nach Login: Fahrt starten (Kilometerstand + Nutzungstyp + Ziel/Zweck), am selben Tag schließen; Kette ohne stille Lücke
- Höchstens eine offene Fahrt je Fahrzeug; zweite Start-Anlage blockt
- Nutzungstyp Wohnung–Tätigkeitsstätte fehlt in der UI, wenn Stammorte gleich sind
- Nach Mitternacht schließen nur mit Korrekturspur; die Spur ist in der UI sichtbar
- PB-Client darf `fahrten` / `korrekturspuren` nicht schreiben
- `cd app && npm test` grün
- Kein Iststand, kein PDF, keine Kund:in/Projekt-Pflicht, keine 1-%-Felder

## Nicht tun

- Domain neu verhandeln (Name, Nutzungstypen, Live-API, Kostenordner, 1 %)
- Zettelruhes Collection `fahrten` oder das travel-Modul übernehmen
- Kund:in/Projekt, Abrechnungsstatus, Iststand, PDF/CSV, PWA, Übernahme-Assistent
- Fuhrpark/Pool, mehrere Fahrer:innen, GPS
- Rechnungen, Belege, Journal, SMTP, Jobs
- Workspace-Ordner umbenennen, wenn das die Session zerlegt (Produktname bleibt Fahrtenruhe)

## Invarianten, die BA3 schon tragen muss

- Writes aufs Buch nur Next
- Eine offene Fahrt je Fahrzeug
- Kilometerkette ohne stille Lücken; ganze Kilometer
- Gleicher Kalendertag (Europe/Berlin); danach nur Korrekturspur
- UI de-DE, Begriffe aus CONTEXT.md (Fahrt, offene Fahrt, Nutzungstyp, betrieblich, privat, Wohnung–Tätigkeitsstätte, Zweck, Ziel, Lücke, Vervollständigung, Korrekturspur, nachweistauglich)
- Prosa DE, Module EN, Fachfelder DE

Quellen für Muster (nicht für Fachobjekte):  
BA2 in diesem Repo (`app/src/modules/vehicles/`, `places/`, Form-POST hinter Caddy). Operational aus `/Users/kf/zettelruhe` (Server, Session, Form-POST) — **nicht** `modules/travel` und nicht Collection `fahrten`.

Hinweis: Das lokale Volume `fahrtenruhe_pb_data` enthält Firma **Beispiel UG**, Fahrzeug `B-CD 5678` (Eröffnung 42100, Inbetriebnahme 2026-03-15) und Stammorte Wohnung + Büro mit derselben Anschrift. Login der Eigentümer:in: `alex@example.de` (nicht der PB-Superuser). Für eine leere Instanz: `docker compose down -v && docker compose up --build`.
