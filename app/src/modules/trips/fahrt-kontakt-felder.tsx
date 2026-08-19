import { fieldControlClassName } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ABRECHNUNGSSTATUS_LABELS } from "@/lib/labels";
import { cn } from "@/lib/utils";
import type { Abrechnungsstatus } from "./types";
import type { Kunde, Projekt } from "@/modules/contacts";

export function FahrtKontaktFelder({
  kunden,
  projekte,
  defaultKunde = null,
  defaultProjekt = null,
  defaultAbrechnungsstatus = null,
  idPrefix = "",
  autoDefault = false,
}: {
  kunden: Kunde[];
  projekte: Projekt[];
  defaultKunde?: string | null;
  defaultProjekt?: string | null;
  defaultAbrechnungsstatus?: Abrechnungsstatus | null;
  idPrefix?: string;
  /** Start: leerer Status → Default abrechenbar nur mit Kund:in */
  autoDefault?: boolean;
}) {
  const abgerechnet = defaultAbrechnungsstatus === "abgerechnet";

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`${idPrefix}kunde`}>Kund:in (optional)</Label>
        <select
          id={`${idPrefix}kunde`}
          name="kunde"
          defaultValue={defaultKunde ?? ""}
          className={cn(fieldControlClassName)}
        >
          <option value="">Keine Kund:in</option>
          {kunden.map((k) => (
            <option key={k.id} value={k.id}>
              {k.name}
            </option>
          ))}
        </select>
        <p className="text-xs text-muted-foreground">
          Nur bei betrieblich. Ohne Kund:in ist der Zweck Pflicht. Privat und
          Wohnung–Tätigkeitsstätte tragen keine Kund:in.
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`${idPrefix}projekt`}>Projekt (optional)</Label>
        <select
          id={`${idPrefix}projekt`}
          name="projekt"
          defaultValue={defaultProjekt ?? ""}
          className={cn(fieldControlClassName)}
        >
          <option value="">Kein Projekt</option>
          {kunden.map((k) => {
            const eigene = projekte.filter((p) => p.kunde === k.id);
            if (eigene.length === 0) return null;
            return (
              <optgroup key={k.id} label={k.name}>
                {eigene.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </optgroup>
            );
          })}
        </select>
      </div>

      {abgerechnet ? (
        <p className="text-sm text-muted-foreground">
          Abrechnungsstatus: {ABRECHNUNGSSTATUS_LABELS.abgerechnet}. v1 setzt
          das nicht selbst.
        </p>
      ) : (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`${idPrefix}abrechnungsstatus`}>
            Abrechnungsstatus
          </Label>
          <select
            id={`${idPrefix}abrechnungsstatus`}
            name="abrechnungsstatus"
            defaultValue={
              autoDefault ? "" : (defaultAbrechnungsstatus ?? "")
            }
            className={cn(fieldControlClassName)}
          >
            {autoDefault ? (
              <option value="">
                Automatisch (abrechenbar nur mit Kund:in)
              </option>
            ) : null}
            <option value="abrechenbar">
              {ABRECHNUNGSSTATUS_LABELS.abrechenbar}
            </option>
            <option value="nicht_abrechenbar">
              {ABRECHNUNGSSTATUS_LABELS.nicht_abrechenbar}
            </option>
          </select>
          <p className="text-xs text-muted-foreground">
            Default abrechenbar nur mit gesetzter Kund:in. Kulanz: Kund:in
            bleibt, Status nicht abrechenbar.
          </p>
        </div>
      )}
    </div>
  );
}
