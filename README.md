# Fahrtenruhe

Self-hosted elektronisches Fahrtenbuch für Solo-Selbstständige in Deutschland.  
Ordnungsgemäßes Buch je Fahrzeug (GoBD/BFH), Jahresquote, Export nach [Zettelruhe](https://github.com/krisauseu/zettelruhe). Keine Buchhaltung, keine Rechnung.

Lizenz: [AGPL-3.0](./LICENSE)

Repo: [github.com/krisauseu/fahrtenruhe](https://github.com/krisauseu/fahrtenruhe) (privat). Arbeitstitel war Reiseruhe (ADR-0020).

## Schnellstart (lokal)

```bash
cp .env.example .env
docker compose up --build
```

Dann:

| URL | Zweck |
|-----|--------|
| [http://localhost/health](http://localhost/health) | Liveness, HTTP 200 |
| [http://localhost/setup](http://localhost/setup) | Leere Instanz: Eigentümer:in + erste Firma |
| [http://localhost/login](http://localhost/login) | App-Login (nicht der PocketBase-Superuser) |
| [http://localhost/_/](http://localhost/_/) | PocketBase-Admin (Superuser aus `.env`) |

Der Superuser (`PB_SUPERUSER_EMAIL`) ist nur Betrieb/Schema. Das App-Login entsteht im Setup.

Lokaler Smoke nach dem Start:

```bash
curl -sS -o /dev/null -w "%{http_code}\n" http://localhost/health   # 200
curl -sS -o /dev/null -w "%{http_code}\n" http://localhost/setup    # 200 (leere Instanz)
curl -sS -o /dev/null -w "%{http_code}\n" http://localhost/fahrten/neu  # 404 — nicht die Zettelruhe-Route; Erfassung unter /app
```

Tests:

```bash
cd app && npm test
```

Port 80 belegt? In `.env` z. B. `CADDY_HTTP_PORT=8080` und `APP_URL=http://localhost:8080` setzen.

## Server (Host-Caddy)

Wenn Caddy schon als Systemdienst läuft: Overlay `docker-compose.server.yml`, Site-Block `deploy/Caddyfile.host` (Platzhalter `app.example.de`). Compose-Caddy startet dort nicht.

Schritte: [`docs/installation-server.md`](./docs/installation-server.md).  
Funktionstest Desktop + PWA: [`docs/funktionstest.md`](./docs/funktionstest.md).

```bash
# nach .env mit APP_URL=https://… (ohne Slash)
docker compose -f docker-compose.yml -f docker-compose.server.yml up -d --build
```

## Stack (v1)

| Komponente | Rolle |
|------------|--------|
| **Next.js 16** (App Router, Server Actions) | UI + Domain + Session-Gate |
| **PocketBase** (SQLite) | Auth-Quelle, Daten, Dateien |
| **Caddy** | Lokal: Compose HTTP :80. Server: nativer Systemdienst (TLS) |
| **Docker Compose** | Next + PocketBase, Volume `fahrtenruhe_pb_data`; lokal zusätzlich Caddy |

Fahrtenbuch-Writes nur über Next (nicht per Client-PB-SDK). Session-Cookie: `fahrtenruhe_session`. Details: [`docs/adr/`](./docs/adr/).

**Status:** v1 vollständig (BA1–BA9 + Stabilisieren). Siehe [`docs/90-status.md`](./docs/90-status.md).

## Repo-Layout

```
app/                      Next.js (src/modules/*, src/lib/*)
pocketbase/               Dockerfile, pb_migrations/
Caddyfile                 Reverse Proxy lokal (HTTP :80)
deploy/Caddyfile.host     Site-Block für Host-Caddy (Platzhalter-Domain)
docker-compose.yml
docker-compose.server.yml Overlay: kein Compose-Caddy, Ports nur localhost
.env.example
docs/                     Plan, ADRs, Betrieb, Installation, Funktionstest
CONTEXT.md                Domain-Sprache
LICENSE                   AGPL-3.0
```

## Dokumentation

| Datei | Zweck |
|-------|--------|
| [`CONTEXT.md`](./CONTEXT.md) | Glossary und Scope |
| [`docs/00-overview.md`](./docs/00-overview.md) | Ziel, Nicht-Ziele |
| [`docs/10-plan.md`](./docs/10-plan.md) | Bauabschnitte |
| [`docs/20-architecture.md`](./docs/20-architecture.md) | Stack, Module, Datenmodell |
| [`docs/adr/`](./docs/adr/) | Architekturentscheidungen |
| [`docs/quellen-fahrtenbuch.md`](./docs/quellen-fahrtenbuch.md) | BFH/BMF/GoBD-Quellen |
| [`docs/verfahrensdokumentation.md`](./docs/verfahrensdokumentation.md) | Verfahrensdoku-Vorlage (kein Zertifikat) |
| [`docs/betrieb.md`](./docs/betrieb.md) | Backup/Restore |
| [`docs/installation-server.md`](./docs/installation-server.md) | Server hinter bestehendem Host-Caddy |
| [`docs/funktionstest.md`](./docs/funktionstest.md) | Manueller Funktionstest Desktop + PWA |
| [`docs/90-status.md`](./docs/90-status.md) | Projektstand |
| [`docs/sessions/`](./docs/sessions/) | Sitzungsprotokolle |

## Konventionen

- Prosa und UI: **de-DE**. Code-Identifier und Dateinamen: **en** für Module (`trips`, `vehicles`), **de** für Fachfelder (`kilometerstand`, `nutzungstyp`) — wie Zettelruhe.
- UI-Labels strikt aus CONTEXT.md, keine englischen Domänenwörter in der Oberfläche.
