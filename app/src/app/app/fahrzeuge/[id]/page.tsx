import Link from "next/link";
import { notFound } from "next/navigation";
import { requireFirmaSession } from "@/lib/session";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getFahrzeug } from "@/modules/vehicles";
import { buchjahrHinweis } from "@/modules/vehicles/buchjahr";
import { BuchjahrHinweisBanner } from "@/modules/vehicles/buchjahr-hinweis";
import { FahrzeugForm } from "@/modules/vehicles/fahrzeug-form";
import { fahrtenKetteAbPflichtstart, listFahrten } from "@/modules/trips";

export const dynamic = "force-dynamic";

export default async function FahrzeugDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; gespeichert?: string }>;
}) {
  const session = await requireFirmaSession();
  const { id } = await params;
  const sp = await searchParams;
  const fahrzeug = await getFahrzeug(session.firmaId, id);
  if (!fahrzeug) notFound();

  const fahrten = await listFahrten(session.firmaId, fahrzeug.id);
  const hinweisBasis = buchjahrHinweis({
    inbetriebnahme_am: fahrzeug.inbetriebnahme_am,
    ketteAbPflichtstart: false,
  });
  const hinweis = buchjahrHinweis({
    inbetriebnahme_am: fahrzeug.inbetriebnahme_am,
    ketteAbPflichtstart: fahrtenKetteAbPflichtstart({
      eroeffnungs_kilometerstand: fahrzeug.eroeffnungs_kilometerstand,
      pflichtstart: hinweisBasis.pflichtstart,
      fahrten,
    }),
  });

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
          {fahrzeug.kennzeichen}
        </h1>
        {fahrzeug.ausser_betrieb ? (
          <p className="mt-1 text-sm text-muted-foreground">Außer Betrieb</p>
        ) : null}
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

      <BuchjahrHinweisBanner hinweis={hinweis} />

      <Card>
        <CardHeader>
          <CardTitle>Stammdaten</CardTitle>
          <CardDescription>
            Das Kennzeichen darf wechseln. Die Identität des Fahrzeugs bleibt.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FahrzeugForm
            action={`/app/fahrzeuge/${fahrzeug.id}/submit`}
            fahrzeug={fahrzeug}
            submitLabel="Speichern"
            error={null}
            readOnly={!session.kannSchreiben}
          />
        </CardContent>
      </Card>

      {session.kannSchreiben ? (
        <Card>
          <CardHeader>
            <CardTitle>
              {fahrzeug.ausser_betrieb
                ? "Wieder in Betrieb nehmen"
                : "Außer Betrieb legen"}
            </CardTitle>
            <CardDescription>
              Ein Fahrzeug wird nicht gelöscht. Außer Betrieb bleibt die
              Identität und die Kette erhalten.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              action={`/app/fahrzeuge/${fahrzeug.id}/ausser-betrieb`}
              method="post"
            >
              <input
                type="hidden"
                name="ausser_betrieb"
                value={fahrzeug.ausser_betrieb ? "false" : "true"}
              />
              <Button
                type="submit"
                variant={fahrzeug.ausser_betrieb ? "secondary" : "danger"}
                size="sm"
              >
                {fahrzeug.ausser_betrieb
                  ? "Wieder in Betrieb nehmen"
                  : "Außer Betrieb legen"}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
