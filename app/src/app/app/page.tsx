import Link from "next/link";
import { requireFirmaSession } from "@/lib/session";
import { getFirmaById } from "@/lib/pb";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Hinweis } from "@/components/ui/hinweis";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { listKunden, listProjekte } from "@/modules/contacts";
import { listFahrzeuge } from "@/modules/vehicles";
import { buchjahrHinweis } from "@/modules/vehicles/buchjahr";
import { BuchjahrHinweisBanner } from "@/modules/vehicles/buchjahr-hinweis";
import { getStammorteStand } from "@/modules/places";
import {
  angeboteneNutzungstypen,
  brauchtKorrekturspur,
  erwarteterStartKilometerstand,
  fahrtenKetteAbPflichtstart,
  getLetzteGeschlosseneAusListe,
  getOffeneFahrtAusListe,
  listFahrten,
} from "@/modules/trips";
import { FahrtStartForm } from "@/modules/trips/fahrt-start-form";
import { FahrtEndeForm } from "@/modules/trips/fahrt-ende-form";
import { FahrtMeta } from "@/modules/trips/fahrt-zeile";

export const dynamic = "force-dynamic";

export default async function AppHomePage({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string;
    gestartet?: string;
    geschlossen?: string;
  }>;
}) {
  const session = await requireFirmaSession();
  const firma = await getFirmaById(session.firmaId);
  const firmaName = firma?.name ?? "";
  const fahrzeuge = await listFahrzeuge(session.firmaId);
  const aktive = fahrzeuge.filter((f) => !f.ausser_betrieb);
  const params = await searchParams;
  const stammorte = await getStammorteStand(session.firmaId);
  const nutzungstypen = angeboteneNutzungstypen(stammorte);
  const kunden = await listKunden(session.firmaId);
  const projekte = await listProjekte(session.firmaId);
  const kundeName = (id: string | null) =>
    id ? (kunden.find((k) => k.id === id)?.name ?? null) : null;
  const projektName = (id: string | null) =>
    id ? (projekte.find((p) => p.id === id)?.name ?? null) : null;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Fahrtenbuch"
        description={
          firmaName
            ? `${firmaName} ist die aktive Firma.`
            : "Keine aktive Firma."
        }
      />

      {params.gestartet ? (
        <Hinweis kind="success">Offene Fahrt gestartet.</Hinweis>
      ) : null}
      {params.geschlossen ? (
        <Hinweis kind="success">Fahrt geschlossen.</Hinweis>
      ) : null}
      {params.error ? <Hinweis kind="error">{params.error}</Hinweis> : null}

      {aktive.length === 0 ? (
        <EmptyState
          title={
            fahrzeuge.length === 0
              ? "Kein Fahrzeug"
              : "Kein Fahrzeug in Betrieb"
          }
          description={
            fahrzeuge.length === 0
              ? "Lege ein Fahrzeug an, bevor das Buch beginnen kann. Es gibt noch keine Fahrt."
              : "Alle Fahrzeuge sind außer Betrieb. Lege ein Fahrzeug an oder nimm eines wieder in Betrieb."
          }
        >
          {session.kannSchreiben ? (
            <Link href="/app/fahrzeuge/neu" className={cn(buttonVariants())}>
              Fahrzeug anlegen
            </Link>
          ) : null}
        </EmptyState>
      ) : (
        <div className="flex flex-col gap-4">
          {await Promise.all(
            aktive.map(async (fahrzeug) => {
              const fahrten = await listFahrten(session.firmaId, fahrzeug.id);
              const hinweisBasis = buchjahrHinweis({
                inbetriebnahme_am: fahrzeug.inbetriebnahme_am,
                ketteAbPflichtstart: false,
              });
              const hinweis = buchjahrHinweis({
                inbetriebnahme_am: fahrzeug.inbetriebnahme_am,
                ketteAbPflichtstart: fahrtenKetteAbPflichtstart({
                  eroeffnungs_kilometerstand:
                    fahrzeug.eroeffnungs_kilometerstand,
                  pflichtstart: hinweisBasis.pflichtstart,
                  fahrten,
                }),
              });
              const offen = getOffeneFahrtAusListe(fahrten);
              const letzte = getLetzteGeschlosseneAusListe(fahrten);
              const erwartet = erwarteterStartKilometerstand(
                fahrzeug.eroeffnungs_kilometerstand,
                letzte,
              );

              return (
                <Card key={fahrzeug.id}>
                  <CardHeader>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <CardTitle>{fahrzeug.kennzeichen}</CardTitle>
                      {offen ? (
                        <Badge variant="warning">Offene Fahrt</Badge>
                      ) : (
                        <Badge variant="muted">Keine offene Fahrt</Badge>
                      )}
                    </div>
                    <CardDescription>
                      {offen
                        ? "Schließen am selben Kalendertag. Danach nur mit Korrekturspur."
                        : "Nächste Fahrt hängt am erwarteten Start-Kilometerstand."}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-4">
                    <BuchjahrHinweisBanner hinweis={hinweis} />

                    {offen ? (
                      <>
                        <FahrtMeta
                          fahrt={offen}
                          kundeName={kundeName(offen.kunde)}
                          projektName={projektName(offen.projekt)}
                        />
                        {session.kannSchreiben ? (
                          <FahrtEndeForm
                            fahrt={offen}
                            brauchtKorrekturspur={brauchtKorrekturspur(
                              offen.datum,
                            )}
                            zurueck="/app"
                          />
                        ) : null}
                      </>
                    ) : session.kannSchreiben ? (
                      <FahrtStartForm
                        fahrzeugId={fahrzeug.id}
                        erwarteterStart={erwartet}
                        angeboteneNutzungstypen={nutzungstypen}
                        kunden={kunden}
                        projekte={projekte}
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Keine Berechtigung zum Starten einer Fahrt.
                      </p>
                    )}

                    <p className="flex flex-wrap gap-x-4 gap-y-1 border-t border-border/70 pt-3">
                      <Link
                        href={`/app/fahrten?fahrzeug=${fahrzeug.id}`}
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        Fahrten von {fahrzeug.kennzeichen}
                      </Link>
                      <Link
                        href={`/app/iststand?fahrzeug=${fahrzeug.id}`}
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        Iststand
                      </Link>
                      <Link
                        href={`/app/jahresnachweis?fahrzeug=${fahrzeug.id}`}
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        Jahresnachweis
                      </Link>
                      <Link
                        href={`/app/fahrten/uebernahme?fahrzeug=${fahrzeug.id}`}
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        Übernahme aus Altbestand
                      </Link>
                    </p>
                  </CardContent>
                </Card>
              );
            }),
          )}
        </div>
      )}
    </div>
  );
}
