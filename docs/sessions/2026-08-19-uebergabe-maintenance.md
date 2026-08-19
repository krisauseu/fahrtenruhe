# Übergabe — Maintenance (nach BA9 + Stabilisieren)

Paste-ready Prompt für den nächsten Chat. Domain nicht neu grillen.

---

Du arbeitest in `/Users/kf/reiseruhe` am Produkt **Fahrtenruhe** (nicht Reiseruhe). Lies zuerst `AGENTS.md`, `CONTEXT.md`, `docs/90-status.md`, `docs/10-plan.md`. ADRs 0001–0022 sind geschlossen. BA1–BA9 und das Stabilisieren sind erledigt — v1 vollständig.

## Auftrag

Maintenance. Kein neuer Bauabschnitt, keine Domain-Öffnung, kein Zertifikat, kein voller Übernahme-Assistent.

## Nicht tun

- Domain neu verhandeln
- Vollen Übernahme-Assistenten / GPS / App Store
- Fuhrpark/Pool, mehrere Fahrer:innen
- Rechnungen, Belege, Journal, SMTP, Jobs
- Live-API nach Zettelruhe
- Workspace-Ordner umbenennen, wenn das die Session zerlegt

## Hinweis zum lokalen Volume

Firma **Beispiel UG**. Fahrzeug `B-CD 5678` (Eröffnung 42100, Inbetriebnahme 2026-03-15): Iststand 2026 = 220 km betrieblich, 40 km privat, 260 km gesamt, Quote 84,6 %, Band notwendiges Betriebsvermögen, Pauschale 66,00 €. Nicht nachweistauglich. Nächster Start: 42360. Zweites Fahrzeug `B-UE 8000` (Eröffnung 10000, Inbetriebnahme 2026-03-15): eine Übernahme 10000–10040 privat am 15.3., nachweistauglich. PWA: `/manifest.webmanifest`, Erfassung `/app`, Verfahren `/app/verfahren`, Übernahme `/app/fahrten/uebernahme`. Login der Eigentümer:in: `alex@example.de` / `sicheres-passwort` (nicht der PB-Superuser). UI-Default ist Hell; Dark nur per Toggle. Logo: `/brand/fahrtenruhe-mark.png`. Für eine leere Instanz: `docker compose down -v && docker compose up --build`.
