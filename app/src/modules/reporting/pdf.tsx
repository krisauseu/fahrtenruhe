/**
 * Jahresnachweis-PDF. Das PDF *ist* das Buch (ADR-0014):
 * fortlaufende Fahrten, Kilometerkette, Korrekturspur im selben Dokument.
 * Nur serverseitig aufrufen.
 */

import React from "react";
import { Document, Page, Text, View, StyleSheet, pdf } from "@react-pdf/renderer";
import { formatDatumDe } from "@/lib/berlin-datum";
import {
  ABRECHNUNGSSTATUS_LABELS,
  formatKilometerstand,
} from "@/lib/labels";
import {
  beschreibeKorrekturspur,
  firmaAnschrift,
  formatFahrtKopfzeile,
  formatIststandZeilen,
  type Jahresnachweis,
  type JahresnachweisZeile,
} from "./jahresnachweis";
import {
  PDF_IST_DAS_BUCH,
  PDF_KEINE_HOCHRECHNUNG,
  PDF_NICHT_NACHWEISTAUGLICH,
  PDF_TITEL,
  PDF_UNTERTITEL,
  pdfDateiTitel,
} from "./pdf-layout";

const styles = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingHorizontal: 42,
    paddingBottom: 56,
    fontSize: 9,
    fontFamily: "Helvetica",
    color: "#111",
  },
  kopf: {
    marginBottom: 14,
  },
  kopfZeile: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  titel: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    marginBottom: 2,
  },
  untertitel: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    marginBottom: 6,
  },
  meta: {
    fontSize: 9,
    color: "#333",
    lineHeight: 1.35,
  },
  metaRechts: {
    fontSize: 9,
    color: "#333",
    textAlign: "right",
    lineHeight: 1.35,
    maxWidth: "48%",
  },
  warnung: {
    borderWidth: 1,
    borderColor: "#8A4B08",
    backgroundColor: "#FFF6E8",
    padding: 8,
    marginBottom: 12,
  },
  warnungTitel: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
    marginBottom: 3,
    color: "#6B3A06",
  },
  warnungText: {
    fontSize: 8.5,
    lineHeight: 1.4,
    color: "#6B3A06",
  },
  abschnitt: {
    marginBottom: 12,
  },
  abschnittTitel: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#222",
    paddingBottom: 3,
  },
  hinweisKlein: {
    fontSize: 8,
    color: "#444",
    marginBottom: 6,
  },
  iststandGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  iststandZelle: {
    width: "50%",
    marginBottom: 4,
  },
  iststandLabel: {
    fontSize: 7.5,
    color: "#555",
  },
  iststandWert: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
  },
  fahrt: {
    borderWidth: 1,
    borderColor: "#D8D8D8",
    padding: 8,
    marginBottom: 8,
  },
  fahrtKopf: {
    fontFamily: "Helvetica-Bold",
    fontSize: 9.5,
    marginBottom: 4,
  },
  fahrtZeile: {
    fontSize: 8.5,
    lineHeight: 1.35,
    color: "#222",
  },
  spurKasten: {
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: "#CCC",
  },
  spurTitel: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8.5,
    marginBottom: 3,
  },
  spurMeta: {
    fontSize: 8,
    marginBottom: 2,
  },
  spurAenderung: {
    fontSize: 8,
    color: "#333",
    marginLeft: 8,
    marginBottom: 1,
  },
  leer: {
    fontSize: 9,
    color: "#555",
  },
  fuss: {
    position: "absolute",
    bottom: 28,
    left: 42,
    right: 42,
    fontSize: 7.5,
    color: "#555",
    flexDirection: "row",
    justifyContent: "space-between",
  },
});

function FahrtBlock({ zeile }: { zeile: JahresnachweisZeile }) {
  const { fahrt } = zeile;
  return (
    <View style={styles.fahrt} wrap={false}>
      <Text style={styles.fahrtKopf}>{formatFahrtKopfzeile(fahrt)}</Text>
      {fahrt.ziel ? <Text style={styles.fahrtZeile}>Ziel: {fahrt.ziel}</Text> : null}
      {fahrt.zweck ? (
        <Text style={styles.fahrtZeile}>Zweck: {fahrt.zweck}</Text>
      ) : null}
      {zeile.kunde_name ? (
        <Text style={styles.fahrtZeile}>Kund:in: {zeile.kunde_name}</Text>
      ) : null}
      {zeile.projekt_name ? (
        <Text style={styles.fahrtZeile}>Projekt: {zeile.projekt_name}</Text>
      ) : null}
      {fahrt.nutzungstyp === "betrieblich" ? (
        <Text style={styles.fahrtZeile}>
          Abrechnungsstatus: {ABRECHNUNGSSTATUS_LABELS[fahrt.abrechnungsstatus]}
        </Text>
      ) : null}
      {fahrt.uebernahme ? (
        <Text style={styles.fahrtZeile}>Übernahme aus Altbestand</Text>
      ) : null}
      {zeile.korrekturspuren.map((spur) => {
        const b = beschreibeKorrekturspur(spur);
        return (
          <View key={spur.id} style={styles.spurKasten}>
            <Text style={styles.spurTitel}>Korrekturspur</Text>
            <Text style={styles.spurMeta}>
              {b.wann_de} · {b.wer}
            </Text>
            {b.aenderungen.length > 0 ? (
              b.aenderungen.map((a, i) => (
                <Text
                  key={`${spur.id}-${i}`}
                  style={styles.spurAenderung}
                >
                  {a.feld}: {a.vorher} → {a.nachher}
                </Text>
              ))
            ) : (
              <Text style={styles.spurAenderung}>
                vorher: {b.vorher_roh} → nachher: {b.nachher_roh}
              </Text>
            )}
          </View>
        );
      })}
    </View>
  );
}

function JahresnachweisDokument({
  nachweis,
  erstelltAm,
}: {
  nachweis: Jahresnachweis;
  erstelltAm: Date;
}): React.ReactElement {
  const anschrift = firmaAnschrift(nachweis.firma);
  const iststandZeilen = formatIststandZeilen(nachweis.iststand);
  const erstelltDe = new Intl.DateTimeFormat("de-DE", {
    timeZone: "Europe/Berlin",
    day: "numeric",
    month: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(erstelltAm);
  const inbetriebnahme = nachweis.fahrzeug.inbetriebnahme_am
    ? formatDatumDe(nachweis.fahrzeug.inbetriebnahme_am)
    : "—";

  return (
    <Document
      title={pdfDateiTitel(
        nachweis.fahrzeug.kennzeichen,
        nachweis.buchjahr,
      )}
      author="Fahrtenruhe"
      subject={PDF_IST_DAS_BUCH}
    >
      <Page size="A4" style={styles.page} wrap>
        <View style={styles.kopf}>
          <View style={styles.kopfZeile}>
            <View>
              <Text style={styles.titel}>{PDF_TITEL}</Text>
              <Text style={styles.untertitel}>
                {PDF_UNTERTITEL} {nachweis.buchjahr}
              </Text>
              <Text style={styles.meta}>{nachweis.firma.name}</Text>
              {anschrift ? <Text style={styles.meta}>{anschrift}</Text> : null}
            </View>
            <View style={styles.metaRechts}>
              <Text>Fahrzeug {nachweis.fahrzeug.kennzeichen}</Text>
              <Text>
                Eröffnungs-Kilometerstand{" "}
                {formatKilometerstand(
                  nachweis.fahrzeug.eroeffnungs_kilometerstand,
                )}
              </Text>
              <Text>Inbetriebnahme {inbetriebnahme}</Text>
              <Text>Buchjahr {nachweis.buchjahr}</Text>
            </View>
          </View>
        </View>

        {!nachweis.hinweis.nachweistauglich ? (
          <View style={styles.warnung}>
            <Text style={styles.warnungTitel}>
              {PDF_NICHT_NACHWEISTAUGLICH}
            </Text>
            <Text style={styles.warnungText}>{nachweis.hinweis.text}</Text>
          </View>
        ) : null}

        <View style={styles.abschnitt}>
          <Text style={styles.abschnittTitel}>Iststand</Text>
          <Text style={styles.hinweisKlein}>{PDF_KEINE_HOCHRECHNUNG}</Text>
          <View style={styles.iststandGrid}>
            {iststandZeilen.map((z) => (
              <View key={z.label} style={styles.iststandZelle}>
                <Text style={styles.iststandLabel}>{z.label}</Text>
                <Text style={styles.iststandWert}>{z.value}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.abschnitt}>
          <Text style={styles.abschnittTitel}>
            Fahrten (fortlaufend, inklusive Korrekturspur)
          </Text>
          {nachweis.zeilen.length === 0 ? (
            <Text style={styles.leer}>Keine Fahrt in diesem Buchjahr.</Text>
          ) : (
            nachweis.zeilen.map((zeile) => (
              <FahrtBlock key={zeile.fahrt.id} zeile={zeile} />
            ))
          )}
        </View>

        <View style={styles.fuss} fixed>
          <Text>{PDF_IST_DAS_BUCH}</Text>
          <Text
            render={({ pageNumber, totalPages }) =>
              `Seite ${pageNumber} von ${totalPages} · erstellt ${erstelltDe}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}

export async function renderJahresnachweisPdf(
  nachweis: Jahresnachweis,
  erstelltAm: Date = new Date(),
): Promise<Buffer> {
  const instance = pdf(
    <JahresnachweisDokument nachweis={nachweis} erstelltAm={erstelltAm} />,
  );
  const blob = await instance.toBlob();
  const ab = await blob.arrayBuffer();
  return Buffer.from(ab);
}
