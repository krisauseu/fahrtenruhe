# Session 2026-08-20 — Caddy `/_next` vs PocketBase `/_/`

## Done

- Diagnose Live `https://fb.zettelruhe.de/setup`: HTML von Next, CSS/JS/Image-Optimizer 404 als PocketBase-JSON `{"message":"File not found."}`. Öffentliche Dateien (`/brand/…`) kamen an. Ursache: Host-Caddy `handle /_*` matcht Prefix `/_` und schluckt `/_next`.
- `deploy/Caddyfile.host` und lokale `Caddyfile`: `handle /_next*` **vor** PocketBase; Admin nur `handle /_/*`.
- Install-Smoke und Funktionstest: Content-Type von `/_next/static/chunks/probe.css` muss `text/html` (Next-404) sein, nicht `application/json`.
- ADR-0023 um den Matcher ergänzt.

## Open / Blocked

- Host-Caddy auf dem Server muss kf ersetzen und reloaden — das liegt außerhalb des Repos.

## Next step

Site-Block auf dem Host an `deploy/Caddyfile.host` angleichen (`/_next*` zuerst, kein `/_*`), `caddy validate` + reload, `/setup` im Browser: Logo und Formular gestylt.
