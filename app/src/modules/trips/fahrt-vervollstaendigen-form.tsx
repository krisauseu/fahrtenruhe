import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Kunde, Projekt } from "@/modules/contacts";
import { FahrtKontaktFelder } from "./fahrt-kontakt-felder";
import { NutzungstypFelder } from "./nutzungstyp-felder";
import type { Fahrt, Nutzungstyp } from "./types";

export function FahrtVervollstaendigenForm({
  fahrt,
  angeboteneNutzungstypen,
  kunden,
  projekte,
  error,
  readOnly = false,
}: {
  fahrt: Fahrt;
  angeboteneNutzungstypen: Nutzungstyp[];
  kunden: Kunde[];
  projekte: Projekt[];
  error?: string | null;
  readOnly?: boolean;
}) {
  return (
    <form
      action={`/app/fahrten/${fahrt.id}/vervollstaendigen`}
      method="post"
      className="flex flex-col gap-5"
    >
      <fieldset
        disabled={readOnly}
        className="flex flex-col gap-5 border-0 p-0"
      >
        <NutzungstypFelder
          angebotene={angeboteneNutzungstypen}
          defaultValue={fahrt.nutzungstyp}
        />

        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`ziel-v-${fahrt.id}`}>Ziel</Label>
          <Input
            id={`ziel-v-${fahrt.id}`}
            name="ziel"
            maxLength={200}
            defaultValue={fahrt.ziel}
            autoComplete="off"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`zweck-v-${fahrt.id}`}>Zweck</Label>
          <Input
            id={`zweck-v-${fahrt.id}`}
            name="zweck"
            maxLength={500}
            defaultValue={fahrt.zweck}
            autoComplete="off"
          />
        </div>

        <FahrtKontaktFelder
          kunden={kunden}
          projekte={projekte}
          defaultKunde={fahrt.kunde}
          defaultProjekt={fahrt.projekt}
          defaultAbrechnungsstatus={fahrt.abrechnungsstatus}
          idPrefix={`v-${fahrt.id}-`}
        />
      </fieldset>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      {readOnly ? null : <Button type="submit">Vervollständigen</Button>}
    </form>
  );
}
