import { Button } from "@/components/ui/button";
import { fieldControlClassName, Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { monatLabel } from "@/lib/labels";
import { cn } from "@/lib/utils";
import type { Kunde } from "@/modules/contacts";
import type { Fahrzeug } from "@/modules/vehicles";
import type { IststandFilter } from "./types";

export function IststandFilterForm({
  filter,
  fahrzeugId,
  fahrzeuge,
  kunden,
  jahre,
}: {
  filter: IststandFilter;
  fahrzeugId: string;
  fahrzeuge: Fahrzeug[];
  kunden: Kunde[];
  jahre: number[];
}) {
  return (
    <form
      method="get"
      action="/app/iststand"
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
          <option value="">alle in Betrieb</option>
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
          defaultValue={String(filter.jahr)}
          className={cn(fieldControlClassName)}
        >
          {jahre.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      <div className="flex min-w-40 flex-col gap-1.5">
        <Label htmlFor="monat">Monat</Label>
        <select
          id="monat"
          name="monat"
          defaultValue={filter.monat ? String(filter.monat) : ""}
          className={cn(fieldControlClassName)}
        >
          <option value="">ganzes Buchjahr</option>
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
            <option key={m} value={m}>
              {monatLabel(m)}
            </option>
          ))}
        </select>
      </div>

      <div className="flex w-44 flex-col gap-1.5">
        <Label htmlFor="von">Zeitraum von</Label>
        <Input
          id="von"
          name="von"
          type="date"
          defaultValue={filter.von ?? ""}
        />
      </div>

      <div className="flex w-44 flex-col gap-1.5">
        <Label htmlFor="bis">Zeitraum bis</Label>
        <Input
          id="bis"
          name="bis"
          type="date"
          defaultValue={filter.bis ?? ""}
        />
      </div>

      <div className="flex min-w-44 flex-col gap-1.5">
        <Label htmlFor="kunde">Kund:in</Label>
        <select
          id="kunde"
          name="kunde"
          defaultValue={filter.kunde ?? ""}
          className={cn(fieldControlClassName)}
        >
          <option value="">alle</option>
          {kunden.map((k) => (
            <option key={k.id} value={k.id}>
              {k.name}
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
