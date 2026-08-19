# Session 2026-08-19 — bauabschnitt-6-jahresnachweis

## Done

- Jahresnachweis unter `/app/jahresnachweis`: PDF je Fahrzeug *ist* das Buch (fortlaufende Fahrten, Kilometerkette, Nutzungstyp, Ziel, Zweck, Kund:in, Korrekturspur im selben Dokument). Offenes / nicht lückenloses Buchjahr bleibt nicht nachweistauglich.
- CSV/JSON des ganzen Buchs und zusätzlich nur der abrechenbaren Fahrten (geschlossene Fahrten mit Status abrechenbar). Datei-Export, keine Live-API. Semikolon, UTF-8 mit BOM beim CSV.
- Dieselbe Addition wie der Iststand: `baueJahresnachweis` ruft `addiereIststand` (km je Nutzungstyp, Quote, Band, Kilometerpauschale). Keine Hochrechnung, keine 1-%, keine Entfernungspauschale.
- UI de-DE, Nav + Links von Startseite und Iststand. Iststand bleibt die jederzeit sichtbare Addition.
- `@react-pdf/renderer` nur für das Buch-PDF; Writes unverändert nur Next.
- Tests: 142, `cd app && npm test` grün. PDF enthält Korrekturspur; CSV der abrechenbaren Fahrten ohne privat/offen; Addition unverändert.
- `docker compose up --build` neu gebaut (Next inkl. `@react-pdf/renderer`); PocketBase-Image cached, kein PB-Admin. Curl: Login, `/app/jahresnachweis` 200, PDF `%PDF-` mit Korrekturspur/nicht nachweistauglich/220/40/260, CSV/JSON Buch und abrechenbar, Iststand unverändert 220 km / 66,00 €.

## Next step

Bauabschnitt 7: PWA, mobile Erfassung.

## Context snapshot

- Addition: `app/src/modules/reporting/iststand.ts`. Jahresnachweis: `app/src/modules/reporting/jahresnachweis.ts`. PDF: `app/src/modules/reporting/pdf.tsx`. Seite: `/app/jahresnachweis`. Downloads: `/app/jahresnachweis/pdf|csv|json?fahrzeug=&jahr=&umfang=buch|abrechenbar`.
- Volume `fahrtenruhe_pb_data`, Fahrzeug `B-CD 5678`: Iststand 2026 = 220 km betrieblich, 40 km privat, 260 km gesamt, Jahresquote 84,6 %, Band notwendiges Betriebsvermögen, Kilometerpauschale 66,00 €. Nicht nachweistauglich (erste Fahrt 19.8., Inbetriebnahme 15.3.). Nächster erwarteter Start: 42360.
- App-Login `alex@example.de` (Eigentümer:in), nicht der PB-Superuser.

## Übergabeprompt für den nächsten Chat

Siehe [`2026-08-19-uebergabe-bauabschnitt-7.md`](./2026-08-19-uebergabe-bauabschnitt-7.md).
