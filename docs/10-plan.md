# Plan — Fahrtenruhe

_Last updated: 2026-08-19_

## Current phase

**Bauabschnitt 9 (UI) + Stabilisieren erledigt — v1 vollständig**

## Phases

| Phase | Status | Notes |
|---|---|---|
| 0 — Concept | done | Grill 2026-08-19, Name Fahrtenruhe |
| 1 — Planning | done | CONTEXT.md, ADR-0001–0022 |
| 2 — Build | done | Bauabschnitt 1–9 done |
| 3 — Stabilize | done | Funktionstest analog Zettelruhe |
| 4 — Maintenance | | |

## Bauabschnitte

| BA | Inhalt | Status |
|---|---|---|
| 1 | Fundament: Docker Compose, PocketBase, Next health, Setup-Wizard, Session, leere Shell | done |
| 2 | Fahrzeug, Stammorte, Eröffnungs-Kilometerstand | done |
| 3 | Fahrt: Live-Start/Ende, Nutzungstyp, Lücken-Block, Vervollständigung, Korrekturspur, offene Fahrt | done |
| 4 | Kund:in/Projekt dünn, Abrechnungsstatus, Zettelruhe-Ids | done |
| 5 | Iststand (Jahr/Monat/Kund:in) | done |
| 6 | Jahresnachweis PDF + CSV/JSON (Buch und abrechenbare Fahrten) | done |
| 7 | PWA, mobile Erfassung | done |
| 8 | Härten: Verfahrensdoku-Vorlage, Tests, Übernahme-Altbestand light | done |
| 9 | UI: helles Default-Theme, Logo in UI/PWA, Kontrast; danach Stabilisieren | done |

## Current focus

v1 vollständig. Maintenance. Domain bleibt geschlossen. Server: Host-Caddy Overlay (ADR-0023). Kund:innen-Stamm: Zettelruhe-Kontakte-CSV, Join Kontaktnummer (ADR-0024).

## Parking lot

- Lokalen Ordner `reiseruhe` → `fahrtenruhe` umbenennen (Repo heißt bereits fahrtenruhe; Compose-Projektname ist fest)
- Zettelruhe-Import der Export-CSV (andere App, später)
- Familienheimfahrt, abweichendes Wirtschaftsjahr
