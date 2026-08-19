# Session 2026-08-19 — bauabschnitt-7-pwa

## Done

- PWA-light analog Zettelruhe: Web-App-Manifest `/manifest.webmanifest`, Icons 192/512 plus Apple-Touch 180, `display: standalone`, `start_url: /app`, `lang: de`. Installierbar am Homescreen. Kein Service Worker, kein Offline-First, kein GPS, kein App-Store-Client.
- Mobile Erfassung auf `/app`: Start/Ende einer Fahrt auf schmalem Viewport (390px ohne seitlichen Überlauf). 44px/16px-Felder, volle Breite für Start/Ende, numerischer Kilometerstand, Safe-Area. Eine offene Fahrt je Fahrzeug; Lücken blocken; nach Mitternacht nur Korrekturspur. Schließen von `/app` bleibt auf `/app`.
- Buch, Iststand, Jahresnachweis unverändert; Writes weiter nur Next.
- Tests: 146, `cd app && npm test` grün. Manifest/Icons/kein GPS/kein SW; Start/Ende ohne GPS, ganze km; Invarianten unverändert.
- `docker compose up --build` neu gebaut (Next inkl. Manifest/Icons); PocketBase-Image cached, kein PB-Admin. Curl: Health 200, Manifest, PNG-Icons, Login, `/app` Startformular mit 42.360 km, Lücken-POST blockt, Iststand 220/40/260 km.

## Next step

Bauabschnitt 8: Härten (Verfahrensdoku-Vorlage, Tests, Übernahme-Altbestand light).

## Context snapshot

- PWA: `app/src/lib/pwa.ts`, `app/src/app/manifest.ts`, Icons `app/public/icon-192.png` / `icon-512.png`, Apple `app/src/app/apple-icon.png`.
- Erfassung: `/app` (`FahrtStartForm` / `FahrtEndeForm`), Writes `app/src/app/app/fahrten/start` und `.../[id]/ende`.
- Volume `fahrtenruhe_pb_data`, Fahrzeug `B-CD 5678`: Iststand 2026 = 220 km betrieblich, 40 km privat, 260 km gesamt, Jahresquote 84,6 %, Band notwendiges Betriebsvermögen, Kilometerpauschale 66,00 €. Nicht nachweistauglich (erste Fahrt 19.8., Inbetriebnahme 15.3.). Nächster erwarteter Start: 42360.
- App-Login `alex@example.de` (Eigentümer:in), nicht der PB-Superuser.

## Übergabeprompt für den nächsten Chat

Siehe [`2026-08-19-uebergabe-bauabschnitt-8.md`](./2026-08-19-uebergabe-bauabschnitt-8.md).
