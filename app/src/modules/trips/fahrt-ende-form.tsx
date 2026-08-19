import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Hinweis } from "@/components/ui/hinweis";
import { formatDatumDe } from "@/lib/berlin-datum";
import type { Fahrt } from "./types";

export function FahrtEndeForm({
  fahrt,
  brauchtKorrekturspur,
  error,
  readOnly = false,
  zurueck,
}: {
  fahrt: Fahrt;
  brauchtKorrekturspur: boolean;
  error?: string | null;
  readOnly?: boolean;
  /** Nach Schließen auf der Erfassung bleiben (`/app`). */
  zurueck?: "/app";
}) {
  return (
    <form
      action={`/app/fahrten/${fahrt.id}/ende`}
      method="post"
      className="flex flex-col gap-5"
    >
      {zurueck ? <input type="hidden" name="zurueck" value={zurueck} /> : null}
      {brauchtKorrekturspur ? (
        <Hinweis kind="warning">
          Diese offene Fahrt ist vom {formatDatumDe(fahrt.datum)}. Schließen
          nach Mitternacht wird als Korrekturspur dokumentiert.
        </Hinweis>
      ) : null}

      <fieldset
        disabled={readOnly}
        className="flex flex-col gap-5 border-0 p-0"
      >
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`kilometerstand_ende-${fahrt.id}`}>
            Kilometerstand am Ende
          </Label>
          <Input
            id={`kilometerstand_ende-${fahrt.id}`}
            name="kilometerstand_ende"
            required
            inputMode="numeric"
            pattern="[0-9]+"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="done"
            className="text-lg tabular-nums"
          />
          <p className="text-xs text-muted-foreground">
            Ganze Kilometer, nicht unter dem Start{" "}
            {fahrt.kilometerstand_start.toLocaleString("de-DE")} km.
          </p>
        </div>
      </fieldset>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      {readOnly ? null : (
        <Button type="submit" className="w-full">
          {brauchtKorrekturspur
            ? "Mit Korrekturspur schließen"
            : "Fahrt schließen"}
        </Button>
      )}
    </form>
  );
}
