# Fahrtenruhe

Eigenständige Webanwendung für das ordnungsgemäße elektronische Fahrtenbuch von Solo-Selbstständigen in Deutschland. Läuft parallel zu Zettelruhe; Abrechnung und Belege bleiben dort. Dieses Glossary gilt nur hier — Zettelruhes **Fahrt** ist ein anderer Gegenstand.
_Avoid_: Reiseruhe (Arbeitstitel)

## Language

### Buch & Bewegung

**Fahrtenbuch**:
Das geschlossene, lückenlose Verzeichnis aller Fahrten eines Fahrzeugs. Es wird je Fahrzeug und Buchjahr geführt, nicht je Person und nicht je Firma als Sammelbuch.
_Avoid_: Logbuch, Trip list, Mileage log, Fuhrparkjournal

**Fahrt**:
Eine Bewegung eines Fahrzeugs von einem Start zu einem Ziel mit genau einem Nutzungstyp und einem Zweck, begrenzt durch Start- und End-Kilometerstand. Eine Tour mit Zweckwechsel ist eine Folge von Fahrten, kein Datensatz.
_Avoid_: Tour, Tageskette, Trip, Mileage; Zettelruhes Fahrt (Abrechnungszeile mit Pflicht-Kund:in)

**Nutzungstyp**:
Die eine steuerliche Klasse einer Fahrt. Genau einer pro Fahrt. Geschlossene Liste: betrieblich, privat, Wohnung–Tätigkeitsstätte.
_Avoid_: Tag, Kategorie (am Buch)

**Betrieblich**:
Nutzungstyp für eigenbetrieblich veranlasste Fahrten, die nicht der Weg Wohnung–Tätigkeitsstätte sind (Kund:in, Baustelle, Behörde, Material). Zählt in die Jahresquote, darf die Kilometerpauschale-Spalte speisen, darf eine Kund:in tragen. Ohne Kund:in ist der Zweck Pflicht.
_Avoid_: dienstlich, beruflich (im Buch — dasselbe, aber betrieblich ist der Kanon für Gewinnermittler)

**Offene Fahrt**:
Eine Fahrt mit Start-Kilometerstand, aber noch ohne Ende. Pro Fahrzeug höchstens eine. Über Mitternacht wird sie nur noch mit Korrekturspur geschlossen.
_Avoid_: Draft, laufender Timer (es gibt keinen Timer, nur Start/Ende)

**Privat**:
Nutzungstyp für nicht betrieblich veranlasste Fahrten. Zählt nicht in die Jahresquote. Keine Kund:in, kein Zweckzwang über den Vermerk privat hinaus; der Kilometerstand bleibt Pflicht.
_Avoid_: Freizeit, sonstige

**Wohnung–Tätigkeitsstätte**:
Nutzungstyp für den Weg zwischen den Stammorten Wohnung und erster Tätigkeitsstätte. Zählt in die Jahresquote als betrieblich, Default nicht abrechenbar, speist nicht die Kilometerpauschale. Entfernungspauschale rechnet das Buch nicht. In der UI nur, wenn die Stammorte verschieden sind.
_Avoid_: Betriebsstätte (als Typname), Pendelstrecke, Arbeitsweg (im Buch)

**Fahrzeug**:
Das einzelne Kfz, für das ein Fahrtenbuch geführt wird. Stabile Identität; das Kennzeichen ist der sichtbare Name und darf wechseln. Gehört genau einer Firma. Wird außer Betrieb gelegt, nicht gelöscht.
_Avoid_: Auto (als Entität), Asset, Pool (in v1 gibt es keinen Fahrzeugpool); Kennzeichen (als Identität)

**Kilometerstand**:
Der Zählerstand des Fahrzeugs zu Beginn oder Ende einer Fahrt, als ganze Kilometer. Im Buch eines Fahrzeugs folgt der Start einer Fahrt auf das Ende der vorigen; Lücken sind ein Mangel des Buchs.
_Avoid_: Tachostand (im Fachvokabular), Odometer; Zehntelkilometer

**Zweck**:
Der konkrete Anlass der Fahrt (aufgesuchte Kund:in bzw. dienstliche Verrichtung, oder privat). Gehört zur Fahrt, nicht zur Tageskette.
_Avoid_: Notiz, Kommentar (wenn der steuerliche Anlass gemeint ist)

**Ziel**:
Der Ort, an dem die Fahrt endet. Bei betrieblichen Fahrten so konkret, dass die Veranlassung nachvollziehbar ist.
_Avoid_: GPS-Punkt (allein), Adresse (als Zwang — Ort reicht, wenn eindeutig)

### Organisation

**Firma**:
Die rechtliche Wirtschaftseinheit, der Fahrzeuge und Fahrtenbücher zugeordnet sind. Dieselbe Bedeutung wie in Zettelruhe: das Datenmodell ist firma-gebunden; in der Session ist eine Firma aktiv. v1-UX darf dünn sein (eine Firma im Alltag), die Grenze im Modell gilt trotzdem.
_Avoid_: Account, Tenant, Workspace (im Fachvokabular)

**Solo-Selbstständige:r**:
Die primäre Nutzer:in — Einzelunternehmen, EÜR, eigene gemischt genutzte Kfz. Weitere Fahrer:innen und Fuhrpark sind nicht v1.
_Avoid_: Team, Fuhrparkleiter:in, Mandant

**Nutzer:in**:
Ein Login. Zugang zu Firmen über dieselbe grobe Idee wie Zettelruhe (Mitgliedschaft), in v1 dünn.
_Avoid_: User (im UI), Fahrer:in (als Synonym für das Login)

**Stammort**:
Ein konfigurierter Ort der Firma: die Wohnung oder die erste Tätigkeitsstätte. Beide dürfen dieselbe Adresse sein (Büro in der Wohnung); dann ist der Nutzungstyp Wohnung–Tätigkeitsstätte im Alltag entbehrlich. Der Typ einer Fahrt bleibt eine manuelle Aussage, kein Ortssensor.
_Avoid_: POI, Favorit, Geofence

**Wohnung**:
Stammort — der private Ausgangsort für den Nutzungstyp Wohnung–Tätigkeitsstätte.
_Avoid_: Home, Anschrift (allein)

**Erste Tätigkeitsstätte**:
Stammort — der eine regelmäßige betriebliche Anlaufort der Firma (Büro, Werkstatt, Laden). Nicht jedes auswärtige Ziel. Kanon im Buch; das EStG spricht beim Gewinnermittler oft von Wohnung–Betriebsstätte — dasselbe gemeint, anderer Name.
_Avoid_: Betriebsstätte (als Produktwort), Arbeitsort (zu weit — Baustellen sind Ziele, keine Tätigkeitsstätte)

**Kund:in**:
Lokaler, dünner Stamm in Fahrtenruhe: Name plus optionale Zettelruhe-Kontakt-Id. Keine Pflicht am Buch. Betriebliche Fahrten ohne Kund:in sind zulässig, dann ist der Zweck konkret. Kein Live-Sync.
_Avoid_: Client, Buyer; Kontakt (solange Fahrtenruhe keinen Lieferanten-Begriff braucht); Kundennummer (die gibt es in Zettelruhe nicht)

**Abrechnungsstatus**:
Ob eine betriebliche Fahrt nach Zettelruhe exportiert werden soll: abrechenbar, nicht abrechenbar, abgerechnet. Default abrechenbar nur mit gesetzter Kund:in. v1 setzt nicht selbst auf abgerechnet — das bleibt nach dem Import Zettelruhes Sache.
_Avoid_: bezahlt, fakturiert; Kund:in gesetzt als Synonym für abrechenbar

**Projekt**:
Optionale Arbeitseinheit unter einer:m Kund:in, analog Zettelruhe, lokal mit optionaler Zettelruhe-Projekt-Id. Fahrten hängen primär an der:m Kund:in.
_Avoid_: Job, Auftrag (solange nicht als eigener Workflow definiert)

### Nachweis & Jahr

**Buchjahr**:
Das Kalenderjahr, für das das Fahrtenbuch eines Fahrzeugs geführt wird. Kein frei wählbares Wirtschaftsjahr in v1.
_Avoid_: Geschäftsjahr, Periode (wenn das Kalenderjahr gemeint ist)

**Eröffnungs-Kilometerstand**:
Der Kilometerstand, an dem die Kette eines Fahrzeugs in Fahrtenruhe ansetzt (Inbetriebnahme oder 1. Januar nach Übernahme).
_Avoid_: Startwert, Initial km

**Übernahme**:
Gekennzeichnete Fahrten aus einem Altbestand (Papier oder Datei), die mit Korrekturspur ins Buchjahr geholt werden. Ohne lückenlose Übernahme vom 1. Januar (oder ab Inbetriebnahme) ist das angebrochene Buchjahr nicht nachweistauglich — die UI sagt das offen.
_Avoid_: Import (allein), Migration (als Synonym ohne Kennzeichnung)

**Jahresquote**:
Das Verhältnis der betrieblichen Kilometer (Nutzungstyp betrieblich plus Wohnung–Tätigkeitsstätte) zur Gesamtfahrleistung eines Fahrzeugs in einem Buchjahr. Ergebnis des Buchs, nicht Stammdatum am Fahrzeug.
_Avoid_: Nutzungsgrad (als Stammfeld), 1-%-Wert

**Vermögenszuordnung**:
Die steuerliche Einordnung des Fahrzeugs am Jahresende anhand der Jahresquote: notwendiges Betriebsvermögen, gewillkürtes Betriebsvermögen oder Privatvermögen. Eine Entscheidung der Nutzer:in auf Basis des Buchs, kein Stammdaten-Flag, das Fahrten vorprägt.
_Avoid_: Betriebsvermögen (als Fahrzeug-Eigenschaft ohne Jahr)

**Kilometerpauschale**:
Jahresparameter im Bericht (Default 0,30 € je gefahrenem betrieblichem Kilometer, ohne Wohnung–Tätigkeitsstätte). Helfer, wenn das Fahrzeug Privatvermögen bleibt — kein Journal, keine Buchung, kein Belegersatz.
_Avoid_: Pendlerpauschale, Entfernungspauschale (das ist Entfernung × Tage, ein anderer Satz, eine andere km-Menge)

**Iststand**:
Dieselbe Auswertung wie der Jahresnachweis, jederzeit in der UI. Default: laufendes Buchjahr je Fahrzeug (Kilometer je Nutzungstyp, Quote, Band der Vermögenszuordnung, Pauschalen-Spalte). Filter: Monat, Zeitraum, Kund:in. Keine zweite Wahrheit, kein Forecast.
_Avoid_: Dashboard (als eigene Kennzahl), Forecast, Hochrechnung

**Jahresnachweis**:
Der formelle Export des Buchs: PDF je Fahrzeug (fortlaufende Fahrten inklusive Korrekturspur) plus CSV/JSON des Buchs und der abrechenbaren Fahrten. Das PDF *ist* das Buch für die Einsichtnahme, nicht eine Verschönerung.
_Avoid_: Steuererklärung, DATEV-Kfz, Elster-Paket

**Lücke**:
Ein Kilometerstand, an dem das Ende einer Fahrt nicht der Start der nächsten ist. Speichern ist dann blockiert, bis eine Zwischenfahrt nachgetragen oder der Stand per Korrekturspur erklärt ist. Das Buch füllt Lücken nicht von selbst mit privat.
_Avoid_: Toleranz-km (als stilles Glätten)

**Vervollständigung**:
Das Nachziehen von Zweck, Ziel und optional Kund:in/Projekt an einer bereits mit Kilometerstand angelegten Fahrt am selben Kalendertag (Europe/Berlin). Danach nur Korrekturspur.
_Avoid_: Entwurf, Draft (im Buch gibt es keine stillen Entwürfe über den Tag hinaus)

**Korrekturspur**:
Die sichtbare, im Buch selbst einsehbare Dokumentation einer späteren Änderung (wer, wann, was vorher, was nachher). Stille Überschreibung gibt es nicht.
_Avoid_: Audit log (als alleiniges, im Alltag unsichtbares Admin-Protokoll), Soft delete, Storno (als Synonym — eine Fahrt wird korrigiert, nicht storniert wie eine Rechnung)

## Scope-Grenzen (bewusst)

- **Produkt**: Fahrtenruhe — eigenständige App, eigenes Repo, eigenes Buch. Nicht ein Modul von Zettelruhe. Arbeitstitel Reiseruhe ist tot.
- **v1-Betrieb**: Self-hosted; AGPL-3.0; Solo-Selbstständige in Deutschland; Schema firma- und fahrzeuggebunden; Auth/Mitgliedschaft nach Zettelruhe-Muster, UX darf bei einer Firma und der:dem Eigentümer:in bleiben. Erfassung als Web-PWA, kein App Store. Verfahrensdokumentation als Vorlage, kein Zertifikat.
- **Markt**: Deutschland (EStG-Fahrtenbuch, GoBD-Mindeststandard ohne externe Zertifizierung). Kein DACH, keine GmbH-1-%-Strecke in v1.
- **Steuer v1**: Nachweis der Jahresquote und Vorlage für die Vermögenszuordnung. Buchjahr = Kalenderjahr. Keine Elster-Abgabe, keine 1-%-Berechnung, keine AfA-Engine, keine Entfernungspauschale, keine Kfz-Kosten (Belege bleiben in Zettelruhe), keine Hochrechnung.
- **Abrechnung**: Fahrtenruhe erzeugt keine Rechnung. Lokaler Kund:innen-/Projektstamm mit optionaler Zettelruhe-Id; v1-Schnittstelle ist Export, keine Live-API, kein gemeinsames PocketBase.
- **Nicht v1**: Fuhrpark/Pool, mehrere Fahrer:innen als Produkt, nativer App-Store-Client, GPS-Pflicht, Verpflegungspauschalen, Familienheimfahrt als eigener Typ (solange nicht gebraucht), abweichendes Wirtschaftsjahr.
