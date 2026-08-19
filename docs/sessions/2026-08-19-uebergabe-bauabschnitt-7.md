# Übergabe — Bauabschnitt 7 (PWA)

Paste-ready Prompt für den nächsten Chat. Domain nicht neu grillen.

---

Du arbeitest in `/Users/kf/reiseruhe` am Produkt **Fahrtenruhe** (nicht Reiseruhe). Lies zuerst `AGENTS.md`, `CONTEXT.md`, `docs/90-status.md`, `docs/10-plan.md`, `docs/20-architecture.md` und ADR-0010, 0004, 0014. ADRs 0001–0022 sind geschlossen. BA1–BA6 sind erledigt.

## Auftrag

**Bauabschnitt 7 — PWA, mobile Erfassung.** Erfassung als Web-PWA, kein App-Store-Client, kein GPS. Die Live-Start/Ende-Strecke auf `/app` muss auf dem Telefon bedienbar sein (eine offene Fahrt, ganze km, Korrekturspur nach Mitternacht bleibt). Installierbar am Homescreen reicht; Offline-First und Service-Worker sind kein Pflichtkern, solange die Erfassung im Browser mit Session trägt.

Konkret, in dieser Reihenfolge, und erst BA7 für erledigt erklären, wenn alles unten wahr ist:

1. PWA-light analog Zettelruhe: Web-App-Manifest, Icons, installierbar. Kein nativer Client, kein GPS-Zwang.
2. Mobile Erfassung: Start/Ende einer Fahrt auf schmalem Viewport (de-DE, Begriffe aus CONTEXT.md). Eine offene Fahrt je Fahrzeug; Lücken blocken; nach Mitternacht nur Korrekturspur.
3. Bestehende Buch-/Iststand-/Jahresnachweis-Strecken bleiben; Writes weiter nur Next.
4. Tests für das, was BA7 wirklich ändert (Manifest/Erfassung, keine Regression der Invarianten) und `cd app && npm test` grün. UI per Browser oder curl plus Viewport-Check.
5. Session-Log unter `docs/sessions/` und `docs/90-status.md` auf BA7-Stand. README nur anfassen, wenn der Schnellstart sonst lügt.

Auth/Session/Setup/Fahrzeug/Stammorte/Fahrt-Invarianten/Kund:in/Iststand-Addition/Jahresnachweis-PDF nicht neu bauen.

## Fertig, wenn

- Die App ist als PWA installierbar (Manifest, Icons)
- Start/Ende einer Fahrt auf dem Telefon zumutbar
- Keine GPS-Pflicht, kein App Store
- `cd app && npm test` grün
- `docker compose up --build` bootet weiter ohne Handarbeit am PB-Admin

## Nicht tun

- Domain neu verhandeln
- Jahresnachweis-PDF/CSV parallel neu schreiben
- Übernahme-Assistent
- Fuhrpark/Pool, mehrere Fahrer:innen, GPS
- Rechnungen, Belege, Journal, SMTP, Jobs
- Workspace-Ordner umbenennen, wenn das die Session zerlegt

## Invarianten, die BA7 schon tragen muss

- Writes aufs Buch und den Stamm nur Next
- Eine offene Fahrt je Fahrzeug; Kilometerkette ohne stille Lücken; ganze Kilometer
- PDF enthält die Korrekturspur; stille Überschreibung gibt es nicht
- UI de-DE, Begriffe aus CONTEXT.md
- Prosa DE, Module EN, Fachfelder DE

Quellen für Muster: Erfassung in diesem Repo (`/app`, `app/src/modules/trips`). Operational aus `/Users/kf/zettelruhe` (`app/src/app/manifest.ts` — PWA-light, kein Service Worker). Nicht Zettelruhes `fahrten` / travel.

Hinweis: Das lokale Volume `fahrtenruhe_pb_data` enthält Firma **Beispiel UG**, Fahrzeug `B-CD 5678` (Eröffnung 42100, Inbetriebnahme 2026-03-15), Stammorte Wohnung + Büro mit derselben Anschrift, Kund:in **Müller GmbH** mit Projekt **Dachausbau**. Iststand 2026: 220 km betrieblich, 40 km privat, 260 km gesamt, Quote 84,6 %, Band notwendiges Betriebsvermögen, Pauschale 66,00 €. Nicht nachweistauglich. Nächster Start: 42360. Jahresnachweis: `/app/jahresnachweis`, Downloads `/app/jahresnachweis/pdf|csv|json`. Login der Eigentümer:in: `alex@example.de` / `sicheres-passwort` (nicht der PB-Superuser). Für eine leere Instanz: `docker compose down -v && docker compose up --build`.
