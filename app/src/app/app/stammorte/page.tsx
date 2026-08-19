import { requireFirmaSession } from "@/lib/session";
import { PageHeader } from "@/components/ui/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getStammorteStand } from "@/modules/places";
import { StammortForm } from "@/modules/places/stammort-form";

export const dynamic = "force-dynamic";

export default async function StammortePage({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string;
    gespeichert?: string;
    art?: string;
  }>;
}) {
  const session = await requireFirmaSession();
  const stand = await getStammorteStand(session.firmaId);
  const params = await searchParams;
  const artParam = params.art ?? "";

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <PageHeader
        title="Stammorte"
        description="Wohnung und erste Tätigkeitsstätte gehören zur Firma, nicht zum Fahrzeug. Dieselben Anschriften sind erlaubt."
      />

      {stand.wohnung && stand.erste_taetigkeitsstaette ? (
        <p className="text-sm text-muted-foreground" role="status">
          {stand.gleich
            ? "Die Stammorte haben dieselbe Anschrift (Büro in der Wohnung)."
            : "Die Stammorte haben verschiedene Anschriften."}
        </p>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Wohnung</CardTitle>
          <CardDescription>
            Privater Ausgangsort für den späteren Nutzungstyp
            Wohnung–Tätigkeitsstätte.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StammortForm
            art="wohnung"
            stammort={stand.wohnung}
            error={artParam === "wohnung" ? params.error ?? null : null}
            gespeichert={
              params.gespeichert === "1" && artParam === "wohnung"
            }
            readOnly={!session.kannSchreiben}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Erste Tätigkeitsstätte</CardTitle>
          <CardDescription>
            Der eine regelmäßige betriebliche Anlaufort (Büro, Werkstatt,
            Laden).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StammortForm
            art="erste_taetigkeitsstaette"
            stammort={stand.erste_taetigkeitsstaette}
            error={
              artParam === "erste_taetigkeitsstaette"
                ? params.error ?? null
                : null
            }
            gespeichert={
              params.gespeichert === "1" &&
              artParam === "erste_taetigkeitsstaette"
            }
            readOnly={!session.kannSchreiben}
          />
        </CardContent>
      </Card>
    </div>
  );
}
