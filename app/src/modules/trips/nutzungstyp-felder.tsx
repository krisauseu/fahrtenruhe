import { NUTZUNGSTYP_LABELS } from "@/lib/labels";
import type { Nutzungstyp } from "./types";

export function NutzungstypFelder({
  angebotene,
  defaultValue,
  required = true,
}: {
  angebotene: Nutzungstyp[];
  defaultValue?: Nutzungstyp | null;
  required?: boolean;
}) {
  return (
    <fieldset className="flex flex-col gap-2 border-0 p-0">
      <legend className="text-sm font-medium text-foreground">Nutzungstyp</legend>
      <div className="flex flex-col items-start gap-1.5">
        {angebotene.map((typ) => (
          <label
            key={typ}
            className="inline-flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border border-input bg-card px-3 pr-4 text-base text-foreground has-[:checked]:border-primary has-[:checked]:bg-primary/5"
          >
            <input
              type="radio"
              name="nutzungstyp"
              value={typ}
              defaultChecked={defaultValue === typ}
              required={required}
              className="size-5 shrink-0 accent-primary"
            />
            {NUTZUNGSTYP_LABELS[typ]}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
