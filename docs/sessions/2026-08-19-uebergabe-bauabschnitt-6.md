# Übergabe — Bauabschnitt 6 (Jahresnachweis)

Paste-ready Prompt für den nächsten Chat. Domain nicht neu grillen.

---

Du arbeitest in `/Users/kf/reiseruhe` am Produkt **Fahrtenruhe** (nicht Reiseruhe). Lies zuerst `AGENTS.md`, `CONTEXT.md`, `docs/90-status.md`, `docs/10-plan.md`, `docs/20-architecture.md` und ADR-0005, 0014, 0017. ADRs 0001–0022 sind geschlossen. BA1–BA5 sind erledigt.

## Auftrag

**Bauabschnitt 6 — Jahresnachweis PDF + CSV/JSON.** Das PDF *ist* das Buch für die Einsichtnahme (fortlaufende Fahrten inklusive Korrekturspur). Dieselben Zahlen wie der Iststand — `addiereIststand` nicht neu erfinden. Kein Forecast, keine 1-%, keine Entfernungspauschale, keine Live-API.

Konkret, in dieser Reihenfolge, und erst BA6 für erledigt erklären, wenn alles unten wahr ist:

1. PDF je Fahrzeug und Buchjahr: geschlossene Form, Kilometerkette, Nutzungstyp, Ziel, Zweck, Kund:in, Korrekturspur im selben Dokument. Offenes / nicht lückenloses Buchjahr bleibt als nicht nachweistauglich gekennzeichnet.
2. CSV/JSON des ganzen Buchs und zusätzlich nur der abrechenbaren Fahrten (Schnittstelle nach Zettelruhe, Datei-Export, keine Live-API).
3. Dieselbe Addition wie der Iststand (km je Nutzungstyp, Quote, Band, Kilometerpauschale). Keine Hochrechnung auf den 31.12.
4. UI de-DE, deutschsprachige Route (z. B. unter `/app/iststand` oder `/app/jahresnachweis`). Iststand bleibt die jederzeit sichtbare Addition; der Jahresnachweis ist der formelle Export.
5. Tests (PDF enthält Korrekturspur; CSV der abrechenbaren Fahrten; Addition unverändert) und `cd app && npm test` grün. Export per curl oder Browser.
6. Session-Log unter `docs/sessions/` und `docs/90-status.md` auf BA6-Stand. README nur anfassen, wenn der Schnellstart sonst lügt.

Auth/Session/Setup/Fahrzeug/Stammorte/Fahrt/Kund:in/Iststand-Addition nicht neu bauen.

## Fertig, wenn

- PDF je Fahrzeug zeigt die Fahrten inklusive Korrekturspur (das PDF *ist* das Buch)
- CSV/JSON des Buchs und der abrechenbaren Fahrten liegen als Download
- Zahlen stimmen mit dem Iststand überein
- Keine Hochrechnung, keine 1-%-Felder, keine Live-API
- `cd app && npm test` grün
- `docker compose up --build` bootet weiter ohne Handarbeit am PB-Admin

## Nicht tun

- Domain neu verhandeln
- Iststand-Addition parallel neu schreiben
- PWA, Übernahme-Assistent
- Fuhrpark/Pool, mehrere Fahrer:innen, GPS
- Rechnungen, Belege, Journal, SMTP, Jobs
- Workspace-Ordner umbenennen, wenn das die Session zerlegt

## Invarianten, die BA6 schon tragen muss

- Writes aufs Buch und den Stamm nur Next
- Eine offene Fahrt je Fahrzeug; Kilometerkette ohne stille Lücken; ganze Kilometer
- PDF enthält die Korrekturspur; stille Überschreibung gibt es nicht
- UI de-DE, Begriffe aus CONTEXT.md (Jahresnachweis, Iststand, Buchjahr, Korrekturspur, abrechenbar)
- Prosa DE, Module EN, Fachfelder DE

Quellen für Muster: BA5 in diesem Repo (`app/src/modules/reporting/iststand.ts`, `/app/iststand`). Operational aus `/Users/kf/zettelruhe` (PDF-Layout bei sales, CSV bei reporting — nicht travel, nicht Zettelruhes `fahrten`).

Hinweis: Das lokale Volume `fahrtenruhe_pb_data` enthält Firma **Beispiel UG**, Fahrzeug `B-CD 5678` (Eröffnung 42100, Inbetriebnahme 2026-03-15), Stammorte Wohnung + Büro mit derselben Anschrift, Kund:in **Müller GmbH** mit Projekt **Dachausbau**. Iststand 2026: 220 km betrieblich, 40 km privat, 260 km gesamt, Quote 84,6 %, Band notwendiges Betriebsvermögen, Pauschale 66,00 €. Nicht nachweistauglich (erste Fahrt 19.8.). Nächster Start: 42360. Login der Eigentümer:in: `alex@example.de` / `sicheres-passwort` (nicht der PB-Superuser). Für eine leere Instanz: `docker compose down -v && docker compose up --build`.
