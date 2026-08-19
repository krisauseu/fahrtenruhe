import { Button } from "@/components/ui/button";
import { fieldControlClassName } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { Fahrzeug } from "@/modules/vehicles";

export function JahresnachweisFilterForm({
  jahr,
  fahrzeugId,
  fahrzeuge,
  jahre,
}: {
  jahr: number;
  fahrzeugId: string;
  fahrzeuge: Fahrzeug[];
  jahre: number[];
}) {
  return (
    <form
      method="get"
      action="/app/jahresnachweis"
      className="flex flex-wrap items-end gap-4 rounded-xl border border-border/70 bg-card p-4 shadow-card"
    >
      <div className="flex min-w-40 flex-col gap-1.5">
        <Label htmlFor="fahrzeug">Fahrzeug</Label>
        <select
          id="fahrzeug"
          name="fahrzeug"
          defaultValue={fahrzeugId}
          className={cn(fieldControlClassName)}
        >
          <option value="">alle</option>
          {fahrzeuge.map((f) => (
            <option key={f.id} value={f.id}>
              {f.kennzeichen}
              {f.ausser_betrieb ? " (außer Betrieb)" : ""}
            </option>
          ))}
        </select>
      </div>

      <div className="flex w-32 flex-col gap-1.5">
        <Label htmlFor="jahr">Buchjahr</Label>
        <select
          id="jahr"
          name="jahr"
          defaultValue={String(jahr)}
          className={cn(fieldControlClassName)}
        >
          {jahre.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      <Button type="submit" size="sm" variant="outline">
        Anwenden
      </Button>
    </form>
  );
}
