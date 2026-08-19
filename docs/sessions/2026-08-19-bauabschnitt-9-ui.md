# Session 2026-08-19 — bauabschnitt-9-ui

## Done

- Helles Default-Theme (nicht mehr System-Dark). Dark nur nach bewusstem Toggle (`fahrtenruhe-theme`). Palette am Auftraggeber-Logo (Teal, hoher Kontrast). Sticky Header, aktive Nav, Hinweis-Banner, Badges.
- Logo in UI (`BrandMark` → `/brand/fahrtenruhe-mark.png`) und PWA (Icons 192/512, Apple-Touch 180, Favicon 32, Manifest-Theme `#f4fbfc`). Buchstaben-F ist raus.
- Zentrale Screens: Login, Fahrtenbuch/Live-Erfassung, Fahrtenliste, Korrekturspur, Jahresnachweis (Kacheln = Iststand-Addition), Verfahrensdoku (kein Zertifikat), gekennzeichnete Übernahme. Keine neuen Features, keine Domain-Öffnung.
- Stabilisieren: Happy Path gegen die Invarianten. `cd app && npm test` 161 grün. `docker compose up --build` ohne PB-Admin. Curl + Chrome (Desktop 1280 / Mobile 390): Login mit Logo, Lücken-POST blockt, Iststand B-CD 220/40/260 km · 84,6 % · notwendiges Betriebsvermögen · 66,00 € · nicht nachweistauglich, B-UE nachweistauglich nach Übernahme 10000–10040, PDF *ist* das Buch (Korrekturspur + Übernahme-Marke).

## Open / Blocked

- Workspace-Ordner heißt weiter `reiseruhe`
- Kein Browser-MCP gegen localhost; UI per Chrome-Headless und curl verifiziert

## Next step

Maintenance. Domain bleibt geschlossen. Optional Ordner umbenennen, sobald Git lebt.

## Context snapshot

- Theme: `app/src/app/globals.css`, Toggle `app/src/components/theme-toggle.tsx`, Default-Script in `app/src/app/layout.tsx` (nur `localStorage === 'dark'`).
- Logo: Quelle `docs/img/logo-512x512-transparent.png`, UI `app/public/brand/fahrtenruhe-mark.png`, PWA `app/public/icon-192.png` / `icon-512.png`, Apple `app/src/app/apple-icon.png`.
- Volume `fahrtenruhe_pb_data`: Firma **Beispiel UG**. Fahrzeug `B-CD 5678` (Eröffnung 42100, Inbetriebnahme 2026-03-15): Iststand 2026 = 220 km betrieblich, 40 km privat, 260 km gesamt, Quote 84,6 %, Band notwendiges Betriebsvermögen, Pauschale 66,00 €. Nicht nachweistauglich. Nächster Start: 42360. Zweites Fahrzeug `B-UE 8000` (Eröffnung 10000, Inbetriebnahme 2026-03-15): eine Übernahme 10000–10040 privat am 15.3., nachweistauglich.
- PWA: `/manifest.webmanifest`, Erfassung `/app`, Verfahren `/app/verfahren`, Übernahme `/app/fahrten/uebernahme`. Login `alex@example.de` / `sicheres-passwort` (nicht der PB-Superuser).

## Übergabeprompt für den nächsten Chat

Siehe [`2026-08-19-uebergabe-maintenance.md`](./2026-08-19-uebergabe-maintenance.md).
