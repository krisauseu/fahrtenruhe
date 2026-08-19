# Übergabe — Bauabschnitt 8 (Härten)

Paste-ready Prompt für den nächsten Chat. Domain nicht neu grillen.

---

Du arbeitest in `/Users/kf/reiseruhe` am Produkt **Fahrtenruhe** (nicht Reiseruhe). Lies zuerst `AGENTS.md`, `CONTEXT.md`, `docs/90-status.md`, `docs/10-plan.md`, `docs/20-architecture.md` und ADR-0016, 0018, 0004, 0014. ADRs 0001–0022 sind geschlossen. BA1–BA7 sind erledigt.

## Auftrag

**Bauabschnitt 8 — Härten: Verfahrensdoku-Vorlage, Tests, Übernahme-Altbestand light.** Letzter Bauabschnitt von v1. Kein Zertifikat, kein voller Import-Assistent, keine Domain-Öffnung. Die Vorlage erklärt, wie das Buch geführt wird (zeitnah, Korrekturspur sichtbar, PDF *ist* das Buch). Übernahme-Altbestand bleibt gekennzeichnet und mit Korrekturspur — ohne lückenlose Kette ab 1. Januar bzw. Inbetriebnahme bleibt das Buchjahr nicht nachweistauglich.

Konkret, in dieser Reihenfolge, und erst BA8 für erledigt erklären, wenn alles unten wahr ist:

1. Verfahrensdokumentations-Vorlage (ADR-0016): ausfüllbare Vorlage im Repo, kein bezahltes GoBD-Zertifikat. Sie beschreibt das Verfahren (Fahrtenbuch je Fahrzeug, Korrekturspur, PDF als Buch), nicht die Zahlen eines Jahres.
2. Übernahme-Altbestand light (ADR-0018): gekennzeichnete Übernahme mit sichtbarer Korrekturspur. Kein stiller Import, kein Excel-Rekonstrukteur, kein Assistent, der Lücken privat füllt. Ohne lückenlose Kette bleibt die UI bei nicht nachweistauglich.
3. Tests härten, was BA8 wirklich ändert, plus Regression der Invarianten; `cd app && npm test` grün.
4. Session-Log unter `docs/sessions/` und `docs/90-status.md` auf BA8-Stand. README nur anfassen, wenn der Schnellstart sonst lügt.

Auth/Session/Setup/Fahrzeug/Stammorte/Fahrt-Invarianten/Kund:in/Iststand/Jahresnachweis-PDF/PWA nicht neu bauen.

## Fertig, wenn

- Eine Verfahrensdoku-Vorlage liegt im Repo (kein Zertifikat)
- Übernahme-Altbestand ist gekennzeichnet und hinterlässt Korrekturspur
- Nicht nachweistauglich bleibt die ehrliche Aussage bei Lücken ab 1.1./Inbetriebnahme
- `cd app && npm test` grün
- `docker compose up --build` bootet weiter ohne Handarbeit am PB-Admin

## Nicht tun

- Domain neu verhandeln
- Vollen Übernahme-Assistenten / GPS / App Store
- Fuhrpark/Pool, mehrere Fahrer:innen
- Rechnungen, Belege, Journal, SMTP, Jobs
- Live-API nach Zettelruhe
- Workspace-Ordner umbenennen, wenn das die Session zerlegt

## Invarianten, die BA8 schon tragen muss

- Writes aufs Buch und den Stamm nur Next
- Eine offene Fahrt je Fahrzeug; Kilometerkette ohne stille Lücken; ganze Kilometer
- PDF enthält die Korrekturspur; stille Überschreibung gibt es nicht
- UI de-DE, Begriffe aus CONTEXT.md
- Prosa DE, Module EN, Fachfelder DE

Quellen für Muster: Buch/Korrekturspur in diesem Repo (`app/src/modules/trips`, Jahresnachweis-PDF). Verfahrensdoku-Vorlage operational aus `/Users/kf/zettelruhe` (`docs/verfahrensdokumentation.md`) — Inhalt an Fahrtenruhe anpassen, nicht Buchhaltung kopieren. Nicht Zettelruhes `fahrten` / travel.

Hinweis: Das lokale Volume `fahrtenruhe_pb_data` enthält Firma **Beispiel UG**, Fahrzeug `B-CD 5678` (Eröffnung 42100, Inbetriebnahme 2026-03-15), Stammorte Wohnung + Büro mit derselben Anschrift, Kund:in **Müller GmbH** mit Projekt **Dachausbau**. Iststand 2026: 220 km betrieblich, 40 km privat, 260 km gesamt, Quote 84,6 %, Band notwendiges Betriebsvermögen, Pauschale 66,00 €. Nicht nachweistauglich. Nächster Start: 42360. PWA: `/manifest.webmanifest`, Erfassung `/app`. Login der Eigentümer:in: `alex@example.de` / `sicheres-passwort` (nicht der PB-Superuser). Für eine leere Instanz: `docker compose down -v && docker compose up --build`.
