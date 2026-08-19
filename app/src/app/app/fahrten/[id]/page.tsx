import Link from "next/link";
import { notFound } from "next/navigation";
import { requireFirmaSession } from "@/lib/session";
import { formatDatumDe } from "@/lib/berlin-datum";
import {
  ABRECHNUNGSSTATUS_LABELS,
  formatKilometerstand,
  UEBERNAHME_LABEL,
} from "@/lib/labels";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Hinweis } from "@/components/ui/hinweis";
import { getFahrzeug } from "@/modules/vehicles";
import { getStammorteStand } from "@/modules/places";
import { listKunden, listProjekte } from "@/modules/contacts";
import {
  angeboteneNutzungstypen,
  brauchtKorrekturspur,
  getFahrt,
  istOffeneFahrt,
  listKorrekturspuren,
} from "@/modules/trips";
import { FahrtEndeForm } from "@/modules/trips/fahrt-ende-form";
import { FahrtVervollstaendigenForm } from "@/modules/trips/fahrt-vervollstaendigen-form";
import { FahrtKorrigierenForm } from "@/modules/trips/fahrt-korrigieren-form";
import { KorrekturspurListe } from "@/modules/trips/korrekturspur-liste";
import { NutzungstypBadge } from "@/modules/trips/fahrt-zeile";

export const dynamic = "force-dynamic";

export default async function FahrtDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    error?: string;
    gestartet?: string;
    geschlossen?: string;
    vervollstaendigt?: string;
    korrigiert?: string;
    uebernommen?: string;
  }>;
}) {
  const session = await requireFirmaSession();
  const { id } = await params;
  const sp = await searchParams;
  const fahrt = await getFahrt(session.firmaId, id);
  if (!fahrt) notFound();

  const fahrzeug = await getFahrzeug(session.firmaId, fahrt.fahrzeug);
  const stammorte = await getStammorteStand(session.firmaId);
  const nutzungstypen = angeboteneNutzungstypen(stammorte);
  const kunden = await listKunden(session.firmaId);
  const projekte = await listProjekte(session.firmaId);
  const kundeName = fahrt.kunde
    ? (kunden.find((k) => k.id === fahrt.kunde)?.name ?? null)
    : null;
  const projektName = fahrt.projekt
    ? (projekte.find((p) => p.id === fahrt.projekt)?.name ?? null)
    : null;
  const spuren = await listKorrekturspuren(fahrt.id);
  const nachMitternacht = brauchtKorrekturspur(fahrt.datum);
  const offen = istOffeneFahrt(fahrt);

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
          Fahrt am {formatDatumDe(fahrt.datum)}
        </h1>
        <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <span>{fahrzeug?.kennzeichen ?? "Fahrzeug"}</span>
          <span>
            {offen
              ? `${formatKilometerstand(fahrt.kilometerstand_start)} (offen)`
              : `${fahrt.kilometerstand_start.toLocaleString("de-DE")}–${formatKilometerstand(fahrt.kilometerstand_ende ?? 0)}`}
          </span>
          <NutzungstypBadge typ={fahrt.nutzungstyp} />
          {offen ? <Badge variant="warning">offen</Badge> : null}
          {fahrt.uebernahme ? (
            <Badge variant="warning">{UEBERNAHME_LABEL}</Badge>
          ) : null}
        </p>
        {sp.gestartet ? (
          <Hinweis kind="success" className="mt-3">
            Offene Fahrt gestartet.
          </Hinweis>
        ) : null}
        {sp.geschlossen ? (
          <Hinweis kind="success" className="mt-3">
            Fahrt geschlossen.
          </Hinweis>
        ) : null}
        {sp.vervollstaendigt ? (
          <Hinweis kind="success" className="mt-3">
            Vervollständigung gespeichert.
          </Hinweis>
        ) : null}
        {sp.korrigiert ? (
          <Hinweis kind="success" className="mt-3">
            Korrekturspur geschrieben.
          </Hinweis>
        ) : null}
        {sp.uebernommen ? (
          <Hinweis kind="success" className="mt-3">
            Übernahme ins Buch geholt. Korrekturspur geschrieben.
          </Hinweis>
        ) : null}
        {sp.error ? (
          <Hinweis kind="error" className="mt-3">
            {sp.error}
          </Hinweis>
        ) : null}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Buchfelder</CardTitle>
          <CardDescription>
            Genau ein Nutzungstyp. Kilometerstand in ganzen Kilometern.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 text-sm">
          <p>
            <span className="text-muted-foreground">Ziel: </span>
            {fahrt.ziel || "—"}
          </p>
          <p>
            <span className="text-muted-foreground">Zweck: </span>
            {fahrt.zweck || "—"}
          </p>
          <p>
            <span className="text-muted-foreground">Kund:in: </span>
            {kundeName || "—"}
          </p>
          <p>
            <span className="text-muted-foreground">Projekt: </span>
            {projektName || "—"}
          </p>
          <p>
            <span className="text-muted-foreground">Abrechnungsstatus: </span>
            {ABRECHNUNGSSTATUS_LABELS[fahrt.abrechnungsstatus]}
          </p>
          {fahrt.uebernahme ? (
            <p className="flex flex-wrap items-center gap-2">
              <span className="text-muted-foreground">{UEBERNAHME_LABEL}: </span>
              <Badge variant="warning">aus Altbestand</Badge>
            </p>
          ) : null}
        </CardContent>
      </Card>

      {offen && session.kannSchreiben ? (
        <Card>
          <CardHeader>
            <CardTitle>Fahrt schließen</CardTitle>
            <CardDescription>
              Am selben Kalendertag (Europe/Berlin) ohne Korrekturspur. Danach
              nur noch mit sichtbarer Korrekturspur.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FahrtEndeForm
              fahrt={fahrt}
              brauchtKorrekturspur={nachMitternacht}
            />
          </CardContent>
        </Card>
      ) : null}

      {!nachMitternacht && session.kannSchreiben ? (
        <Card>
          <CardHeader>
            <CardTitle>Vervollständigung</CardTitle>
            <CardDescription>
              Zweck, Ziel, Kund:in und Nutzungstyp am selben Kalendertag
            nachziehen.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FahrtVervollstaendigenForm
              fahrt={fahrt}
              angeboteneNutzungstypen={nutzungstypen}
              kunden={kunden}
              projekte={projekte}
            />
          </CardContent>
        </Card>
      ) : null}

      {nachMitternacht && session.kannSchreiben ? (
        <Card>
          <CardHeader>
            <CardTitle>Korrektur</CardTitle>
            <CardDescription>
              Spätere Änderung — sichtbar als Korrekturspur, kein stilles
              Überschreiben.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FahrtKorrigierenForm
              fahrt={fahrt}
              angeboteneNutzungstypen={nutzungstypen}
              kunden={kunden}
              projekte={projekte}
            />
          </CardContent>
        </Card>
      ) : null}

      <KorrekturspurListe spuren={spuren} />
    </div>
  );
}
