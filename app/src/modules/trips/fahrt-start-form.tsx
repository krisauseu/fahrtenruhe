import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatKilometerstand } from "@/lib/labels";
import type { Kunde, Projekt } from "@/modules/contacts";
import { FahrtKontaktFelder } from "./fahrt-kontakt-felder";
import { NutzungstypFelder } from "./nutzungstyp-felder";
import type { Nutzungstyp } from "./types";

export function FahrtStartForm({
  fahrzeugId,
  erwarteterStart,
  angeboteneNutzungstypen,
  kunden,
  projekte,
  error,
  readOnly = false,
}: {
  fahrzeugId: string;
  erwarteterStart: number;
  angeboteneNutzungstypen: Nutzungstyp[];
  kunden: Kunde[];
  projekte: Projekt[];
  error?: string | null;
  readOnly?: boolean;
}) {
  return (
    <form
      action="/app/fahrten/start"
      method="post"
      className="flex flex-col gap-5"
    >
      <input type="hidden" name="fahrzeug" value={fahrzeugId} />
      <fieldset
        disabled={readOnly}
        className="flex flex-col gap-5 border-0 p-0"
      >
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`kilometerstand_start-${fahrzeugId}`}>
            Kilometerstand
          </Label>
          <Input
            id={`kilometerstand_start-${fahrzeugId}`}
            name="kilometerstand_start"
            required
            inputMode="numeric"
            pattern="[0-9]+"
            defaultValue={String(erwarteterStart)}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="next"
            className="text-lg tabular-nums"
          />
          <p className="text-xs text-muted-foreground">
            Ganze Kilometer. Muss {formatKilometerstand(erwarteterStart)} sein
            (Ende der vorigen Fahrt bzw. Eröffnungs-Kilometerstand) — sonst ist
            das eine Lücke.
          </p>
        </div>

        <NutzungstypFelder angebotene={angeboteneNutzungstypen} />

        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`ziel-${fahrzeugId}`}>Ziel</Label>
          <Input
            id={`ziel-${fahrzeugId}`}
            name="ziel"
            maxLength={200}
            autoComplete="off"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`zweck-${fahrzeugId}`}>Zweck</Label>
          <Input
            id={`zweck-${fahrzeugId}`}
            name="zweck"
            maxLength={500}
            autoComplete="off"
          />
          <p className="text-xs text-muted-foreground">
            Bei betrieblich ohne Kund:in ist der Zweck Pflicht. Privat braucht
            keinen Zweck über den Vermerk privat hinaus.
          </p>
        </div>

        <FahrtKontaktFelder
          kunden={kunden}
          projekte={projekte}
          idPrefix={`${fahrzeugId}-`}
          autoDefault
        />
      </fieldset>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      {readOnly ? null : (
        <Button type="submit" className="w-full">
          Fahrt starten
        </Button>
      )}
    </form>
  );
}
