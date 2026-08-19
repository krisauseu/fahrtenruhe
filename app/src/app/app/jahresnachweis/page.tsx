import Link from "next/link";
import { requireFirmaSession } from "@/lib/session";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { listFahrzeuge } from "@/modules/vehicles";
import {
  buchjahreAuswahl,
  listJahresnachweisBlicke,
  parseJahresnachweisAnfrage,
} from "@/modules/reporting";
import { JahresnachweisFilterForm } from "@/modules/reporting/jahresnachweis-filter";
import { JahresnachweisKarte } from "@/modules/reporting/jahresnachweis-karte";
import { Hinweis } from "@/components/ui/hinweis";

export const dynamic = "force-dynamic";

export default async function JahresnachweisPage({
  searchParams,
}: {
  searchParams: Promise<{
    fahrzeug?: string;
    jahr?: string;
  }>;
}) {
  const session = await requireFirmaSession();
  const params = await searchParams;
  const fahrzeuge = await listFahrzeuge(session.firmaId);
  const parsed = parseJahresnachweisAnfrage(params);
  const fahrzeugId = parsed.fahrzeug;
  const blicke = await listJahresnachweisBlicke(
    session.firmaId,
    parsed.jahr,
    fahrzeugId || null,
  );
  const jahre = buchjahreAuswahl(fahrzeuge, parsed.jahr);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Jahresnachweis"
        description="Der formelle Export des Buchs je Fahrzeug und Buchjahr. Das PDF ist das Buch für die Einsichtnahme (Fahrten inklusive Korrekturspur). Der Iststand bleibt die jederzeit sichtbare Addition. Keine Hochrechnung auf den 31.12."
      >
        <Link
          href="/app/iststand"
          className="text-sm font-medium text-primary hover:underline"
        >
          Zum Iststand
        </Link>
        <Link
          href="/app/verfahren"
          className="text-sm font-medium text-primary hover:underline"
        >
          Verfahren
        </Link>
      </PageHeader>

      {parsed.error ? <Hinweis kind="error">{parsed.error}</Hinweis> : null}

      {fahrzeuge.length === 0 ? (
        <EmptyState
          title="Kein Fahrzeug"
          description="Ohne Fahrzeug gibt es keinen Jahresnachweis."
        >
          <Link
            href="/app/fahrzeuge"
            className="text-sm font-medium text-primary hover:underline"
          >
            Zu den Fahrzeugen
          </Link>
        </EmptyState>
      ) : (
        <>
          <JahresnachweisFilterForm
            jahr={parsed.jahr}
            fahrzeugId={fahrzeugId}
            fahrzeuge={fahrzeuge}
            jahre={jahre}
          />

          {blicke.length === 0 ? (
            <EmptyState
              title="Kein Fahrzeug für diesen Filter"
              description="Das gewählte Fahrzeug gehört nicht zur aktiven Firma."
            />
          ) : (
            <div className="flex flex-col gap-6">
              {blicke.map((nachweis) => (
                <JahresnachweisKarte
                  key={nachweis.fahrzeug.id}
                  nachweis={nachweis}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
