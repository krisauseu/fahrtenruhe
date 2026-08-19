import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Fahrzeug } from "./types";

export function FahrzeugForm({
  action,
  fahrzeug,
  submitLabel,
  error,
  readOnly = false,
}: {
  action: string;
  fahrzeug?: Fahrzeug | null;
  submitLabel: string;
  error?: string | null;
  readOnly?: boolean;
}) {
  return (
    <form action={action} method="post" className="flex flex-col gap-5">
      <fieldset disabled={readOnly} className="flex flex-col gap-5 border-0 p-0">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="kennzeichen">Kennzeichen</Label>
          <Input
            id="kennzeichen"
            name="kennzeichen"
            required
            maxLength={20}
            defaultValue={fahrzeug?.kennzeichen ?? ""}
            autoComplete="off"
            autoCapitalize="characters"
          />
          <p className="text-xs text-muted-foreground">
            Sichtbarer Name des Fahrzeugs. Darf wechseln — die Identität bleibt.
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="eroeffnungs_kilometerstand">
            Eröffnungs-Kilometerstand
          </Label>
          <Input
            id="eroeffnungs_kilometerstand"
            name="eroeffnungs_kilometerstand"
            required
            inputMode="numeric"
            pattern="[0-9]+"
            defaultValue={
              fahrzeug
                ? String(fahrzeug.eroeffnungs_kilometerstand)
                : ""
            }
            autoComplete="off"
          />
          <p className="text-xs text-muted-foreground">
            Ganze Kilometer. Nachkommastellen werden nicht übernommen.
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="inbetriebnahme_am">
            Inbetriebnahme (optional)
          </Label>
          <Input
            id="inbetriebnahme_am"
            name="inbetriebnahme_am"
            type="date"
            defaultValue={fahrzeug?.inbetriebnahme_am ?? ""}
          />
          <p className="text-xs text-muted-foreground">
            Nur nötig, wenn das Fahrzeug in diesem Kalenderjahr in Betrieb
            ging. Sonst gilt der 1. Januar als Pflichtstart der Kette.
          </p>
        </div>
      </fieldset>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      {readOnly ? null : <Button type="submit">{submitLabel}</Button>}
    </form>
  );
}
