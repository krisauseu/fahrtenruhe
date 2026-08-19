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
import { getKunde } from "@/modules/contacts";
import { ProjektForm } from "@/modules/contacts/projekt-form";

export const dynamic = "force-dynamic";

export default async function ProjektNeuPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await requireFirmaSession();
  const { id } = await params;
  const sp = await searchParams;
  const kunde = await getKunde(session.firmaId, id);
  if (!kunde) notFound();

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
          Projekt anlegen
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Projekt unter {kunde.name}</CardTitle>
          <CardDescription>
            Hängt an dieser Kund:in. Die Zettelruhe-Projekt-Id ist optional.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProjektForm
            action={`/app/kunden/${kunde.id}/projekte/neu/submit`}
            kundeId={kunde.id}
            submitLabel="Anlegen"
            error={sp.error ?? null}
            readOnly={!session.kannSchreiben}
          />
        </CardContent>
      </Card>
    </div>
  );
}
