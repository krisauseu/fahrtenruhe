# Session 2026-08-19 — bauabschnitt-1-fundament

## Done

- Compose-Stack: Caddy + Next.js 16 + PocketBase 0.39.10, Volume `fahrtenruhe_pb_data`
- PocketBase-Migration: `firmen` (Name + Anschrift, kein Steuer-Modus/SKR/Nummernkreis), `users` (eigentuemer/nutzer, firma = zuletzt aktiv), `mitgliedschaften` (eigentuemer/bearbeiten/lesen)
- Client-Writes auf Fachcollections gesperrt; Next schreibt mit Superuser
- Setup-Wizard (Eigentümer:in + erste Firma), Login/Logout, httpOnly-Cookie `fahrtenruhe_session`, Origin-Check, `/health` 200
- Leere App-Shell mit Firmenname; keine Route `/fahrten/neu`, kein Tachofeld
- Module-Skelette `platform` / `vehicles` / `places` / `contacts` / `trips` / `reporting`
- Vitest: Session, Health, Origin, Setup-Body, Firmen-Invarianten, Rechte (31 Tests)
- README-Schnellstart: `cp .env.example .env` && `docker compose up --build`

## Open / Blocked

- Workspace-Ordner heißt weiter `reiseruhe` (Umbenennen hätte die Session zerlegt)
- Kein Browser-MCP gegen localhost; Setup→Login per curl/Form-POST verifiziert

## Next step

Bauabschnitt 2: Fahrzeug, Stammorte, Eröffnungs-Kilometerstand.

## Context snapshot

- DoD BA1 erfüllt; keine Erfassung, kein Iststand, kein PDF.
- Superuser (`/_/`) ≠ App-Login (`users`). Session Secure nur bei HTTPS-`APP_URL`.
- `/api/*` hinter Caddy = PocketBase; App-Form-Submits unter `/setup/submit` und `/login/submit`.
- Zettelruhes Collection `fahrten` nicht übernommen.
