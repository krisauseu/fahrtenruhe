import Link from "next/link";
import { requireFirmaSession } from "@/lib/session";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FahrzeugForm } from "@/modules/vehicles/fahrzeug-form";

export const dynamic = "force-dynamic";

export default async function FahrzeugNeuPage({
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
            href="/app/fahrzeuge"
            className="hover:text-foreground hover:underline"
          >
            ← Fahrzeuge
          </Link>
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
          Fahrzeug anlegen
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Kennzeichen und Eröffnung</CardTitle>
          <CardDescription>
            Der Eröffnungs-Kilometerstand setzt die Kette an. Ganze Kilometer,
            keine Nachkommastellen.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FahrzeugForm
            action="/app/fahrzeuge/neu/submit"
            submitLabel="Anlegen"
            error={params.error ?? null}
            readOnly={!session.kannSchreiben}
          />
        </CardContent>
      </Card>
    </div>
  );
}
