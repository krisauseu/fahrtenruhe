import Link from "next/link";
import { notFound } from "next/navigation";
import { requireFirmaSession } from "@/lib/session";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { getKunde, listProjekte } from "@/modules/contacts";
import { KundeForm } from "@/modules/contacts/kunde-form";

export const dynamic = "force-dynamic";

export default async function KundeDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; gespeichert?: string }>;
}) {
  const session = await requireFirmaSession();
  const { id } = await params;
  const sp = await searchParams;
  const kunde = await getKunde(session.firmaId, id);
  if (!kunde) notFound();

  const projekte = await listProjekte(session.firmaId, kunde.id);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <p className="text-sm text-muted-foreground">
          <Link
            href="/app/kunden"
            className="hover:text-foreground hover:underline"
          >
            ← Kund:innen
          </Link>
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
          {kunde.name}
        </h1>
        {sp.gespeichert ? (
          <p className="mt-1 text-sm text-success" role="status">
            Gespeichert.
          </p>
        ) : null}
        {sp.error ? (
          <p className="mt-1 text-sm text-destructive" role="alert">
            {sp.error}
          </p>
        ) : null}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Stammdaten</CardTitle>
          <CardDescription>
            Name plus optionale Zettelruhe-Kontakt-Id. Kein Live-Sync.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <KundeForm
            action={`/app/kunden/${kunde.id}/submit`}
            kunde={kunde}
            submitLabel="Speichern"
            readOnly={!session.kannSchreiben}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle>Projekte</CardTitle>
              <CardDescription>
                Optionale Arbeitseinheit unter dieser Kund:in. Fahrten hängen
                primär an der:m Kund:in.
              </CardDescription>
            </div>
            {session.kannSchreiben ? (
              <Link
                href={`/app/kunden/${kunde.id}/projekte/neu`}
                className={cn(buttonVariants({ size: "sm" }))}
              >
                Projekt anlegen
              </Link>
            ) : null}
          </div>
        </CardHeader>
        <CardContent>
          {projekte.length === 0 ? (
            <EmptyState
              title="Kein Projekt"
              description="Ein Projekt ist optional. Die Fahrt braucht keines."
            />
          ) : (
            <ul className="divide-y divide-border rounded-xl border border-border">
              {projekte.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/app/kunden/${kunde.id}/projekte/${p.id}`}
                    className="flex flex-wrap items-baseline justify-between gap-2 px-4 py-3 hover:bg-accent/40"
                  >
                    <span className="font-medium text-foreground">{p.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {p.zettelruhe_projekt_id
                        ? "Zettelruhe-Id"
                        : "ohne Zettelruhe-Id"}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
