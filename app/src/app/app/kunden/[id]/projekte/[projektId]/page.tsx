import Link from "next/link";
import { notFound } from "next/navigation";
import { requireFirmaSession } from "@/lib/session";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getKunde, getProjekt } from "@/modules/contacts";
import { ProjektForm } from "@/modules/contacts/projekt-form";

export const dynamic = "force-dynamic";

export default async function ProjektDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; projektId: string }>;
  searchParams: Promise<{ error?: string; gespeichert?: string }>;
}) {
  const session = await requireFirmaSession();
  const { id, projektId } = await params;
  const sp = await searchParams;
  const kunde = await getKunde(session.firmaId, id);
  if (!kunde) notFound();
  const projekt = await getProjekt(session.firmaId, projektId);
  if (!projekt || projekt.kunde !== kunde.id) notFound();

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <p className="text-sm text-muted-foreground">
          <Link
            href={`/app/kunden/${kunde.id}`}
            className="hover:text-foreground hover:underline"
          >
            ← {kunde.name}
          </Link>
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
          {projekt.name}
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
            Das Projekt bleibt bei {kunde.name}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProjektForm
            action={`/app/kunden/${kunde.id}/projekte/${projekt.id}/submit`}
            kundeId={kunde.id}
            projekt={projekt}
            submitLabel="Speichern"
            readOnly={!session.kannSchreiben}
          />
        </CardContent>
      </Card>
    </div>
  );
}
