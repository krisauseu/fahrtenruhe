import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Kunde, Projekt } from "@/modules/contacts";
import { FahrtKontaktFelder } from "./fahrt-kontakt-felder";
import { NutzungstypFelder } from "./nutzungstyp-felder";
import type { Fahrt, Nutzungstyp } from "./types";

export function FahrtKorrigierenForm({
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
      action={`/app/fahrten/${fahrt.id}/korrigieren`}
      method="post"
      className="flex flex-col gap-5"
    >
      <p className="text-sm text-muted-foreground">
        Jede Änderung nach Mitternacht wird als Korrekturspur im Buch sichtbar.
      </p>

      <fieldset
        disabled={readOnly}
        className="flex flex-col gap-5 border-0 p-0"
      >
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`kilometerstand_start-k-${fahrt.id}`}>
            Kilometerstand Start
          </Label>
          <Input
            id={`kilometerstand_start-k-${fahrt.id}`}
            name="kilometerstand_start"
            required
            inputMode="numeric"
            pattern="[0-9]+"
            defaultValue={String(fahrt.kilometerstand_start)}
            autoComplete="off"
          />
        </div>

        {fahrt.kilometerstand_ende !== null ? (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`kilometerstand_ende-k-${fahrt.id}`}>
              Kilometerstand Ende
            </Label>
            <Input
              id={`kilometerstand_ende-k-${fahrt.id}`}
              name="kilometerstand_ende"
              required
              inputMode="numeric"
              pattern="[0-9]+"
              defaultValue={String(fahrt.kilometerstand_ende)}
              autoComplete="off"
            />
          </div>
        ) : null}

        <NutzungstypFelder
          angebotene={angeboteneNutzungstypen}
          defaultValue={fahrt.nutzungstyp}
        />

        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`ziel-k-${fahrt.id}`}>Ziel</Label>
          <Input
            id={`ziel-k-${fahrt.id}`}
            name="ziel"
            maxLength={200}
            defaultValue={fahrt.ziel}
            autoComplete="off"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`zweck-k-${fahrt.id}`}>Zweck</Label>
          <Input
            id={`zweck-k-${fahrt.id}`}
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
          idPrefix={`k-${fahrt.id}-`}
        />
      </fieldset>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      {readOnly ? null : (
        <Button type="submit">Mit Korrekturspur speichern</Button>
      )}
    </form>
  );
}
