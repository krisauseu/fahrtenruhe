# Übergabe — Bauabschnitt 1 (Fundament)

Paste-ready Prompt für den nächsten Chat. Domain nicht neu grillen.

---

Du arbeitest in `/Users/kf/reiseruhe` am Produkt **Fahrtenruhe** (nicht Reiseruhe). Lies zuerst `AGENTS.md`, `CONTEXT.md`, `docs/90-status.md`, `docs/10-plan.md`, `docs/20-architecture.md`. ADRs 0001–0022 sind geschlossen.

## Auftrag

**Bauabschnitt 1 — Fundament.** Der Stack muss lokal mit `docker compose up --build` booten. Keine Erfassungsmaske, kein Iststand, kein PDF.

Konkret, in dieser Reihenfolge, und erst BA1 für erledigt erklären, wenn alles unten wahr ist:

1. Optional den Workspace-Ordner nach `fahrtenruhe` umbenennen, **wenn** das die Session nicht zerlegt. Sonst Ordner lassen, Produktname überall Fahrtenruhe.
2. Stack-Zwilling von `/Users/kf/zettelruhe` **abgucken, nicht klonen**: `docker-compose.yml`, Caddyfile, `pocketbase/` (Dockerfile, entrypoint, PB-Version pinnen wie dort), `app/` Next.js 16 + Vitest + Tailwind wie dort. Volume `fahrtenruhe_pb_data`. Cookie `fahrtenruhe_session`. `.env.example` ohne Zettelruhe-SMTP/ELSTER/eVatR-Pflicht.
3. PocketBase-Migration Fundament: `firmen` (dünn: Name, Anschrift — **kein** Steuer-Modus, SKR, Nummernkreis), `users` (role eigentuemer/nutzer, firma = zuletzt aktiv), `mitgliedschaften` (rollen eigentuemer/bearbeiten/lesen). Client create/update/delete auf Fachcollections = null. Next schreibt mit Superuser nach Invarianten.
4. Next: `/health`, Setup-Wizard (Eigentümer:in + erste Firma), Login/Logout, leere App-Shell mit aktiver Firma. Auth-Muster von Zettelruhe (PB-Login, httpOnly-Session, Origin-Check). Superuser ≠ App-Login.
5. Leere Module als Ordner plus `types.ts` + `index.ts` (kein UI): `platform`, `vehicles`, `places`, `contacts`, `trips`, `reporting`. Feldnamen de-snake_case laut `docs/20-architecture.md`.
6. README-Schnellstart so anpassen, dass `cp .env.example .env` und `docker compose up --build` dokumentiert sind. Ein lokaler Smoke: Health 200, Setup erreichbar, Login nach Setup.
7. Session-Log unter `docs/sessions/` und `docs/90-status.md` auf BA1-Stand.

## Fertig, wenn

- `docker compose up --build` startet Caddy + Next + PocketBase ohne Handarbeit am PB-Admin fürs Schema
- `/health` antwortet 200
- Leere Instanz zeigt Setup, danach Login in eine Shell mit Firmenname
- PB-Admin `/_/` erreichbar, App-User ist nicht der Superuser
- Keine Route `/fahrten/neu` und kein Tachofeld in der UI
- Tests: mindestens Session/Health/Invarianten-Smoke, analog Zettelruhe-Fundament, `cd app && npm test` grün

## Nicht tun

- Domain neu verhandeln (Name, Nutzungstypen, Live-API, Kostenordner, 1 %)
- Zettelruhes Collection `fahrten` oder das travel-Modul übernehmen
- Rechnungen, Belege, Journal, SMTP-Pflicht, Jobs
- Erfassung, Iststand, PDF „schon mal anlegen“
- Turbo, Postgres, App-Store

## Invarianten, die das Fundament schon tragen muss

- Writes auf Firmen/Nutzer/Mitgliedschaft nur Next
- UI-Texte de-DE, Begriffe aus CONTEXT.md
- Prosa DE, Module EN, Fachfelder DE
- AGPL-3.0 liegt schon als `LICENSE`

Quellen für Copy-Paste von Mustern (nicht von Fachobjekten):  
`/Users/kf/zettelruhe/docker-compose.yml`, `app/src/lib/session.ts`, `app/src/lib/session-token.ts`, `app/src/middleware.ts`, `app/src/app/setup/`, `pocketbase/pb_migrations/1730000000_init_foundation.js`, `pocketbase/pb_migrations/1730001900_mitgliedschaften.js`, ADR-0006/0009/0025 dort.
