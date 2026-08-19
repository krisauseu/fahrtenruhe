import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Hinweis } from "@/components/ui/hinweis";
import { formatKilometerstand } from "@/lib/labels";
import type { Kunde, Projekt } from "@/modules/contacts";
import { FahrtKontaktFelder } from "./fahrt-kontakt-felder";
import { NutzungstypFelder } from "./nutzungstyp-felder";
import type { Nutzungstyp } from "./types";

export function FahrtUebernahmeForm({
  fahrzeugId,
  erwarteterStart,
  angeboteneNutzungstypen,
  kunden,
  projekte,
  defaultDatum,
  error,
  readOnly = false,
  blockiertGrund,
}: {
  fahrzeugId: string;
  erwarteterStart: number;
  angeboteneNutzungstypen: Nutzungstyp[];
  kunden: Kunde[];
  projekte: Projekt[];
  defaultDatum: string;
  error?: string | null;
  readOnly?: boolean;
  blockiertGrund?: string | null;
}) {
  const gesperrt = readOnly || Boolean(blockiertGrund);

  return (
    <form
      action="/app/fahrten/uebernahme/submit"
      method="post"
      className="flex flex-col gap-5"
    >
      <input type="hidden" name="fahrzeug" value={fahrzeugId} />
      <fieldset
        disabled={gesperrt}
        className="flex flex-col gap-5 border-0 p-0"
      >
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`datum-uebernahme-${fahrzeugId}`}>Datum</Label>
          <Input
            id={`datum-uebernahme-${fahrzeugId}`}
            name="datum"
            type="date"
            required
            defaultValue={defaultDatum}
            autoComplete="off"
          />
          <p className="text-xs text-muted-foreground">
            Kalendertag der Fahrt im Altbestand (Europe/Berlin), nicht das
            Datum der Eingabe.
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`kilometerstand_start-uebernahme-${fahrzeugId}`}>
            Kilometerstand Start
          </Label>
          <Input
            id={`kilometerstand_start-uebernahme-${fahrzeugId}`}
            name="kilometerstand_start"
            required
            inputMode="numeric"
            pattern="[0-9]+"
            defaultValue={String(erwarteterStart)}
            autoComplete="off"
            className="text-lg tabular-nums"
          />
          <p className="text-xs text-muted-foreground">
            Ganze Kilometer. Muss {formatKilometerstand(erwarteterStart)} sein
            — sonst ist das eine Lücke. Die Übernahme füllt keine Lücke von
            selbst.
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`kilometerstand_ende-uebernahme-${fahrzeugId}`}>
            Kilometerstand Ende
          </Label>
          <Input
            id={`kilometerstand_ende-uebernahme-${fahrzeugId}`}
            name="kilometerstand_ende"
            required
            inputMode="numeric"
            pattern="[0-9]+"
            autoComplete="off"
            className="text-lg tabular-nums"
          />
          <p className="text-xs text-muted-foreground">
            Eine Übernahme ist immer geschlossen. Ganze Kilometer.
          </p>
        </div>

        <NutzungstypFelder angebotene={angeboteneNutzungstypen} />

        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`ziel-uebernahme-${fahrzeugId}`}>Ziel</Label>
          <Input
            id={`ziel-uebernahme-${fahrzeugId}`}
            name="ziel"
            maxLength={200}
            autoComplete="off"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`zweck-uebernahme-${fahrzeugId}`}>Zweck</Label>
          <Input
            id={`zweck-uebernahme-${fahrzeugId}`}
            name="zweck"
            maxLength={500}
            autoComplete="off"
          />
          <p className="text-xs text-muted-foreground">
            Bei betrieblich ohne Kund:in ist der Zweck Pflicht.
          </p>
        </div>

        <FahrtKontaktFelder
          kunden={kunden}
          projekte={projekte}
          idPrefix={`uebernahme-${fahrzeugId}-`}
          autoDefault
        />

        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`quelle-uebernahme-${fahrzeugId}`}>
            Quelle des Altbestands (optional)
          </Label>
          <Input
            id={`quelle-uebernahme-${fahrzeugId}`}
            name="quelle"
            maxLength={200}
            autoComplete="off"
            placeholder="Papier-Fahrtenbuch, Datei …"
          />
          <p className="text-xs text-muted-foreground">
            Steht in der Korrekturspur. Kein Datei-Upload, kein
            Excel-Rekonstrukteur.
          </p>
        </div>
      </fieldset>

      {blockiertGrund ? (
        <Hinweis kind="error">{blockiertGrund}</Hinweis>
      ) : null}

      {error ? <Hinweis kind="error">{error}</Hinweis> : null}

      {gesperrt ? null : (
        <Button type="submit" className="w-full">
          Als Übernahme ins Buch holen
        </Button>
      )}
    </form>
  );
}
