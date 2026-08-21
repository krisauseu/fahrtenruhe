# Kontaktnummer ist der Datei-Join, Inbound-CSV der Kund:innenstamm

Kund:in und Projekt bleiben ein dünner lokaler Stamm (ADR-0008). Der optionale Merker ist die **Zettelruhe-Kontaktnummer**, nicht die PocketBase-Record-Id. Namen kommen per Zettelruhe-Kontakte-CSV nach Fahrtenruhe (nur Kund:innen, Upsert über die Nummer). v1 verbindet die Apps weiter über Dateien, nicht über Live-API und nicht über ein gemeinsames PocketBase. Begründung: Zettelruhe vergibt jetzt eine Kontaktnummer je Kontakt (eindeutig je Firma). Die Record-Id steht nicht im CSV-Export, ist aus der URL zu kopieren und überlebt eine Neuaufsetzung nicht. Namen allein matchen Tippfehler und Doppel-Namen nicht. ADR-0008 bleibt in der Produktgrenze (Datei, kein Live-Sync); nur die Begründung „Zettelruhe hat keine Kundennummer“ ist überholt.

## Alternatives considered

- **Weiter PocketBase-Id als Merker:** nicht im CSV, als Alltagsfeld unbrauchbar.
- **Nur Namen matchen:** Tippfehler, Umbenennung, zwei gleiche Namen.
- **Live-API oder gemeinsames PocketBase:** widerspricht ADR-0001 und ADR-0008.
