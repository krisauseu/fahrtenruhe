# Betrieb — Fahrtenruhe (self-hosted Solo)

Praxishinweise für eine Instanz mit **Instanz-Eigentümer:in** und einer
aktiven Firma. Stack: Caddy + Next.js + PocketBase (SQLite), Named Volume
`fahrtenruhe_pb_data`. Verfahren und Nachweis: [`verfahrensdokumentation.md`](./verfahrensdokumentation.md).

## 1. Was gehört zum System

| Komponente | Inhalt | Persistenz |
|------------|--------|------------|
| **PocketBase** | Auth, Collections (Firma, Fahrzeug, Fahrten, Korrekturspur) | Volume `fahrtenruhe_pb_data` → `/pb_data` |
| **Next.js** | UI, Domain, Session, PDF/CSV | Stateless (keine App-DB) |
| **Caddy** | Reverse Proxy Port 80 | Stateless |
| **`.env`** | Secrets und URLs | Host-Dateisystem (nicht im Volume) |

**Ein Backup des PB-Volumes sichert das Buch.** `.env` separat sichern.

## 2. Backup

### Was

1. **Pflicht:** Named Volume `fahrtenruhe_pb_data` (SQLite `data.db` + `storage/`)
2. **Empfohlen:** `.env` (sonst starten Session und Superuser mit anderen Secrets)

### Wann

Täglich empfohlen; vor Updates extra. Aufbewahrung lokal festlegen (siehe Verfahrensdokumentation).

### Wie (tar aus dem Volume)

```bash
docker compose stop

docker run --rm \
  -v fahrtenruhe_pb_data:/data:ro \
  -v "$(pwd)/backups":/backup \
  alpine \
  tar czf "/backup/pb_data-$(date +%Y%m%d-%H%M).tar.gz" -C /data .

docker compose start
```

Volume-Pfad prüfen: `docker volume inspect fahrtenruhe_pb_data`

Nicht ausreichend: nur die Next-Layer, nur das Git-Repo, nur `.env.example`.

## 3. Restore

1. Stack stoppen: `docker compose down` (Volume **nicht** mit `-v` löschen, außer bewusst).
2. Volume leeren bzw. frisches Volume, dann entpacken:

```bash
docker compose down
docker volume create fahrtenruhe_pb_data
docker run --rm \
  -v fahrtenruhe_pb_data:/data \
  -v "$(pwd)/backups":/backup \
  alpine \
  tar xzf /backup/pb_data-YYYYMMDD-HHMM.tar.gz -C /data
docker compose up -d
```

3. Login der Eigentümer:in prüfen (nicht der PB-Superuser) und Stichprobe Fahrzeug / Fahrt / Korrekturspur.

Leere Instanz bewusst: `docker compose down -v && docker compose up --build`.

## 4. Zugang

- App-Login über `/login`. Superuser nur `/_/` (Betrieb/Schema).
- Production: HTTPS, keine Default-Secrets. Cookie `fahrtenruhe_session` ist httpOnly; **Secure** nur wenn `APP_URL` mit `https://` beginnt.
- Health: `GET /health`.

## 5. HTTPS / Caddy (ADR-0023)

Lokal: Caddy im Compose, HTTP Port 80, Repo-`Caddyfile` ohne TLS. Unverändert `docker compose up`.

Server: **Caddy nativ auf dem Host** (bereits Systemdienst). Let’s Encrypt, Platzhalter-Host `app.example.de`. Host-Caddy terminiert TLS und proxied auf `127.0.0.1:3001` (Next) und `127.0.0.1:8091` (PocketBase). Compose-Caddy startet dort nicht. Overlay: `docker-compose.server.yml`. Site-Block: `deploy/Caddyfile.host`.

Installationsschritte, Import in die bestehende Host-Caddy (nicht überschreiben) und Smoke: [`installation-server.md`](./installation-server.md).

Funktionstest Desktop + PWA: [`funktionstest.md`](./funktionstest.md).

## 6. Healthcheck

```bash
curl -sS http://localhost/health
# Server: curl -sSI https://app.example.de/health
# {"ok":true,"service":"fahrtenruhe",...}
```

Compose: Services `next` und `pocketbase` haben Healthchecks (siehe `docker-compose.yml`).

## 7. Updates

1. Backup Volume + `.env`
2. `git pull`
3. Lokal: `docker compose up -d --build` · Server: Overlay wie in der Installationsdoku
4. Migrationen laufen beim PB-Start (`pb_migrations`)
5. Smoke: Login, eine Fahrt, PDF-Download
