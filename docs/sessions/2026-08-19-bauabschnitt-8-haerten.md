# Session 2026-08-19 — bauabschnitt-8-haerten

## Done

- Verfahrensdokumentations-Vorlage `docs/verfahrensdokumentation.md` (ADR-0016): ausfüllbar, beschreibt das Verfahren (Fahrtenbuch je Fahrzeug, zeitnah, Korrekturspur, PDF *ist* das Buch, gekennzeichnete Übernahme). Kein Zertifikat, keine Jahreszahlen. Kurz `docs/betrieb.md` für Backup/Restore des Volumes `fahrtenruhe_pb_data`. UI `/app/verfahren`.
- Übernahme-Altbestand light (ADR-0018): gekennzeichnete geschlossene Fahrt unter `/app/fahrten/uebernahme`, immer mit sichtbarer Korrekturspur (`nicht_im_buch` + Quelle). Hängt an die Kette (Eröffnung oder Ende der letzten Fahrt). Kein stiller Import, kein Excel-Rekonstrukteur, keine Lückenfüllung mit privat. Feld `fahrten.uebernahme`. Live-Start bleibt `uebernahme=false`.
- Nicht nachweistauglich bleibt die ehrliche Aussage, solange die Kette nicht ab 1. Januar bzw. Inbetriebnahme lückenlos ist. Eine Übernahme am Pflichtstart mit Eröffnung kann nachweistauglich werden — das täuscht die UI nicht vor.
- Tests: 161, `cd app && npm test` grün. Domain der Übernahme, Verfahrensdoku-Vorlage, PDF/CSV/JSON inkl. Marke und Korrekturspur, Regression der Invarianten.
- `docker compose up --build` neu gebaut (Next + PB-Migration `1730008000_uebernahme.js`); kein PB-Admin. Curl: Health 200, Login, `/app/verfahren`, Lücken-POST blockt, Nachkommastellen blockt, Übernahme auf neuem Fahrzeug `B-UE 8000` mit Korrekturspur, Demo-Iststand unverändert 220/40/260 und nicht nachweistauglich.

## Open / Blocked

- Workspace-Ordner heißt weiter `reiseruhe`
- Kein Browser-MCP gegen localhost; UI per Form-POST/curl verifiziert
- Zweites Fahrzeug `B-UE 8000` aus dem E2E im Volume (Eröffnung 10000, Inbetriebnahme 2026-03-15, eine Übernahme 10000–10040 privat am 15.3., nachweistauglich)

## Next step

Stabilisieren: Funktionstest analog Zettelruhe (kein neuer Bauabschnitt).

## Context snapshot

- Vorlage: `docs/verfahrensdokumentation.md`, Betrieb: `docs/betrieb.md`, UI: `/app/verfahren`.
- Übernahme: `uebernehmenFahrt` in `app/src/modules/trips/repository.ts`, Form `/app/fahrten/uebernahme`, Writes `/app/fahrten/uebernahme/submit`.
- Volume `fahrtenruhe_pb_data`: Firma **Beispiel UG**. Fahrzeug `B-CD 5678` unverändert (Eröffnung 42100, Inbetriebnahme 2026-03-15, Iststand 2026 = 220 km betrieblich, 40 km privat, 260 km gesamt, Quote 84,6 %, Pauschale 66,00 €, nicht nachweistauglich, nächster Start 42360). Zusätzlich `B-UE 8000` (nachweistauglich nach Übernahme).
- App-Login `alex@example.de` (Eigentümer:in), nicht der PB-Superuser.

## Übergabeprompt für den nächsten Chat

Siehe [`2026-08-19-uebergabe-stabilisieren.md`](./2026-08-19-uebergabe-stabilisieren.md).
