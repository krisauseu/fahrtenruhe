import { STAMMORT_ART_LABELS } from "@/lib/labels";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Stammort, StammortArt } from "./types";

export function StammortForm({
  art,
  stammort,
  error,
  readOnly = false,
  gespeichert = false,
}: {
  art: StammortArt;
  stammort?: Stammort | null;
  error?: string | null;
  readOnly?: boolean;
  gespeichert?: boolean;
}) {
  const prefix = art;
  const label = STAMMORT_ART_LABELS[art];

  return (
    <form
      action="/app/stammorte/submit"
      method="post"
      className="flex flex-col gap-4"
    >
      <input type="hidden" name="art" value={art} />

      <fieldset disabled={readOnly} className="flex flex-col gap-4 border-0 p-0">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`${prefix}-bezeichnung`}>Bezeichnung</Label>
          <Input
            id={`${prefix}-bezeichnung`}
            name="bezeichnung"
            required
            maxLength={120}
            defaultValue={stammort?.bezeichnung ?? ""}
            autoComplete="off"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`${prefix}-strasse`}>Straße und Hausnummer</Label>
          <Input
            id={`${prefix}-strasse`}
            name="strasse"
            defaultValue={stammort?.strasse ?? ""}
            autoComplete="street-address"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`${prefix}-plz`}>PLZ</Label>
            <Input
              id={`${prefix}-plz`}
              name="plz"
              defaultValue={stammort?.plz ?? ""}
              autoComplete="postal-code"
            />
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor={`${prefix}-ort`}>Ort</Label>
            <Input
              id={`${prefix}-ort`}
              name="ort"
              defaultValue={stammort?.ort ?? ""}
              autoComplete="address-level2"
            />
          </div>
        </div>
      </fieldset>

      {gespeichert ? (
        <p className="text-sm text-success" role="status">
          {label} gespeichert.
        </p>
      ) : null}

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      {readOnly ? null : (
        <Button type="submit" variant="secondary">
          {stammort ? `${label} speichern` : `${label} anlegen`}
        </Button>
      )}
    </form>
  );
}
