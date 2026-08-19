import Link from "next/link";
import { requireFirmaSession } from "@/lib/session";
import { formatDatumDe } from "@/lib/berlin-datum";
import { monatLabel } from "@/lib/labels";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { listKunden } from "@/modules/contacts";
import { listFahrzeuge } from "@/modules/vehicles";
import {
  buchjahreAuswahl,
  istVollesBuchjahr,
  listIststandBlicke,
  parseIststandFilter,
} from "@/modules/reporting";
import { IststandFilterForm } from "@/modules/reporting/iststand-filter";
import { IststandKarte } from "@/modules/reporting/iststand-karte";
import type { IststandFilter } from "@/modules/reporting";
import { Hinweis } from "@/components/ui/hinweis";

export const dynamic = "force-dynamic";

export default async function IststandPage({
  searchParams,
}: {
  searchParams: Promise<{
    fahrzeug?: string;
    jahr?: string;
    monat?: string;
    von?: string;
    bis?: string;
    kunde?: string;
  }>;
}) {
  const session = await requireFirmaSession();
  const params = await searchParams;
  const fahrzeuge = await listFahrzeuge(session.firmaId);
  const kunden = await listKunden(session.firmaId);
  const { filter, error } = parseIststandFilter(params);
  const fahrzeugId = (params.fahrzeug ?? "").trim();
  const blicke = await listIststandBlicke(
    session.firmaId,
    filter,
    fahrzeugId || null,
  );
  const jahre = buchjahreAuswahl(fahrzeuge, filter.jahr);
  const kundeName =
    filter.kunde != null
      ? (kunden.find((k) => k.id === filter.kunde)?.name ?? null)
      : null;
  const filterText = beschreibungFilter(filter, kundeName);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Iststand"
        description="Dieselbe Addition wie der Jahresnachweis, jederzeit. Keine Hochrechnung auf den 31.12."
      >
        <Link
          href="/app/jahresnachweis"
          className="text-sm font-medium text-primary hover:underline"
        >
          Zum Jahresnachweis
        </Link>
      </PageHeader>

      {error ? <Hinweis kind="error">{error}</Hinweis> : null}

      {fahrzeuge.length === 0 ? (
        <EmptyState
          title="Kein Fahrzeug"
          description="Ohne Fahrzeug gibt es keinen Iststand."
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
          <IststandFilterForm
            filter={filter}
            fahrzeugId={fahrzeugId}
            fahrzeuge={fahrzeuge}
            kunden={kunden}
            jahre={jahre}
          />

          {blicke.length === 0 ? (
            <EmptyState
              title="Kein Fahrzeug für diesen Filter"
              description="Das gewählte Fahrzeug gehört nicht zur aktiven Firma."
            />
          ) : (
            <div className="flex flex-col gap-4">
              {blicke.map(({ fahrzeug, iststand, hinweis }) => (
                <IststandKarte
                  key={fahrzeug.id}
                  kennzeichen={fahrzeug.kennzeichen}
                  iststand={iststand}
                  hinweis={hinweis}
                  filter={filter}
                  filterText={filterText}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function beschreibungFilter(
  filter: IststandFilter,
  kundeName: string | null,
): string {
  const teile = [`Buchjahr ${filter.jahr}`];
  if (filter.monat !== undefined) {
    teile.push(monatLabel(filter.monat));
  }
  if (filter.von || filter.bis) {
    const von = filter.von ? formatDatumDe(filter.von) : "…";
    const bis = filter.bis ? formatDatumDe(filter.bis) : "…";
    teile.push(`Zeitraum ${von}–${bis}`);
  }
  if (filter.kunde) {
    teile.push(kundeName ?? "Kund:in");
  }
  if (istVollesBuchjahr(filter)) {
    return teile[0];
  }
  return teile.join(" · ");
}
