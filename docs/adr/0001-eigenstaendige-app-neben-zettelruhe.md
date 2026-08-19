# Eigenständige App neben Zettelruhe

Fahrtenruhe ist ein eigenes Repo und eine eigene Instanz, nicht ein Modul von Zettelruhe und nicht eine Aufblähung der bestehenden Collection `fahrten`. Begründung: Zettelruhes **Fahrt** ist eine Abrechnungszeile (Kund:in Pflicht, weich bis zur Rechnung, kein Fahrzeug, kein Kilometerstand). Das Fahrtenbuch braucht die gegenteiligen Invarianten (alle Fahrten inkl. privat, je Fahrzeug, lückenlose Kilometerstände, sichtbare Korrekturspur). Eine gemeinsame Entität würde eines der beiden Bücher zerstören. Abrechnung bleibt in Zettelruhe; die Verbindung ist später eine schmale Projektion betrieblicher Fahrten, kein gemeinsames PocketBase.

## Alternatives considered

- **Modul in Zettelruhe** mit zweiter Entität neben `fahrten`: seriös, spart Betriebsaufwand, koppelt aber GoBD-Härte an die Buchhaltungs-Release-Züge.
- **Bestehende `fahrten`-Collection erweitern**: verworfen — bricht „Kund:in Pflicht“ und vermischt Buch und Rechnung.
