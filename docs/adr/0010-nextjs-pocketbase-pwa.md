# Next.js, PocketBase, PWA — gleicher Betriebsstack wie Zettelruhe

Die App ist Next.js (App Router, Server Actions) plus PocketBase (SQLite, Auth, Dateien) plus Caddy plus Docker Compose. Kritische Writes nur über den Next-Server, nicht per Client-SDK in Fahrtenbuch-Collections. Erfassung als responsive Web-PWA, kein App-Store-Client in v1. Begründung: Derselbe Alltag, derselbe Host, dasselbe Ein-Volume-Backup-Modell wie Zettelruhe. Eine zweite Betriebsform (Postgres, native Apps) sprengt Solo-v1 und macht die spätere schmale Schnittstelle teurer. GoBD-Härte (ADR-0004) braucht serverseitig erzwungene Invarianten, analog Zettelruhe ADR-0006.

## Alternatives considered

- **Native iOS/Android in v1:** unverhältnismäßig.
- **Desktop first, Mobil später:** widerspricht der Live-Erfassung.
- **Anderer Datenspeicher als PocketBase:** zwei Betriebsmodelle für dasselbe Leben.
