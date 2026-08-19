# Flaches Monorepo wie Zettelruhe

Layout v1: `app/` (Next.js), `pocketbase/` (`pb_migrations`, Dockerfile), `Caddyfile`, `docker-compose.yml` im Root — ohne Turborepo und ohne Zwei-Repo-Split. Schema als Git-Migrationen. Begründung: derselbe Betrieb wie Zettelruhe (ADR-0010), reproduzierbares `docker compose up` für Self-Hosted.

## Alternatives considered

- **App in diesem Repo, PocketBase anderswo:** zwei Installationen für ein Buch.
- **Turborepo:** Overhead ohne zweiten JS-Package-Nutzen.
