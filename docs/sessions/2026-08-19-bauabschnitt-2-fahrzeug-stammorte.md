# Session 2026-08-19 — bauabschnitt-2-fahrzeug-stammorte

## Done

- PocketBase-Migration `fahrzeuge` (firma, kennzeichen presentable, `eroeffnungs_kilometerstand` onlyInt, `ausser_betrieb`, optionales `inbetriebnahme_am`) und `stammorte` (firma, art Wohnung | erste Tätigkeitsstätte, Bezeichnung, Anschrift). Unique (firma, art). Client create/update/delete = null. Keine Collection `fahrten`.
- Modul `vehicles`: ganzzahliger Kilometerstand (Nachkommastellen ablehnen, nicht runden), Kennzeichenwechsel ohne id-Bruch, außer Betrieb statt Löschen, Form-POST unter `/app/fahrzeuge`
- Modul `places`: Stammorte an der Firma; höchstens eine Wohnung und eine erste Tätigkeitsstätte; gleiche Anschriften speicherbar (`stammorteSindGleich` für BA3)
- App-Shell: Firma + Kennzeichen, Nav Fahrtenbuch/Fahrzeuge/Stammorte; ohne Fahrzeug leerer Zustand mit Anlegen-Weg, kein Tachofeld
- Buchjahr-Hinweis light (ADR-0018): angebrochenes Kalenderjahr ohne Kette = nicht nachweistauglich; Inbetriebnahme vs. 1. Januar
- Tests: 58, `cd app && npm test` grün. Form-POST/curl E2E (Anlegen, Kennzeichenwechsel, außer Betrieb, identische Stammorte, Client-Writes 403, `/app/fahrten/neu` 404)

## Open / Blocked

- Workspace-Ordner heißt weiter `reiseruhe`
- Kein Browser-MCP gegen localhost; UI per Form-POST/curl verifiziert
- Volume `fahrtenruhe_pb_data` hat Firma **Beispiel UG** plus aus dem E2E: Fahrzeug `B-CD 5678` (Eröffnungs-Kilometerstand 42100, Inbetriebnahme 2026-03-15) und Stammorte Wohnung/Büro beide Musterweg 1, 10115 Berlin

## Next step

Bauabschnitt 3: Fahrt (Live-Start/Ende, Nutzungstyp, Lücken-Block, Vervollständigung, Korrekturspur, offene Fahrt).

## Context snapshot

- Writes auf Fahrzeug und Stammort nur Next/Superuser. App-Login `alex@example.de` (Eigentümer:in), nicht der PB-Superuser.
- Form-Submits klassisch POST hinter Caddy (`/app/fahrzeuge/neu/submit`, `/app/fahrzeuge/[id]/submit`, `/app/fahrzeuge/[id]/ausser-betrieb`, `/app/stammorte/submit`) — gleiches Muster wie Setup/Login.
- `gleich` der Stammorte wird aus den gespeicherten Anschriften gelesen (`getStammorteStand`), nicht als extra Collection-Feld.
- Zettelruhes Collection `fahrten` und das travel-Modul nicht übernommen.

## Übergabeprompt für den nächsten Chat

Siehe [`2026-08-19-uebergabe-bauabschnitt-3.md`](./2026-08-19-uebergabe-bauabschnitt-3.md).
