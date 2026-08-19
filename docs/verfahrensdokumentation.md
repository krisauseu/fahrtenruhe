# Verfahrensdokumentation (Vorlage) — Fahrtenruhe

_GoBD-Mindeststandard light (ADR-0016). Keine externe Zertifizierung,
kein bezahltes GoBD-Zertifikat. Anpassungen an den eigenen Betrieb sind
Pflicht der betreibenden Person._

Diese Vorlage beschreibt **das Verfahren**, nicht die Zahlen eines Buchjahrs.
Iststand und Jahresnachweis bleiben die Auswertung des Buchs.

## 1. Zweck und Geltungsbereich

Die Vorlage erklärt, wie in **Fahrtenruhe** (self-hosted) das elektronische
Fahrtenbuch einer Solo-Firma in Deutschland geführt wird. Sie ist der
Ausgangspunkt für die individuelle Verfahrensdokumentation.

| Punkt | Inhalt v1 |
|-------|-----------|
| System | Fahrtenruhe (Next.js + PocketBase/SQLite) |
| Gegenstand | Fahrtenbuch **je Fahrzeug** und Buchjahr (Kalenderjahr), nicht je Person und nicht als Sammelbuch der Firma |
| Nutzerkreis | Instanz-Eigentümer:in; Mitgliedschaft je Firma (Rolle Lesen im Schema, UX in v1 dünn) |
| Steuerziel | Nachweis der Jahresquote; Vorlage für die Vermögenszuordnung. Keine EÜR, keine Rechnung, keine 1-%-Berechnung, keine Entfernungspauschale |
| Standort Daten | Volume `fahrtenruhe_pb_data` (Docker Compose) bzw. konfigurierter PB-Datenpfad |

## 2. Verantwortlichkeiten

- **Instanz-Eigentümer:in**: Betrieb, Backup, Setup, weitere Firmen anlegen.
- **Eigentümer:in der Firma**: Fahrzeug, Stammorte, Kund:innen, inhaltliche Richtigkeit des Buchs.
- **Bearbeiten / Lesen**: Alltag schreiben bzw. nur sehen (Lesen im Schema für späteres Steuerberatungs-Lesen).
- **System**: Erzwingt Writes auf Buch und Stamm nur über Next, eine offene Fahrt je Fahrzeug, Kilometerkette ohne stille Lücken, ganze Kilometer, sichtbare Korrekturspur. Kein Client-SDK auf die Collections `fahrten` / `korrekturspuren`.

## 3. Verfahren (Überblick)

1. **Stammdaten**: Firma; Fahrzeug mit Kennzeichen, Eröffnungs-Kilometerstand und optionaler Inbetriebnahme; Stammorte Wohnung und erste Tätigkeitsstätte (dürfen zusammenfallen).
2. **Live-Erfassung**: Fahrt zeitnah anlegen (Start mit Kilometerstand, Ende mit Kilometerstand). Genau ein Nutzungstyp: betrieblich, privat oder Wohnung–Tätigkeitsstätte.
3. **Vervollständigung**: Zweck, Ziel und optionale Kund:in/Projekt am **selben Kalendertag** (Europe/Berlin) nachziehen.
4. **Nach Mitternacht**: nur noch mit sichtbarer **Korrekturspur** (wer, wann, vorher, nachher). Keine stille Überschreibung, kein Löschen, kein Storno.
5. **Übernahme-Altbestand**: gekennzeichnete geschlossene Fahrt aus Papier oder Datei, immer mit Korrekturspur. Kein stiller Import, kein Excel-Rekonstrukteur, keine automatische Lückenfüllung mit privat. Ohne lückenlose Kette ab dem 1. Januar bzw. der Inbetriebnahme bleibt das Buchjahr **nicht nachweistauglich**.
6. **Nachweis**: Das PDF je Fahrzeug *ist* das Buch (fortlaufende Fahrten inklusive Korrekturspur). Iststand jederzeit dieselbe Addition. CSV/JSON des Buchs und der abrechenbaren Fahrten — Datei-Export, keine Live-API nach Zettelruhe.

Perioden und steuerliche Tagesgrenzen: **Europe/Berlin** (Buchjahr = Kalenderjahr).

## 4. Unveränderbarkeit und Korrekturen

- Eine Fahrt wird korrigiert, nicht gelöscht und nicht storniert.
- Nach dem Kalendertag der Fahrt ist jede Änderung eine Korrekturspur im Buch selbst — sichtbar in der UI und im PDF.
- Die Kilometerkette blockt Lücken: Ende der vorigen Fahrt = Start der nächsten. Das Buch füllt fehlende Kilometer nicht von selbst.
- Übernahme bleibt als Übernahme gekennzeichnet; sie täuscht kein zeitnahes Live-Buch vor.

## 5. Nachweis und Export

| Export | Inhalt | Hinweis |
|--------|--------|---------|
| Iststand | km je Nutzungstyp, Jahresquote, Band der Vermögenszuordnung, Kilometerpauschale | Jederzeit; keine Hochrechnung |
| Jahresnachweis-PDF | Fahrtenbuch je Fahrzeug inklusive Korrekturspur | Das PDF *ist* das Buch für die Einsichtnahme (ADR-0014) |
| Buch CSV/JSON | Alle Fahrten des Buchjahrs plus Korrekturspur | Semikolon, UTF-8 BOM beim CSV |
| Abrechenbare Fahrten CSV/JSON | Geschlossene betriebliche Fahrten mit Status abrechenbar | Datei-Export nach Zettelruhe, keine Live-API |

Ein angebrochenes Buchjahr ohne lückenlose Kette ab Pflichtstart (1. Januar oder Inbetriebnahme) wird in UI und PDF als **nicht nachweistauglich** geführt.

## 6. Datensicherung

Konkrete Befehle und Restore: [`docs/betrieb.md`](./betrieb.md).

| Punkt | Vorgabe v1 / Vorlage |
|-------|----------------------|
| Was | Volume `fahrtenruhe_pb_data` (SQLite + Dateien); plus `.env` separat |
| Wann | Täglich empfohlen; vor Updates extra |
| Wo | _[Aufbewahrungsort hier eintragen]_ |
| Prüfung | Restore mindestens jährlich testen und hier datieren: _[ ]_ |

Wiederherstellung nur aus geprüften Backups; nach Restore Login und Stichprobe Fahrzeug/Fahrt/Korrekturspur.

## 7. Zugriffs- und Betriebssicherheit

- Authentifizierung über PocketBase-Nutzer; Next.js Session (httpOnly Cookie `fahrtenruhe_session`, `SameSite=Lax`).
- Writes aufs Buch und den Stamm nur serverseitig über Next.
- Superuser-Zugangsdaten und `SESSION_SECRET` nur in `.env` / Host-Secret — nicht im Git.
- Production: HTTPS, keine Default-Secrets. PocketBase-Admin `/_/` ist Betrieb; Superuser ist nicht das App-Login der Eigentümer:in.
- Details: [`docs/betrieb.md`](./betrieb.md).

## 8. Individuell zu ergänzen

- [ ] Konkreter Backup-Rhythmus und Aufbewahrungsort
- [ ] Letzter erfolgreicher Restore-Test (Datum)
- [ ] Verantwortliche Person / Vertretung
- [ ] Hardware-/Hosting-Standort
- [ ] Ablage des Papier-Altbestands außerhalb des Systems (falls vorhanden)
- [ ] Steuerberater-Übergabeprozess (PDF des Buchs / Zeitraum)

---

_Stand Vorlage: Bauabschnitt 8 (Härten). Bei Software-Updates Prozessänderungen nachziehen. Diese Datei ist eine Vorlage, kein Zertifikat._
