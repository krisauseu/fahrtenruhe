# Architecture — Fahrtenruhe

_Last updated: 2026-08-19 (Server: Host-Caddy Overlay, ADR-0023)_

## Stack

Next.js 16 (App Router, Server Actions) + PocketBase (SQLite, Auth, Dateien) + Caddy + Docker Compose. Ein Volume `fahrtenruhe_pb_data`. Auth: PocketBase als Quelle, Next httpOnly-Session. Fahrtenbuch-Writes nur Next. Erfassung als Web-PWA, nicht nativ. ADR-0010, 0016, 0021.

Twin zum Abgucken: `/Users/kf/zettelruhe`. Nicht kopieren: Collection `fahrten` (das ist die Abrechnungszeile).

## Component map

```
Browser (PWA)
    → Caddy
        lokal: Compose :80
        Server: Host-Caddy (Systemdienst, TLS) → 127.0.0.1:3001 / :8091
        → Next :3000   UI, Session, Domain, PDF/CSV
        → PocketBase :8090   /api /_/  (Client-Writes aufs Buch: gesperrt)
```

Lokal: `docker compose up`. Server: Overlay `docker-compose.server.yml`, Site-Block `deploy/Caddyfile.host` (ADR-0023).

## Module (`app/src/modules/`)

| Modul | Gegenstand |
|---|---|
| `platform` | Firma, Nutzer:in, Mitgliedschaft, Session, Setup; Verfahrensdoku-Vorlage (`/app/verfahren`, kein Zertifikat) |
| `vehicles` | Fahrzeug, Kennzeichen als Name, außer Betrieb, Eröffnungs-Kilometerstand |
| `places` | Stammorte Wohnung / erste Tätigkeitsstätte |
| `contacts` | Kund:in, Projekt, optionale Zettelruhe-Id |
| `trips` | Fahrt, offene Fahrt, Nutzungstyp, Lücke, Korrekturspur, Übernahme-Altbestand, Abrechnungsstatus |
| `reporting` | Iststand (`/app/iststand`, GET-Filter), Jahresnachweis PDF/CSV/JSON (`/app/jahresnachweis`), Kilometerpauschale-Parameter |

## Data model (sketch)

Firma-gebunden, wie Zettelruhe. **Kein** Steuer-Modus, SKR oder Nummernkreis an der Firma — das bleibt Zettelruhe.

```
firmen
  users  (via mitgliedschaften)
  fahrzeuge          1:n, stabile id, kennzeichen presentable
    stammorte        Wohnung + erste Tätigkeitsstätte je Firma (nicht je Fahrzeug)
    fahrten          je Fahrzeug, Kette über kilometerstand_start (int) /
                     kilometerstand_ende (Text, leer = offen — PB-Number ist nie leer);
                     uebernahme (bool) für gekennzeichneten Altbestand
      korrekturspuren
  kunden             lokal, optional zettelruhe_kontakt_id
    projekte         optional zettelruhe_projekt_id
```

**Fahrt (Pflichtkern):** `firma`, `fahrzeug`, `datum`, `kilometerstand_start`, `kilometerstand_ende` (leer solange offen), `nutzungstyp` (`betrieblich` \| `privat` \| `wohnung_taetigkeitsstaette`), `ziel`, `zweck` (Pflicht wenn betrieblich ohne Kund:in), optional `kunde` / `projekt`, `abrechnungsstatus`, `uebernahme` (gekennzeichneter Altbestand), Zeitstempel Anlage/Vervollständigung.

Eine offene Fahrt pro Fahrzeug. Speichern blockt, wenn `ende(n) ≠ start(n+1)`.

## Key interfaces

- App-Login: E-Mail/Passwort über PB, Session-Cookie `fahrtenruhe_session` (httpOnly, SameSite=lax, Secure nur bei HTTPS-`APP_URL`)
- PocketBase 0.39.10 (wie Zettelruhe)
- Iststand: GET `/app/iststand` (Jahr/Monat/Zeitraum/Kund:in). Eine Addition (`addiereIststand`); kein Forecast.
- Jahresnachweis: GET `/app/jahresnachweis` plus Downloads `/app/jahresnachweis/pdf|csv|json`. PDF je Fahrzeug *ist* das Buch (inklusive Korrekturspur). CSV/JSON: ganzes Buch und nur abrechenbare Fahrten.
- v1-Schnittstelle Zettelruhe: Datei-Export, keine Live-API
- PWA-light (ADR-0010): `/manifest.webmanifest`, Icons 192/512 + Apple-Touch 180 aus dem Auftraggeber-Logo (`public/brand/fahrtenruhe-mark.png`), `start_url` `/app`, `display: standalone`, Theme-Farbe hell (`#f4fbfc`). Kein Service Worker, kein GPS, kein App-Store-Client. Erfassung bleibt Form-POST über Next. UI-Default ist Hell (nicht System-Dark); Dark nur nach bewusstem Toggle.
- Übernahme-Altbestand light (ADR-0018): `/app/fahrten/uebernahme` — geschlossene, gekennzeichnete Fahrt mit Korrekturspur. Kein Excel-Rekonstrukteur, keine stille Lückenfüllung.
- Verfahrensdoku (ADR-0016): Vorlage `docs/verfahrensdokumentation.md`, UI `/app/verfahren`. Kein Zertifikat.
- PB-Admin `/_/` nur Betrieb; Superuser ≠ App-Login

## Open architectural questions

Keine Domain-Fragen. Cookie-Name und PB-Version sind im Fundament gesetzt, ohne überraschenden Trade-off (kein neues ADR).
