# Session 2026-08-21 — Kund:innen aus Zettelruhe (Kontaktnummer)

## Done

- ADR-0024: Zettelruhe-Kontaktnummer ist der Datei-Join. Kein Live-API, kein gemeinsames PocketBase (ADR-0001/0008 bleiben).
- PB-Migration `zettelruhe_kontaktnummer` (unique je Firma, wenn gesetzt). UI-Merker ist die Nummer, nicht die PocketBase-Id.
- CSV-Import `/app/kunden/import`: Zettelruhes Kontakte-CSV, nur Kund:innen (inkl. Doppelrolle), Upsert über die Nummer.
- Jahresnachweis-CSV/JSON: Spalte `zettelruhe_kontaktnummer`.
- CONTEXT.md, Architektur, Funktionstest, Verfahrensdoku. Tests 175 grün.

## Open / Blocked

- Host-Caddy-Reload und Funktionstest liegen bei kf.
- Fahrten-CSV-Import in Zettelruhe bleibt Parking-Lot (andere Codebasis).
- Lokales Compose hier nicht hochgefahren: Port 80/3000 hält Zettelruhe.

## Next step

Zettelruhe `/app/kontakte/export` → nach `docker compose up --build` in Fahrtenruhe `/app/kunden/import`. Dann Host-Caddy wie in `90-status.md`.
