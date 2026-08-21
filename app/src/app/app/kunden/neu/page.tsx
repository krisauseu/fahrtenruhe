import Link from "next/link";
import { requireFirmaSession } from "@/lib/session";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { KundeForm } from "@/modules/contacts/kunde-form";

export const dynamic = "force-dynamic";

export default async function KundeNeuPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await requireFirmaSession();
  const params = await searchParams;

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
          Kund:in anlegen
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Name</CardTitle>
          <CardDescription>
            Dünner lokaler Stamm. Die Zettelruhe-Kontaktnummer ist optional und
            nur ein Merker.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <KundeForm
            action="/app/kunden/neu/submit"
            submitLabel="Anlegen"
            error={params.error ?? null}
            readOnly={!session.kannSchreiben}
          />
        </CardContent>
      </Card>
    </div>
  );
}
