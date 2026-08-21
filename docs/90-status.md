# Status — Fahrtenruhe

_Last updated: 2026-08-21_

**Last session:** 2026-08-21 — Kund:innen-CSV aus Zettelruhe (Kontaktnummer als Join)

## Current phase

Bauabschnitt 9 erledigt. v1-Bauabschnitte 1–9 vollständig. Server-Betrieb analog Zettelruhe (Host-Caddy Overlay). Maintenance: Kontaktnummer-Join (ADR-0024). Nächster Schritt: Host-Caddy-Reload und Funktionstest durch kf.

## What's done

- ADR-0024: Zettelruhe-Kontaktnummer ist der Datei-Join. CSV-Import `/app/kunden/import` (Zettelruhes Kontakte-CSV, nur Kund:innen, Upsert über die Nummer). Formular-Merker ist die Nummer, nicht die PocketBase-Id. Jahresnachweis-CSV/JSON tragen `zettelruhe_kontaktnummer`.

- Host-Caddy Overlay: `docker-compose.server.yml`, Site-Block `deploy/Caddyfile.host` (Platzhalter `app.example.de`), Install [`docs/installation-server.md`](./installation-server.md), Funktionstest Desktop+PWA [`docs/funktionstest.md`](./funktionstest.md), ADR-0023. Compose-Projektname `fahrtenruhe` (Ordner darf noch `reiseruhe` heißen). Privates Repo `krisauseu/fahrtenruhe`.

- Bauabschnitt 9: helles Default-Theme (nicht System-Dark), Logo in UI und PWA, Kontrast/Typografie/Spacing auf den zentralen Screens; Dark-Toggle bewusst wählbar
- Stabilisieren: Happy Path gegen die Invarianten (Login, Fahrzeug/Stammorte, Live-Start-Formular, Lücken-Block, Iststand = Jahresnachweis-Addition, PDF *ist* das Buch inkl. Korrekturspur, gekennzeichnete Übernahme, nicht nachweistauglich bei Lücken, Verfahrensdoku ohne Zertifikats-Claim). Tests 175 grün. `docker compose up --build` ohne PB-Admin.
- Bauabschnitt 8: Verfahrensdoku-Vorlage (`docs/verfahrensdokumentation.md`, `/app/verfahren`, kein Zertifikat); Übernahme-Altbestand light (`/app/fahrten/uebernahme`, gekennzeichnet, Korrekturspur, keine Lückenfüllung)
- Bauabschnitt 7: PWA-light (Manifest, Icons 192/512, Apple-Touch, installierbar, `start_url` `/app`); mobile Erfassung Start/Ende auf schmalem Viewport; kein Service Worker, kein GPS, kein App-Store-Client
- Bauabschnitt 6: Jahresnachweis unter `/app/jahresnachweis`; PDF je Fahrzeug *ist* das Buch (Fahrten inklusive Korrekturspur); CSV/JSON des Buchs und der abrechenbaren Fahrten; dieselbe Addition wie der Iststand (`addiereIststand`); kein Forecast, keine Live-API
- Bauabschnitt 5: Modul reporting, Iststand unter `/app/iststand`; dieselbe Addition wie der Jahresnachweis (km je Nutzungstyp, Quote, Band, Kilometerpauschale 0,30 € ohne Wohnung–Tätigkeitsstätte); Filter Jahr/Monat/Zeitraum/Kund:in; kein Forecast
- Bauabschnitt 4: Collections `kunden` / `projekte` (Client-Writes null); Modul contacts; optionale Kund:in/Projekt an betrieblicher Fahrt; Abrechnungsstatus nach ADR-0013; Routen `/app/kunden` und Projekte darunter
- Bauabschnitt 3: Collections `fahrten` / `korrekturspuren` (Client-Writes null); Modul trips; Live-Start/Ende auf `/app`, Buch unter `/app/fahrten`; eine offene Fahrt; Lücken-Block; ganze km; Wohnung–Tätigkeitsstätte nur bei verschiedenen Stammorten; nach Mitternacht nur mit sichtbarer Korrekturspur
- Bauabschnitt 2: Collection `fahrzeuge` / `stammorte`; Modul vehicles + places; Routen `/app/fahrzeuge`, `/app/stammorte`; Buchjahr-Hinweis nicht nachweistauglich
- Bauabschnitt 1: Compose, Setup, Session, leere Shell
- Cookie `fahrtenruhe_session`, PB 0.39.10, Volume `fahrtenruhe_pb_data`; Superuser ≠ App-Login
- Domain-Grill, Name **Fahrtenruhe**, CONTEXT.md, ADR-0001–0024

## What's next

- Auf dem Host den Site-Block ersetzen (`/_next*` vor PocketBase, Admin nur `/_/*`, nicht `/_*`), Caddy reload, Setup im Browser prüfen. Dann Funktionstest nach [`docs/funktionstest.md`](./funktionstest.md). Optional: lokalen Ordner `reiseruhe` → `fahrtenruhe` umbenennen.

## Open decisions

keine Domain-Fragen. `kilometerstand_ende` ist Text (leer = offen), weil PocketBase-Number nie leer ist, sondern 0 (kein ADR). Zettelruhe-Kontaktnummer statt Record-Id als Merker (ADR-0024).

## Blockers

- keine

## Last session

2026-08-21 — Kund:innen aus Zettelruhe per Kontakte-CSV; Join über Kontaktnummer. ADR-0024. Log: [`sessions/2026-08-21-kunden-csv-kontaktnummer.md`](./sessions/2026-08-21-kunden-csv-kontaktnummer.md). Host-Caddy-Reload und Funktionstest bleiben bei kf.
