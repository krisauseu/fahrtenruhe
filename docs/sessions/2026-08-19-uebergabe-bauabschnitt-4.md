# Übergabe — Bauabschnitt 4 (Kund:in/Projekt)

Paste-ready Prompt für den nächsten Chat. Domain nicht neu grillen.

---

Du arbeitest in `/Users/kf/reiseruhe` am Produkt **Fahrtenruhe** (nicht Reiseruhe). Lies zuerst `AGENTS.md`, `CONTEXT.md`, `docs/90-status.md`, `docs/10-plan.md`, `docs/20-architecture.md` und ADR-0008, 0012, 0013. ADRs 0001–0022 sind geschlossen. BA1–BA3 sind erledigt.

## Auftrag

**Bauabschnitt 4 — Kund:in/Projekt dünn, Abrechnungsstatus, Zettelruhe-Ids.** Lokaler Stamm, keine Live-API, kein gemeinsames PocketBase mit Zettelruhe. Kein Iststand, kein PDF.

Konkret, in dieser Reihenfolge, und erst BA4 für erledigt erklären, wenn alles unten wahr ist:

1. PocketBase-Migration (Git, auto beim Compose-Start): Collection `kunden` (firma, name, optionale `zettelruhe_kontakt_id`). Collection `projekte` (firma, kunde, name, optionale `zettelruhe_projekt_id`). Client create/update/delete = null. Next schreibt mit Superuser. Kein Live-Sync.
2. Modul `contacts`: Invarianten + Repository + Form-UI. Kund:in ist lokal und dünn. Projekt hängt an der:m Kund:in. Zettelruhe-Ids sind optional und nur Merker.
3. Fahrt (bestehendes Modul `trips`): optionale Kund:in/Projekt an der betrieblichen Fahrt. Betrieblich ohne Kund:in: Zweck bleibt Pflicht (ADR-0012). Privat und Wohnung–Tätigkeitsstätte tragen keine Kund:in.
4. Abrechnungsstatus: `abrechenbar` | `nicht_abrechenbar` | `abgerechnet` (ADR-0013). Default abrechenbar nur mit gesetzter Kund:in. v1 setzt nicht selbst auf abgerechnet.
5. App-Shell: deutschsprachige Routen (`/app/kunden`, ggf. Projekte darunter). Keine Zettelruhe-Live-Suche.
6. Tests: Kund:in ohne Pflicht an der Fahrt, Zweck-Pflicht ohne Kund:in, Default-Abrechnungsstatus, Client-Writes gesperrt, `cd app && npm test` grün. UI per Form-POST/curl oder Browser.
7. Session-Log unter `docs/sessions/` und `docs/90-status.md` auf BA4-Stand. README nur anfassen, wenn der Schnellstart sonst lügt.

Auth/Session/Setup/Fahrzeug/Stammorte/Fahrt-Invarianten nicht neu bauen.

## Fertig, wenn

- `docker compose up --build` bootet weiter ohne Handarbeit am PB-Admin
- Kund:in anlegen und optional an betriebliche Fahrt hängen
- Betriebliche Fahrt ohne Kund:in weiter möglich, Zweck Pflicht
- Abrechnungsstatus sichtbar und defaultet wie ADR-0013
- PB-Client darf `kunden` / `projekte` nicht schreiben
- `cd app && npm test` grün
- Kein Iststand, kein PDF, keine Live-API, keine 1-%-Felder

## Nicht tun

- Domain neu verhandeln
- Zettelruhes Collection `fahrten` oder travel-Modul übernehmen
- Live-Sync / gemeinsames PocketBase mit Zettelruhe
- Iststand, PDF/CSV, PWA, Übernahme-Assistent
- Fuhrpark/Pool, mehrere Fahrer:innen, GPS
- Rechnungen, Belege, Journal, SMTP, Jobs
- Workspace-Ordner umbenennen, wenn das die Session zerlegt

## Invarianten, die BA4 schon tragen muss

- Writes aufs Buch und den Stamm nur Next
- Eine offene Fahrt je Fahrzeug; Kilometerkette ohne stille Lücken; ganze Kilometer
- Gleicher Kalendertag (Europe/Berlin); danach nur Korrekturspur
- UI de-DE, Begriffe aus CONTEXT.md (Kund:in, Projekt, Abrechnungsstatus, abrechenbar, nicht abrechenbar, abgerechnet)
- Prosa DE, Module EN, Fachfelder DE

Quellen für Muster: BA3 in diesem Repo (`app/src/modules/trips/`, Form-POST hinter Caddy). Operational aus `/Users/kf/zettelruhe` (Kontakte, nicht travel).

Hinweis: Das lokale Volume `fahrtenruhe_pb_data` enthält Firma **Beispiel UG**, Fahrzeug `B-CD 5678` (Eröffnung 42100, Inbetriebnahme 2026-03-15), Stammorte Wohnung + Büro mit derselben Anschrift, und aus BA3 zwei geschlossene Fahrten (nächster Start 42180). Login der Eigentümer:in: `alex@example.de` / `sicheres-passwort` (nicht der PB-Superuser). Für eine leere Instanz: `docker compose down -v && docker compose up --build`.
