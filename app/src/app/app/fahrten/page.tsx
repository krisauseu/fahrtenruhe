import Link from "next/link";
import { requireFirmaSession } from "@/lib/session";
import {
  ABRECHNUNGSSTATUS_LABELS,
  formatKilometerstand,
  UEBERNAHME_LABEL,
} from "@/lib/labels";
import { formatDatumDe } from "@/lib/berlin-datum";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Hinweis } from "@/components/ui/hinweis";
import { listKunden, listProjekte } from "@/modules/contacts";
import { listFahrzeuge } from "@/modules/vehicles";
import {
  istOffeneFahrt,
  listFahrten,
  listFahrtenDerFirma,
  listKorrekturspuren,
} from "@/modules/trips";
import { NutzungstypBadge } from "@/modules/trips/fahrt-zeile";
import type { Fahrt } from "@/modules/trips";

export const dynamic = "force-dynamic";

export default async function FahrtenPage({
  searchParams,
}: {
  searchParams: Promise<{ fahrzeug?: string; error?: string }>;
}) {
  const session = await requireFirmaSession();
  const params = await searchParams;
  const fahrzeuge = await listFahrzeuge(session.firmaId);
  const kunden = await listKunden(session.firmaId);
  const projekte = await listProjekte(session.firmaId);
  const fahrzeugId = params.fahrzeug ?? "";
  const fahrzeug = fahrzeugId
    ? (fahrzeuge.find((f) => f.id === fahrzeugId) ?? null)
    : null;

  const fahrten: Fahrt[] = fahrzeug
    ? await listFahrten(session.firmaId, fahrzeug.id)
    : await listFahrtenDerFirma(session.firmaId);

  const fahrtenMitSpur = await Promise.all(
    fahrten.map(async (fahrt) => {
      const spuren = await listKorrekturspuren(fahrt.id);
      return { fahrt, spurAnzahl: spuren.length };
    }),
  );

  const kennzeichenVon = (id: string) =>
    fahrzeuge.find((f) => f.id === id)?.kennzeichen ?? "Fahrzeug";
  const kundeName = (id: string | null) =>
    id ? (kunden.find((k) => k.id === id)?.name ?? null) : null;
  const projektName = (id: string | null) =>
    id ? (projekte.find((p) => p.id === id)?.name ?? null) : null;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Fahrten"
        description={
          fahrzeug
            ? `Buch von ${fahrzeug.kennzeichen}.`
            : "Alle Fahrten der aktiven Firma."
        }
      >
        <Link
          href={
            fahrzeug
              ? `/app/fahrten/uebernahme?fahrzeug=${fahrzeug.id}`
              : "/app/fahrten/uebernahme"
          }
          className="text-sm font-medium text-primary hover:underline"
        >
          Übernahme aus Altbestand
        </Link>
      </PageHeader>

      {params.error ? <Hinweis kind="error">{params.error}</Hinweis> : null}

      {fahrtenMitSpur.length === 0 ? (
        <EmptyState
          title="Noch keine Fahrt"
          description="Starte eine Fahrt auf der Startseite, sobald ein Fahrzeug in Betrieb ist."
        >
          <Link
            href="/app"
            className="text-sm font-medium text-primary hover:underline"
          >
            Zur Startseite
          </Link>
        </EmptyState>
      ) : (
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <ul className="divide-y divide-border">
              {fahrtenMitSpur.map(({ fahrt, spurAnzahl }) => (
                <li key={fahrt.id}>
                  <Link
                    href={`/app/fahrten/${fahrt.id}`}
                    className="flex flex-col gap-2 px-5 py-4 hover:bg-accent/50 sm:px-6"
                  >
                    <span className="font-medium text-foreground">
                      {formatDatumDe(fahrt.datum)}
                      {" · "}
                      {kennzeichenVon(fahrt.fahrzeug)}
                      {istOffeneFahrt(fahrt)
                        ? ` · ${formatKilometerstand(fahrt.kilometerstand_start)} (offen)`
                        : ` · ${fahrt.kilometerstand_start.toLocaleString("de-DE")}–${formatKilometerstand(fahrt.kilometerstand_ende ?? 0)}`}
                    </span>
                    <span className="flex flex-wrap items-center gap-1.5">
                      <NutzungstypBadge typ={fahrt.nutzungstyp} />
                      {istOffeneFahrt(fahrt) ? (
                        <Badge variant="warning">offen</Badge>
                      ) : null}
                      {fahrt.uebernahme ? (
                        <Badge variant="warning">{UEBERNAHME_LABEL}</Badge>
                      ) : null}
                      {spurAnzahl > 0 ? (
                        <Badge variant="outline">
                          Korrekturspur ({spurAnzahl})
                        </Badge>
                      ) : null}
                      {fahrt.nutzungstyp === "betrieblich" ? (
                        <Badge variant="muted">
                          {ABRECHNUNGSSTATUS_LABELS[fahrt.abrechnungsstatus]}
                        </Badge>
                      ) : null}
                    </span>
                    {fahrt.ziel ||
                    fahrt.zweck ||
                    kundeName(fahrt.kunde) ||
                    projektName(fahrt.projekt) ? (
                      <span className="text-sm text-muted-foreground">
                        {[
                          fahrt.ziel,
                          fahrt.zweck,
                          kundeName(fahrt.kunde),
                          projektName(fahrt.projekt),
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </span>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
