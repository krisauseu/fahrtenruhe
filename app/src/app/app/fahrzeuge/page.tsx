import Link from "next/link";
import { requireFirmaSession } from "@/lib/session";
import { formatKilometerstand } from "@/lib/labels";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Hinweis } from "@/components/ui/hinweis";
import { listFahrzeuge } from "@/modules/vehicles";

export const dynamic = "force-dynamic";

export default async function FahrzeugePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; gespeichert?: string }>;
}) {
  const session = await requireFirmaSession();
  const fahrzeuge = await listFahrzeuge(session.firmaId);
  const params = await searchParams;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Fahrzeuge"
        description="Kennzeichen ist der sichtbare Name. Ein Fahrzeug wird außer Betrieb gelegt, nicht gelöscht."
      >
        {session.kannSchreiben ? (
          <Link href="/app/fahrzeuge/neu" className={cn(buttonVariants())}>
            Fahrzeug anlegen
          </Link>
        ) : null}
      </PageHeader>

      {params.gespeichert ? (
        <Hinweis kind="success">Gespeichert.</Hinweis>
      ) : null}
      {params.error ? <Hinweis kind="error">{params.error}</Hinweis> : null}

      {fahrzeuge.length === 0 ? (
        <EmptyState
          title="Noch kein Fahrzeug"
          description="Ohne Fahrzeug gibt es kein Fahrtenbuch."
        >
          {session.kannSchreiben ? (
            <Link
              href="/app/fahrzeuge/neu"
              className={cn(buttonVariants())}
            >
              Fahrzeug anlegen
            </Link>
          ) : null}
        </EmptyState>
      ) : (
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <ul className="divide-y divide-border">
              {fahrzeuge.map((f) => (
                <li key={f.id}>
                  <Link
                    href={`/app/fahrzeuge/${f.id}`}
                    className="flex flex-wrap items-baseline justify-between gap-2 px-6 py-4 hover:bg-accent/40"
                  >
                    <span className="font-medium text-foreground">
                      {f.kennzeichen}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {formatKilometerstand(f.eroeffnungs_kilometerstand)}
                      {f.ausser_betrieb ? " · außer Betrieb" : ""}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
