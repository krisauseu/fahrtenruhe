# Installation auf dem Server (Host-Caddy)

Kurzanleitung für eine Self-Hosted-Instanz, **wenn Caddy schon als Systemdienst läuft** (Let’s Encrypt, weitere Sites). Overlay und Begründung: ADR-0023. Backup danach: [`betrieb.md`](./betrieb.md).

Platzhalter in dieser Datei und in `deploy/Caddyfile.host`: **`app.example.de`**. Vor dem Reload durch den echten Host ersetzen.

## Voraussetzungen

- Docker + Compose-Plugin **≥ 2.24** (`!override` auf den Next-Ports)
- Caddy als Systemdienst, Ports **80 und 443 frei für Host-Caddy** (kein Compose-Caddy)
- DNS `A`/`AAAA` für den Host → dieser Rechner
- Git-Zugang zum privaten Repo

Compose-Caddy im Overlay startet nicht. Next und PocketBase binden nur localhost.

| Dienst | Host-Port (localhost) | Hinweis |
|--------|------------------------|---------|
| Next | `127.0.0.1:3001` | nicht 3000 — das ist typisch Zettelruhe |
| PocketBase | `127.0.0.1:8091` | nicht 8090 — dasselbe |
| Intern im Docker-Netz | Next `:3000`, PB `:8090` | `PB_URL=http://pocketbase:8090` unverändert |

## 1. Code und `.env`

```bash
git clone https://github.com/krisauseu/fahrtenruhe.git
# oder: git clone git@github.com:krisauseu/fahrtenruhe.git
cd fahrtenruhe
cp .env.example .env
```

In `.env` setzen (keine `change-me`-Werte):

| Variable | Wert |
|----------|------|
| `APP_URL` | `https://app.example.de` — echter Host, **ohne** Slash am Ende |
| `PB_URL` | `http://pocketbase:8090` |
| `SESSION_SECRET` | `openssl rand -base64 48` (≥ 32 Zeichen) |
| `PB_SUPERUSER_EMAIL` / `PB_SUPERUSER_PASSWORD` | stark, einzigartig; **nicht** das App-Login |

```bash
chmod 600 .env
```

`APP_URL` ist Build-Arg (Server Actions / CSRF). Nach jeder Änderung **neu bauen**.

## 2. Site-Block in die bestehende Host-Caddy

Die Datei `deploy/Caddyfile.host` **nicht** als ganze `/etc/caddy/Caddyfile` kopieren — das würde andere Sites (z. B. Zettelruhe) überschreiben.

```bash
sudo cp deploy/Caddyfile.host /etc/caddy/fahrtenruhe.caddy
sudo sed -i 's/app.example.de/ECHTER-HOST/' /etc/caddy/fahrtenruhe.caddy
```

Am Ende der bestehenden `/etc/caddy/Caddyfile` (einmal):

```
import fahrtenruhe.caddy
```

Optional global, nur einmal oben in der Host-Caddyfile:

```
{
	email du@example.de
}
```

`/_/` (PocketBase-Admin) bleibt über denselben Host erreichbar. Wer den Admin nicht im Netz will, sperrt das am Host (VPN / Allowlist) — dieser Schnitt tut das nicht.

**Nicht `handle /_*`.** Caddy matcht `/_*` als Prefix und schluckt Next.js `/_next` (CSS, JS, Logo-Optimizer). Im Browser: Setup/Login wie ungestyltes HTML, kaputtes Logo; `curl` auf `/_next/…` liefert PocketBase-JSON `{"message":"File not found."}`. Immer den Site-Block aus `deploy/Caddyfile.host` nehmen: `/_next*` **zuerst** auf Next, Admin nur als `/_/*`.

```bash
sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

## 3. Stack ohne Compose-Caddy

```bash
docker compose -f docker-compose.yml -f docker-compose.server.yml up -d --build
docker compose -f docker-compose.yml -f docker-compose.server.yml ps
```

Erwartung: `next` und `pocketbase` **healthy**, Service `caddy` **nicht** in der Liste.

## 4. Smoke

```bash
curl -sSI https://app.example.de/health
# HTTP 200, Zertifikat ohne Browser-Ausnahme
# {"ok":true,"service":"fahrtenruhe",...}

curl -sSI https://app.example.de/app
# 307 → /login

# /_next muss bei Next landen, nicht bei PocketBase
curl -sS -o /dev/null -w '%{content_type}\n' https://app.example.de/_next/static/chunks/probe.css
# erwartet: text/html   (Next-404)
# falsch:   application/json  → Caddy hat /_next an PocketBase gegeben (handle /_*)
```

Browser: `https://app.example.de/setup` (leere Instanz) oder `/login`. Cookie `fahrtenruhe_session` mit Flag **Secure**. Superuser nur unter `https://app.example.de/_/` — nicht als App-Login.

Leere Instanz bewusst: `docker compose -f docker-compose.yml -f docker-compose.server.yml down -v && docker compose -f docker-compose.yml -f docker-compose.server.yml up -d --build`.

## 5. Updates

1. Backup Volume + `.env` ([`betrieb.md`](./betrieb.md))
2. `git pull`
3. `docker compose -f docker-compose.yml -f docker-compose.server.yml up -d --build`
4. Smoke: `/health`, Login, eine Fahrt, PDF-Download

Lokal bleibt `docker compose up --build` (HTTP :80, Repo-`Caddyfile`). Das Overlay nicht lokal anwenden.

Funktionstest nach der Installation: [`funktionstest.md`](./funktionstest.md).
