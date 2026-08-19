import Link from "next/link";
import { requireFirmaSession } from "@/lib/session";
import { isoDatumInBerlin } from "@/lib/berlin-datum";
import { fieldControlClassName } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { listKunden, listProjekte } from "@/modules/contacts";
import { getStammorteStand } from "@/modules/places";
import { listFahrzeuge } from "@/modules/vehicles";
import { buchjahrHinweis } from "@/modules/vehicles/buchjahr";
import { BuchjahrHinweisBanner } from "@/modules/vehicles/buchjahr-hinweis";
import {
  angeboteneNutzungstypen,
  erwarteterStartKilometerstand,
  fahrtenKetteAbPflichtstart,
  getLetzteGeschlosseneAusListe,
  getOffeneFahrtAusListe,
  listFahrten,
} from "@/modules/trips";
import { FahrtUebernahmeForm } from "@/modules/trips/fahrt-uebernahme-form";
import { cn } from "@/lib/utils";
import { Hinweis } from "@/components/ui/hinweis";

export const dynamic = "force-dynamic";

export default async function UebernahmePage({
  searchParams,
}: {
  searchParams: Promise<{
    fahrzeug?: string;
    error?: string;
    uebernommen?: string;
  }>;
}) {
  const session = await requireFirmaSession();
  const params = await searchParams;
  const fahrzeuge = (await listFahrzeuge(session.firmaId)).filter(
    (f) => !f.ausser_betrieb,
  );
  const fahrzeugId = params.fahrzeug ?? fahrzeuge[0]?.id ?? "";
  const fahrzeug = fahrzeuge.find((f) => f.id === fahrzeugId) ?? null;
  const stammorte = await getStammorteStand(session.firmaId);
  const nutzungstypen = angeboteneNutzungstypen(stammorte);
  const kunden = await listKunden(session.firmaId);
  const projekte = await listProjekte(session.firmaId);

  let erwarteterStart = 0;
  let blockiertGrund: string | null = null;
  let hinweis = buchjahrHinweis({
    inbetriebnahme_am: fahrzeug?.inbetriebnahme_am ?? null,
    ketteAbPflichtstart: false,
  });

  if (fahrzeug) {
    const fahrten = await listFahrten(session.firmaId, fahrzeug.id);
    const offen = getOffeneFahrtAusListe(fahrten);
    const letzte = getLetzteGeschlosseneAusListe(fahrten);
    erwarteterStart = erwarteterStartKilometerstand(
      fahrzeug.eroeffnungs_kilometerstand,
      letzte,
    );
    hinweis = buchjahrHinweis({
      inbetriebnahme_am: fahrzeug.inbetriebnahme_am,
      ketteAbPflichtstart: fahrtenKetteAbPflichtstart({
        eroeffnungs_kilometerstand: fahrzeug.eroeffnungs_kilometerstand,
        pflichtstart: hinweis.pflichtstart,
        fahrten,
      }),
    });
    if (offen) {
      blockiertGrund =
        "Zuerst die offene Fahrt schließen. Eine Übernahme hängt an die geschlossene Kette.";
    }
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <p className="text-sm text-muted-foreground">
          <Link
            href="/app/fahrten"
            className="hover:text-foreground hover:underline"
          >
            ← Fahrten
          </Link>
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
          Übernahme aus Altbestand
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Eine geschlossene Fahrt aus Papier oder Datei, gekennzeichnet und
          mit sichtbarer Korrekturspur. Kein stiller Import, kein
          Excel-Rekonstrukteur. Die Übernahme füllt keine Lücke von selbst.
        </p>
      </div>

      {params.uebernommen ? (
        <Hinweis kind="success">
          Übernahme ins Buch geholt. Korrekturspur geschrieben.
        </Hinweis>
      ) : null}
      {params.error ? <Hinweis kind="error">{params.error}</Hinweis> : null}

      {fahrzeuge.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Ohne Fahrzeug in Betrieb gibt es keine Übernahme.{" "}
          <Link href="/app/fahrzeuge" className="text-primary hover:underline">
            Zu den Fahrzeugen
          </Link>
        </p>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Gekennzeichnete Fahrt</CardTitle>
            <CardDescription>
              Hängt an den Eröffnungs-Kilometerstand oder das Ende der letzten
              Fahrt. Ohne lückenlose Kette ab dem 1. Januar bzw. der
              Inbetriebnahme bleibt das Buchjahr nicht nachweistauglich.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <BuchjahrHinweisBanner hinweis={hinweis} />

            {fahrzeuge.length > 1 ? (
              <form method="get" className="flex flex-col gap-1.5">
                <label
                  htmlFor="fahrzeug-uebernahme"
                  className="text-sm font-medium"
                >
                  Fahrzeug
                </label>
                <select
                  id="fahrzeug-uebernahme"
                  name="fahrzeug"
                  defaultValue={fahrzeugId}
                  className={cn(fieldControlClassName)}
                >
                  {fahrzeuge.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.kennzeichen}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="self-start text-sm font-medium text-primary hover:underline"
                >
                  Fahrzeug wählen
                </button>
              </form>
            ) : null}

            {fahrzeug && session.kannSchreiben ? (
              <FahrtUebernahmeForm
                fahrzeugId={fahrzeug.id}
                erwarteterStart={erwarteterStart}
                angeboteneNutzungstypen={nutzungstypen}
                kunden={kunden}
                projekte={projekte}
                defaultDatum={isoDatumInBerlin()}
                error={null}
                blockiertGrund={blockiertGrund}
              />
            ) : fahrzeug ? (
              <p className="text-sm text-muted-foreground">
                Keine Berechtigung für eine Übernahme.
              </p>
            ) : null}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
