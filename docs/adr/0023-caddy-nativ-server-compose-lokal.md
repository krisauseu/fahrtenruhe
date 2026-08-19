# Caddy nativ auf dem Server, Compose-Caddy nur lokal

Auf dem öffentlichen Host terminiert das **bereits laufende Host-Caddy** (Systemdienst) TLS (Let’s Encrypt) und proxied auf Next (`127.0.0.1:3001`) und PocketBase (`127.0.0.1:8091`). Compose-Caddy bleibt der lokale HTTP-Eingang (Port 80, kein TLS) und ist auf dem Server nicht der öffentliche Proxy. PocketBase-Admin `/_/` bleibt über denselben Host erreichbar (explizit). Next spricht PocketBase weiter nur intern (`PB_URL=http://pocketbase:8090`). Host-Ports 3001/8091, damit Zettelruhe auf demselben Rechner (3000/8090) nicht kollidiert. Begründung: Port 80/443 braucht der Host für ACME und bestehende Sites; ein Compose-Caddy als öffentlicher Eingang würde kollidieren; lokal soll `docker compose up` unverändert HTTP liefern.

## Alternatives considered

- Caddy im Compose mit 443 und internem ACME — ein Stack, aber Port 80/443 am Host wären weg; lokal würde TLS stören.
- Host-Caddy nur auf Compose-Caddy `:80` — zusätzlicher Hop, Compose-Caddy müsste auf dem Server weiter laufen.
- Dieselben Host-Ports wie Zettelruhe (3000/8090) — auf einem gemeinsamen Test-Host eine Kollision.
- `/_/` nicht öffentlich — in der Installationsdoku die härtere Empfehlung; hier bewusst nicht, Admin bleibt über denselben Host.
