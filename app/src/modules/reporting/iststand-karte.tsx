import {
  formatEuroCent,
  formatJahresquote,
  formatKilometerstand,
  NUTZUNGSTYP_LABELS,
  VERMOEGENSZUORDNUNG_BAND_LABELS,
  VERMOEGENSZUORDNUNG_BAND_SPANNE,
} from "@/lib/labels";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BuchjahrHinweisBanner } from "@/modules/vehicles/buchjahr-hinweis";
import type { BuchjahrHinweis } from "@/modules/vehicles/buchjahr";
import { istVollesBuchjahr, satzToCent } from "./iststand";
import type { Iststand, IststandFilter } from "./types";

export function IststandKarte({
  kennzeichen,
  iststand,
  hinweis,
  filter,
  filterText,
}: {
  kennzeichen: string;
  iststand: Iststand;
  hinweis: BuchjahrHinweis;
  filter: IststandFilter;
  filterText: string;
}) {
  const voll = istVollesBuchjahr(filter);
  const band = iststand.vermoegenszuordnung_band;
  const satz = formatEuroCent(satzToCent(iststand.kilometerpauschale_satz));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{kennzeichen}</CardTitle>
        <CardDescription>{filterText}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <BuchjahrHinweisBanner hinweis={hinweis} />

        {!voll ? (
          <p className="text-sm text-muted-foreground">
            Quote und Band gelten für die sichtbare Addition, nicht als
            Jahresergebnis. Keine Hochrechnung auf den 31.12.
          </p>
        ) : null}

        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Kachel
            label={NUTZUNGSTYP_LABELS.betrieblich}
            value={formatKilometerstand(iststand.kilometer_betrieblich)}
          />
          <Kachel
            label={NUTZUNGSTYP_LABELS.privat}
            value={formatKilometerstand(iststand.kilometer_privat)}
          />
          <Kachel
            label={NUTZUNGSTYP_LABELS.wohnung_taetigkeitsstaette}
            value={formatKilometerstand(
              iststand.kilometer_wohnung_taetigkeitsstaette,
            )}
          />
          <Kachel
            label="Gesamtfahrleistung"
            value={formatKilometerstand(iststand.kilometer_gesamt)}
          />
          <Kachel
            label={voll ? "Jahresquote" : "Quote der sichtbaren Addition"}
            value={formatJahresquote(iststand.jahresquote)}
          />
          <Kachel
            label="Band der Vermögenszuordnung"
            value={
              band
                ? `${VERMOEGENSZUORDNUNG_BAND_LABELS[band]} (${VERMOEGENSZUORDNUNG_BAND_SPANNE[band]})`
                : "—"
            }
          />
          <Kachel
            className="col-span-2 sm:col-span-3"
            label={`Kilometerpauschale (${satz} je betrieblichem Kilometer, ohne Wohnung–Tätigkeitsstätte)`}
            value={formatEuroCent(iststand.kilometerpauschale_cent)}
          />
        </dl>

        <p className="text-xs leading-relaxed text-muted-foreground">
          Die Vermögenszuordnung trifft die Nutzer:in am Jahresende. Fahrtenruhe
          trägt nur das Band der Quote ein, kein Stammdaten-Flag. Offene Fahrten
          zählen erst nach dem Ende.
        </p>
      </CardContent>
    </Card>
  );
}

function Kachel({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col gap-1 rounded-xl bg-muted/55 px-4 py-3 ${className ?? ""}`}
    >
      <dt className="text-xs leading-snug text-muted-foreground">{label}</dt>
      <dd className="text-lg font-semibold tabular-nums tracking-tight text-foreground">
        {value}
      </dd>
    </div>
  );
}
