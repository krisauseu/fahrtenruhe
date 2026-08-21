import Link from "next/link";
import { requireFirmaSession } from "@/lib/session";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Hinweis } from "@/components/ui/hinweis";
import { listKunden, listProjekte } from "@/modules/contacts";

export const dynamic = "force-dynamic";

export default async function KundenPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; gespeichert?: string }>;
}) {
  const session = await requireFirmaSession();
  const kunden = await listKunden(session.firmaId);
  const projekte = await listProjekte(session.firmaId);
  const params = await searchParams;
  const projektAnzahl = (kundeId: string) =>
    projekte.filter((p) => p.kunde === kundeId).length;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Kund:innen"
        description="Lokaler, dünner Stamm. Die Kund:in ist an der Fahrt optional. Namen aus Zettelruhe per CSV, kein Live-Abgleich."
      >
        {session.kannSchreiben ? (
          <>
            <Link
              href="/app/kunden/import"
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              CSV-Import
            </Link>
            <Link href="/app/kunden/neu" className={cn(buttonVariants())}>
              Kund:in anlegen
            </Link>
          </>
        ) : null}
      </PageHeader>

      {params.gespeichert ? (
        <Hinweis kind="success">Gespeichert.</Hinweis>
      ) : null}
      {params.error ? <Hinweis kind="error">{params.error}</Hinweis> : null}

      {kunden.length === 0 ? (
        <EmptyState
          title="Noch keine Kund:in"
          description="Betriebliche Fahrten gehen auch ohne Kund:in — dann ist der Zweck Pflicht. Namen aus Zettelruhe per CSV-Import."
        >
          {session.kannSchreiben ? (
            <div className="flex flex-wrap gap-2">
              <Link
                href="/app/kunden/import"
                className={cn(buttonVariants({ variant: "outline" }))}
              >
                CSV-Import
              </Link>
              <Link href="/app/kunden/neu" className={cn(buttonVariants())}>
                Kund:in anlegen
              </Link>
            </div>
          ) : null}
        </EmptyState>
      ) : (
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <ul className="divide-y divide-border">
              {kunden.map((k) => {
                const n = projektAnzahl(k.id);
                return (
                  <li key={k.id}>
                    <Link
                      href={`/app/kunden/${k.id}`}
                      className="flex flex-wrap items-baseline justify-between gap-2 px-6 py-4 hover:bg-accent/40"
                    >
                      <span className="font-medium text-foreground">
                        {k.name}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {n === 0
                          ? "kein Projekt"
                          : n === 1
                            ? "1 Projekt"
                            : `${n} Projekte`}
                        {k.zettelruhe_kontaktnummer
                          ? ` · ${k.zettelruhe_kontaktnummer}`
                          : ""}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
