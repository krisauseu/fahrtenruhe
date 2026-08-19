# Session 2026-08-19 — bauabschnitt-4-kundin-projekt

## Done

- PocketBase-Migration `kunden` (firma, name, optionale `zettelruhe_kontakt_id`) und `projekte` (firma, kunde, name, optionale `zettelruhe_projekt_id`). An `fahrten` optionale Relationen `kunde`/`projekt` plus Select `abrechnungsstatus`. Client create/update/delete = null. Kein Live-Sync.
- Modul `contacts`: dünner lokaler Stamm, Projekt hängt an der:m Kund:in, Zettelruhe-Ids nur Merker.
- Fahrt: optionale Kund:in/Projekt nur betrieblich. Betrieblich ohne Kund:in → Zweck Pflicht (ADR-0012). Privat und Wohnung–Tätigkeitsstätte tragen keine Kund:in.
- Abrechnungsstatus `abrechenbar` | `nicht_abrechenbar` | `abgerechnet`. Default abrechenbar nur mit gesetzter Kund:in. Kulanz: Kund:in bleibt, Status nicht abrechenbar. v1 setzt nicht selbst auf abgerechnet.
- App-Shell: `/app/kunden`, Projekte darunter. Keine Zettelruhe-Live-Suche.
- Tests: 108, `cd app && npm test` grün. Form-POST/curl E2E (Kund:in+Projekt anlegen, betrieblich ohne Kund:in mit Zweck, ohne Zweck blockt, mit Kund:in ohne Zweck, Default-Status, Kulanz, Client-Writes 403, `/fahrten/neu` und `/app/iststand` 404).

## Open / Blocked

- Workspace-Ordner heißt weiter `reiseruhe`
- Kein Browser-MCP gegen localhost; UI per Form-POST/curl verifiziert

## Next step

Bauabschnitt 5: Iststand (Jahr/Monat/Kund:in).

## Context snapshot

- Writes aufs Buch und den Stamm nur Next/Superuser. App-Login `alex@example.de` (Eigentümer:in), nicht der PB-Superuser.
- Form-Submits neu: `/app/kunden/neu/submit`, `/app/kunden/[id]/submit`, `/app/kunden/[id]/projekte/neu/submit`, `/app/kunden/[id]/projekte/[projektId]/submit`. Fahrt-Start/Vervollständigung/Korrektur nehmen optional `kunde`, `projekt`, `abrechnungsstatus`.
- Volume `fahrtenruhe_pb_data`: Firma **Beispiel UG**, Fahrzeug `B-CD 5678`. Aus dem E2E: Kund:in **Müller GmbH** (Zettelruhe-Kontakt-Id als Merker) mit Projekt **Dachausbau**; drei weitere geschlossene Fahrten (Bank ohne Kund:in / nicht abrechenbar; Baustelle mit Kund:in+Projekt / abrechenbar; Kulanzbesuch mit Kund:in / nicht abrechenbar). Nächster erwarteter Start: 42360.
- Kein Iststand, kein PDF, keine Live-API, keine 1-%-Felder.

## Übergabeprompt für den nächsten Chat

Siehe [`2026-08-19-uebergabe-bauabschnitt-5.md`](./2026-08-19-uebergabe-bauabschnitt-5.md).
