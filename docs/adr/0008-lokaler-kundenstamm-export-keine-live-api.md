# Lokaler Kund:innenstamm, Schnittstelle ist Export

Kund:in und Projekt leben als dünner lokaler Stamm in Fahrtenruhe (Name, optionale Zettelruhe-Id). v1 verbindet die Apps über einen Export abrechenbarer betrieblicher Fahrten (CSV/JSON), nicht über Live-API und nicht über ein gemeinsames PocketBase. Begründung: Zettelruhe hat keine Kundennummer, nur Namen und Record-Ids. Live-Sync würde ADR-0001 (eigene Instanz) aufheben und zwei Release-Züge koppeln, bevor das Buch trägt. Freitext ohne Stamm erzeugt Tippfehler genau in der Zeile, die später zur Rechnung wird.

## Alternatives considered

- **Kein Stamm, nur Freitext+Ids:** zu fehleranfällig für die Abrechnung.
- **Live-API oder gemeinsames PocketBase ab Tag 1:** widerspricht der Produktgrenze.
