# Overview — Fahrtenruhe

_Created: 2026-08-19_

## Goal

Ein ordnungsgemäßes elektronisches Fahrtenbuch je Fahrzeug führen: lückenlos, zeitnah, mit sichtbarer Korrekturspur. Am Jahresende die Quote betrieblich vs. privat liefern, damit die Nutzer:in Vermögenszuordnung und Kilometerpauschale entscheiden kann. Betriebliche Fahrten so markieren, dass Zettelruhe sie abrechnen kann.

## Non-goals (v1)

- Rechnung, Beleg, EÜR, 1-%-Regelung, Entfernungspauschale, AfA
- Fuhrpark, Pool, mehrere Fahrer:innen
- Live-API oder gemeinsames PocketBase mit Zettelruhe
- Native App-Store-Clients, GPS-Pflicht
- Familienheimfahrt als Typ, abweichendes Wirtschaftsjahr
- Steuerberatung oder automatische Vermögenszuordnung

## Success criteria

- Ein Fahrzeug, ein Kalenderjahr, geschlossene Kilometerkette, PDF mit Korrekturspur
- Iststand jederzeit (Jahr / Monat / Kund:in)
- Export abrechenbarer Fahrten, den Zettelruhe später schlucken kann
- `docker compose up` wie Zettelruhe

## Stakeholders / context

Solo-Selbstständige:r (Einzelunternehmen, EÜR, eigene gemischt genutzte Kfz) — dieselbe Persona wie Zettelruhe. Erstnutzer:in ist kf.

## Related projects

- [Zettelruhe](https://github.com/krisauseu/zettelruhe) — Buchhaltung; besitzt die heutige Abrechnungs-**Fahrt**
- Quellen: [`quellen-fahrtenbuch.md`](./quellen-fahrtenbuch.md)
