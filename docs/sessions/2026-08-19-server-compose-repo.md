# Session 2026-08-19 — server-compose-repo

## Done

- Overlay `docker-compose.server.yml`: Compose-Caddy aus (Profil), Next `127.0.0.1:3001`, PocketBase `127.0.0.1:8091` (kein Konflikt mit Zettelruhe auf 3000/8090). Compose-Projektname `fahrtenruhe` unabhängig vom Ordner.
- Host-Caddy Site-Block `deploy/Caddyfile.host` mit Platzhalter `app.example.de`; nicht als ganze Caddyfile kopieren.
- Install [`docs/installation-server.md`](../installation-server.md), Funktionstest Desktop+PWA [`docs/funktionstest.md`](../funktionstest.md), ADR-0023.
- Privates GitHub-Repo `krisauseu/fahrtenruhe`, initialer Commit.

## Open / Blocked

- Workspace-Ordner heißt weiter `reiseruhe` (bewusst, Session nicht zerlegen). Umbenennen ist gefahrlos, siehe Übergabe.
- Server-Funktionstest durch kf steht aus.

## Next step

Installation auf dem Test-Host nach der Installationsdoku, dann [`funktionstest.md`](../funktionstest.md).
