import { formatDatumDe } from "@/lib/berlin-datum";
import {
  ABRECHNUNGSSTATUS_LABELS,
  formatKilometerstand,
  NUTZUNGSTYP_LABELS,
  UEBERNAHME_LABEL,
} from "@/lib/labels";
import { Badge } from "@/components/ui/badge";
import { istOffeneFahrt } from "./invariants";
import type { Fahrt, Nutzungstyp } from "./types";

export function NutzungstypBadge({ typ }: { typ: Nutzungstyp }) {
  const variant =
    typ === "betrieblich" ? "default" : typ === "privat" ? "muted" : "secondary";
  return <Badge variant={variant}>{NUTZUNGSTYP_LABELS[typ]}</Badge>;
}

export function FahrtMeta({
  fahrt,
  kundeName,
  projektName,
}: {
  fahrt: Fahrt;
  kundeName?: string | null;
  projektName?: string | null;
}) {
  return (
    <div className="flex flex-col gap-2 text-sm text-muted-foreground">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-medium text-foreground">
          {formatDatumDe(fahrt.datum)}
        </span>
        {istOffeneFahrt(fahrt) ? (
          <span>
            Start {formatKilometerstand(fahrt.kilometerstand_start)}
          </span>
        ) : (
          <span>
            {fahrt.kilometerstand_start.toLocaleString("de-DE")}–
            {formatKilometerstand(fahrt.kilometerstand_ende ?? 0)}
          </span>
        )}
        <NutzungstypBadge typ={fahrt.nutzungstyp} />
        {istOffeneFahrt(fahrt) ? (
          <Badge variant="warning">offene Fahrt</Badge>
        ) : null}
        {fahrt.uebernahme ? (
          <Badge variant="warning">{UEBERNAHME_LABEL}</Badge>
        ) : null}
      </div>
      {fahrt.ziel ? <p>Ziel: {fahrt.ziel}</p> : null}
      {fahrt.zweck ? <p>Zweck: {fahrt.zweck}</p> : null}
      {kundeName ? <p>Kund:in: {kundeName}</p> : null}
      {projektName ? <p>Projekt: {projektName}</p> : null}
      {fahrt.nutzungstyp === "betrieblich" ? (
        <p>
          Abrechnungsstatus:{" "}
          {ABRECHNUNGSSTATUS_LABELS[fahrt.abrechnungsstatus]}
        </p>
      ) : null}
    </div>
  );
}
