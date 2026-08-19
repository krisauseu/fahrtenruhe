# Übergabe — Bauabschnitt 5 (Iststand)

Paste-ready Prompt für den nächsten Chat. Domain nicht neu grillen.

---

Du arbeitest in `/Users/kf/reiseruhe` am Produkt **Fahrtenruhe** (nicht Reiseruhe). Lies zuerst `AGENTS.md`, `CONTEXT.md`, `docs/90-status.md`, `docs/10-plan.md`, `docs/20-architecture.md` und ADR-0005, 0014, 0017. ADRs 0001–0022 sind geschlossen. BA1–BA4 sind erledigt.

## Auftrag

**Bauabschnitt 5 — Iststand (Jahr/Monat/Kund:in).** Dieselbe Addition wie der spätere Jahresnachweis, jederzeit in der UI. Kein Forecast, kein PDF, kein CSV-Export (das ist BA6).

Konkret, in dieser Reihenfolge, und erst BA5 für erledigt erklären, wenn alles unten wahr ist:

1. Modul `reporting`: Iststand je Fahrzeug für ein Buchjahr (Kalenderjahr). Kilometer je Nutzungstyp (betrieblich, privat, Wohnung–Tätigkeitsstätte), Gesamtfahrleistung, Jahresquote, Band der Vermögenszuordnung, Pauschalen-Spalte (Default 0,30 € je betrieblichem Kilometer **ohne** Wohnung–Tätigkeitsstätte). Keine 1-%-Felder, keine Entfernungspauschale, keine Hochrechnung.
2. Default: laufendes Buchjahr je Fahrzeug. Filter: Monat, Zeitraum, Kund:in. Die Zahlen sind dieselben Additionen wie später im Jahresnachweis.
3. UI de-DE unter einer deutschsprachigen Route (z. B. `/app/iststand`). Offenes Buchjahr bleibt als nicht nachweistauglich gekennzeichnet, wenn die Kette nicht ab Pflichtstart lückenlos ist.
4. Tests für die Addition (Quote, Band, Filter Kund:in/Monat) und `cd app && npm test` grün. UI per Form-GET/curl oder Browser.
5. Session-Log unter `docs/sessions/` und `docs/90-status.md` auf BA5-Stand. README nur anfassen, wenn der Schnellstart sonst lügt.

Auth/Session/Setup/Fahrzeug/Stammorte/Fahrt/Kund:in nicht neu bauen.

## Fertig, wenn

- Iststand zeigt km je Nutzungstyp, Quote und Band für das laufende Buchjahr
- Filter Monat / Zeitraum / Kund:in ändern die sichtbare Addition, nicht eine zweite Wahrheit
- Keine Hochrechnung auf den 31.12.
- Kein PDF, kein CSV, keine 1-%-Felder, keine Live-API
- `cd app && npm test` grün
- `docker compose up --build` bootet weiter ohne Handarbeit am PB-Admin

## Nicht tun

- Domain neu verhandeln
- Jahresnachweis-PDF/CSV (BA6)
- PWA, Übernahme-Assistent
- Fuhrpark/Pool, mehrere Fahrer:innen, GPS
- Rechnungen, Belege, Journal, SMTP, Jobs
- Workspace-Ordner umbenennen, wenn das die Session zerlegt

## Invarianten, die BA5 schon tragen muss

- Writes aufs Buch und den Stamm nur Next
- Eine offene Fahrt je Fahrzeug; Kilometerkette ohne stille Lücken; ganze Kilometer
- UI de-DE, Begriffe aus CONTEXT.md (Iststand, Buchjahr, Jahresquote, Vermögenszuordnung, Kilometerpauschale)
- Prosa DE, Module EN, Fachfelder DE

Quellen für Muster: BA4 in diesem Repo (`app/src/modules/trips/`, `app/src/modules/contacts/`). Operational aus `/Users/kf/zettelruhe` (Reporting-Filter, nicht travel).

Hinweis: Das lokale Volume `fahrtenruhe_pb_data` enthält Firma **Beispiel UG**, Fahrzeug `B-CD 5678` (Eröffnung 42100, Inbetriebnahme 2026-03-15), Stammorte Wohnung + Büro mit derselben Anschrift, Kund:in **Müller GmbH** mit Projekt **Dachausbau**, und mehrere geschlossene Fahrten (nächster Start 42360). Login der Eigentümer:in: `alex@example.de` / `sicheres-passwort` (nicht der PB-Superuser). Für eine leere Instanz: `docker compose down -v && docker compose up --build`.
