import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { IststandKarte } from "./iststand-karte";
import { jahresnachweisDateiname } from "./jahresnachweis";
import type { Jahresnachweis } from "./jahresnachweis";

function qs(fahrzeugId: string, jahr: number, umfang?: "abrechenbar"): string {
  const p = new URLSearchParams({
    fahrzeug: fahrzeugId,
    jahr: String(jahr),
  });
  if (umfang) p.set("umfang", umfang);
  return p.toString();
}

export function JahresnachweisKarte({
  nachweis,
}: {
  nachweis: Jahresnachweis;
}) {
  const { fahrzeug, buchjahr, hinweis, iststand } = nachweis;
  const pdfName = jahresnachweisDateiname({
    art: "pdf",
    umfang: "buch",
    kennzeichen: fahrzeug.kennzeichen,
    jahr: buchjahr,
  });
  const qBuch = qs(fahrzeug.id, buchjahr);
  const qAbrechenbar = qs(fahrzeug.id, buchjahr, "abrechenbar");

  return (
    <div className="flex flex-col gap-3">
      <IststandKarte
        kennzeichen={fahrzeug.kennzeichen}
        iststand={iststand}
        hinweis={hinweis}
        filter={{ jahr: buchjahr }}
        filterText={`Buchjahr ${buchjahr}`}
      />
      <div className="flex flex-col gap-3 rounded-xl border border-border/70 bg-card p-4 shadow-card">
        <p className="text-sm text-muted-foreground">
          Formeller Export. Das PDF ist das Buch (Fahrten inklusive
          Korrekturspur). CSV/JSON: ganzes Buch und nur abrechenbare Fahrten.
          Keine Live-API.
        </p>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/app/jahresnachweis/pdf?${qBuch}`}
            className={cn(buttonVariants({ size: "sm" }))}
          >
            Fahrtenbuch (PDF)
          </Link>
          <Link
            href={`/app/jahresnachweis/csv?${qBuch}`}
            className={cn(buttonVariants({ size: "sm", variant: "secondary" }))}
          >
            Buch (CSV)
          </Link>
          <Link
            href={`/app/jahresnachweis/json?${qBuch}`}
            className={cn(buttonVariants({ size: "sm", variant: "secondary" }))}
          >
            Buch (JSON)
          </Link>
          <Link
            href={`/app/jahresnachweis/csv?${qAbrechenbar}`}
            className={cn(buttonVariants({ size: "sm", variant: "outline" }))}
          >
            Abrechenbare Fahrten (CSV)
          </Link>
          <Link
            href={`/app/jahresnachweis/json?${qAbrechenbar}`}
            className={cn(buttonVariants({ size: "sm", variant: "outline" }))}
          >
            Abrechenbare Fahrten (JSON)
          </Link>
        </div>
        <p className="text-xs text-muted-foreground">
          Dateiname PDF: {pdfName}
        </p>
      </div>
    </div>
  );
}
