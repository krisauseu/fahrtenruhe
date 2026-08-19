# Funktionstest — Fahrtenruhe v1

Kurze Checkliste für die **öffentliche Server-Instanz**: Desktop-Browser **und** PWA auf dem Handy. Ableitung: Invarianten in `CONTEXT.md` / ADR-0001–0023, Betrieb [`betrieb.md`](./betrieb.md), Installation [`installation-server.md`](./installation-server.md).

Kein Zertifikats-Claim, keine Live-API, kein GPS, kein App Store.

| Feld | Eintrag |
|------|---------|
| Instanz / Host | `https://` … (Platzhalter war `app.example.de`) |
| `APP_URL` | dieselbe URL, ohne Slash |
| Datum | |
| Tester:in | |
| Gerät Desktop | Browser / Viewport |
| Gerät mobil | OS / Browser; PWA installiert? |
| Ergebnis gesamt | ☐ bestanden · ☐ bestanden mit Mängeln · ☐ nicht bestanden |

**Legende:** `[ ]` offen · `[x]` ok · `[~]` ok mit Hinweis · `[!]` Fehler (kurz notieren)

Zwei Geräte, dieselbe Instanz. Desktop trägt den Buch-Nachweis; das Handy die Live-Erfassung als PWA. Nicht vermischen: ein Fehler auf einem Gerät gilt als Mangel.

---

## 0. Vorbereitung (Server)

- [ ] Overlay: `docker compose -f docker-compose.yml -f docker-compose.server.yml ps` — next + pocketbase **healthy**, **kein** Compose-Caddy
- [ ] `APP_URL` = öffentliche HTTPS-URL ohne trailing slash; Next **neu gebaut**
- [ ] `curl -sSI "$APP_URL/health"` → 200, Zertifikat ohne Ausnahme, `"service":"fahrtenruhe"`, `"ok":true`
- [ ] `curl -sSI "$APP_URL/app"` → 307 `/login`
- [ ] Secrets: keine `change-me`-Werte; Superuser ≠ App-Login
- [ ] Browser über den öffentlichen Host, nicht `http://127.0.0.1:3001`

**Bestehendes Test-Volume (optional).** Firma **Beispiel UG**. Login `alex@example.de` / `sicheres-passwort` (nicht der PB-Superuser). Fahrzeug `B-CD 5678` (Eröffnung 42100, Inbetriebnahme 2026-03-15): Iststand 2026 = 220 km betrieblich, 40 km privat, 260 km gesamt, Quote 84,6 %, Band notwendiges Betriebsvermögen, Pauschale 66,00 €, **nicht nachweistauglich**, nächster Start 42360. Fahrzeug `B-UE 8000` (Eröffnung 10000, Inbetriebnahme 2026-03-15): eine Übernahme 10000–10040 privat am 15.3., **nachweistauglich**.

**Leere Instanz:** Setup unter `/setup` (Eigentümer:in + Firma), dann die Abschnitte 2–6 mit eigenen Kilometerständen. Wipe: Overlay `down -v`, danach `up -d --build`.

---

## 1. Desktop — Fundament

- [ ] `/setup` nur auf leerer Instanz; danach Redirect `/app`
- [ ] Falsches Passwort → de-DE-Fehler, keine Session
- [ ] Login Eigentümer:in → Cookie `fahrtenruhe_session`, Flag **Secure**, **HttpOnly**
- [ ] PB-Superuser unter `/_/` funktioniert und **ist kein** App-Login
- [ ] Ohne Cookie: `/app`, `/app/fahrten`, `/app/iststand` → `/login`
- [ ] Abmelden → Cookie weg; Shell mit Logo, Nav de-DE, Default **hell** (Dark nur nach Toggle)

---

## 2. Desktop — Stammdaten

- [ ] Stammorte `/app/stammorte`: Wohnung und erste Tätigkeitsstätte (dürfen zusammenfallen)
- [ ] Fällt die Anschrift zusammen: Nutzungstyp Wohnung–Tätigkeitsstätte **nicht** im Start-Formular
- [ ] Fahrzeug anlegen (Kennzeichen, Eröffnungs-Kilometerstand, Inbetriebnahme); Liste `/app/fahrzeuge`
- [ ] Kund:in optional `/app/kunden`; betriebliche Fahrt ohne Kund:in braucht einen konkreten Zweck
- [ ] Buchjahr-Banner **Nicht nachweistauglich**, solange die Kette ab Pflichtstart nicht lückenlos ist

---

## 3. Desktop — Fahrtenbuch

Erfassung `/app`. Buch `/app/fahrten`.

- [ ] Live-Start: Kilometerstand = erwarteter Start (Eröffnung bzw. Ende der vorigen Fahrt), ein Nutzungstyp, ganze km
- [ ] Falscher Start-Kilometerstand (Lücke) → Speichern **blockiert**, Text zur Lücke, Buch füllt nicht still mit privat
- [ ] Zehntelkilometer / Komma abgelehnt (ganze km)
- [ ] Zweiter Start am selben Fahrzeug, solange eine Fahrt offen ist → abgelehnt
- [ ] Live-Ende: End-Kilometerstand ≥ Start; Fahrt geschlossen, nächster Start = dieses Ende
- [ ] Vervollständigung Zweck/Ziel/Kund:in **am selben Kalendertag** (Europe/Berlin)
- [ ] Nach Mitternacht: Änderung nur über Korrekturspur (wer, wann, vorher, nachher) — keine stille Überschreibung
- [ ] Korrekturspur in der Fahrt-Detailansicht sichtbar

---

## 4. Desktop — Nachweis

- [ ] Iststand `/app/iststand`: km je Nutzungstyp, Quote, Band, Kilometerpauschale 0,30 € **ohne** Wohnung–Tätigkeitsstätte; **kein** Forecast
- [ ] Jahresnachweis `/app/jahresnachweis`: **dieselbe Addition** wie der Iststand (gleiche Zahlen)
- [ ] PDF je Fahrzeug **ist das Buch**: fortlaufende Fahrten **inklusive Korrekturspur**
- [ ] CSV und JSON: ganzes Buch und abrechenbare Fahrten
- [ ] Filter Jahr/Monat/Zeitraum/Kund:in ändern die sichtbare Addition, nicht eine zweite Wahrheit

Mit Test-Volume `B-CD 5678` / 2026: 220 / 40 / 260 km, 84,6 %, notwendiges Betriebsvermögen, 66,00 €, nicht nachweistauglich. `B-UE 8000`: nachweistauglich.

---

## 5. Desktop — Übernahme und Verfahren

- [ ] `/app/fahrten/uebernahme`: geschlossene Fahrt, gekennzeichnet **Übernahme**, Korrekturspur; **keine** Lückenfüllung
- [ ] Nach lückenloser Kette ab Inbetriebnahme (bzw. 1. Januar): Banner **Nicht nachweistauglich** weg
- [ ] Ohne lückenlose Kette bleibt das Buchjahr ehrlich nicht nachweistauglich
- [ ] `/app/verfahren`: Vorlage, Satz **kein GoBD-Zertifikat**; beschreibt das Verfahren, nicht die Jahreszahlen

---

## 6. PWA auf dem Handy

HTTPS ist Pflicht (außer localhost). Kein Service Worker, kein Offline, kein GPS.

- [ ] `GET $APP_URL/manifest.webmanifest` — `name` Fahrtenruhe, `start_url` `/app`, `display` standalone, Icons 192 und 512
- [ ] Installieren: iOS Safari → Teilen → Zum Home-Bildschirm; Android Chrome → App installieren / Zum Startbildschirm
- [ ] Icon zeigt das Fahrtenruhe-Logo (kein Buchstaben-Platzhalter)
- [ ] Start aus dem Homescreen landet auf `/app` (nach Login: Erfassung, nicht die Marketing-Root)
- [ ] Login in der PWA; Session hält; Cookie Secure
- [ ] Schmaler Viewport: Live-Start und Live-Ende bedienbar (Kilometerstand, Nutzungstyp, Ziel, Zweck, Speichern) ohne horizontales Abschneiden der Pflichtfelder
- [ ] Eine Fahrt starten und schließen **in der PWA**; dieselbe Fahrt erscheint am Desktop unter `/app/fahrten`
- [ ] Offene Fahrt und Lücken-Block gelten geräteübergreifend (eine offene Fahrt je Fahrzeug)
- [ ] Iststand und Jahresnachweis-PDF in der PWA lesbar bzw. Download startet
- [ ] Verfahren `/app/verfahren` und Übernahme `/app/fahrten/uebernahme` in der PWA erreichbar
- [ ] Dark-Toggle bewusst; Default bleibt hell — auch in der PWA

Nicht erwartet: Offline, Push, Standortdaten, App-Store-Client.

---

## 7. Abschluss

- [ ] Desktop und PWA ohne offenen Blocker
- [ ] PDF einer Fahrt mit Korrekturspur noch einmal geöffnet (das PDF *ist* das Buch)
- [ ] Superuser-Login nicht mit dem Alltag verwechselt
- [ ] Mängel unten notiert

**Mängel / Hinweise**

|
