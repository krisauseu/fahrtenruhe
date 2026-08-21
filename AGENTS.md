# Fahrtenruhe — Agent notes

Open-source electronic mileage log (DE, EÜR, solo). Not Zettelruhe; billing stays there.

## Before any change

1. Read [`CONTEXT.md`](./CONTEXT.md) — product language. Use those terms; do not invent synonyms.
2. Read [`docs/90-status.md`](./docs/90-status.md) — what is already decided and what the current bauabschnitt is.
3. New hard trade-offs go in `docs/adr/NNNN-kebab.md` (next number). Do not silently reverse ADR-0001–0024.

Do not re-open the domain grill (Nutzungstyp, separate app, only-km, name). That is closed.

## Pointers

- **Glossary / scope:** [`CONTEXT.md`](./CONTEXT.md)
- **Why the shape is this way:** [`docs/adr/`](./docs/adr/)
- **Legal sources (not tax advice):** [`docs/quellen-fahrtenbuch.md`](./docs/quellen-fahrtenbuch.md)
- **Build order:** [`docs/10-plan.md`](./docs/10-plan.md)
- **Module map / schema sketch:** [`docs/20-architecture.md`](./docs/20-architecture.md)
- **Server (Host-Caddy):** [`docs/installation-server.md`](./docs/installation-server.md), Overlay `docker-compose.server.yml`
- **Twin to copy operationally:** `/Users/kf/zettelruhe` (Next 16, PocketBase, Caddy, Server Actions, session cookie). Copy patterns, not the `fahrten` collection.

## Invariants that code must enforce

- Writes to the book only via Next server (no client PocketBase SDK on trip collections).
- One open trip per vehicle; odometer chain has no silent gaps; integer km.
- Same-calendar-day completion; after midnight only a visible Korrekturspur.
- PDF of the book includes the Korrekturspur (the PDF *is* the book).
- UI de-DE; no forecast; an incomplete calendar year is labelled not nachweistauglich.

## Conventions

Prose/UI: German. Module folders: English (`trips`, `vehicles`, `places`, `contacts`, `reporting`, `platform`). Schema field names: German snake_case (`kilometerstand_start`, `nutzungstyp`).
