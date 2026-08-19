import Link from "next/link";
import { requireFirmaSession } from "@/lib/session";
import { PageHeader } from "@/components/ui/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Hinweis } from "@/components/ui/hinweis";
import {
  VERFAHRENSDOKU_ABSCHNITTE,
  VERFAHRENSDOKU_KEIN_ZERTIFIKAT,
  VERFAHRENSDOKU_REPO_PFAD,
  VERFAHRENSDOKU_TITEL,
} from "@/modules/platform/verfahrensdokumentation";

export const dynamic = "force-dynamic";

export default async function VerfahrenPage() {
  await requireFirmaSession();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={VERFAHRENSDOKU_TITEL}
        description={`${VERFAHRENSDOKU_KEIN_ZERTIFIKAT} Sie beschreibt, wie das Buch geführt wird — nicht die Zahlen eines Buchjahrs.`}
      />

      <Hinweis kind="warning">
        {VERFAHRENSDOKU_KEIN_ZERTIFIKAT} Die ausfüllbare Vorlage liegt im
        Repo unter <code className="font-mono text-xs">{VERFAHRENSDOKU_REPO_PFAD}</code>{" "}
        (Backup-Ort, Verantwortliche, Restore-Test).
      </Hinweis>

      <div className="flex flex-col gap-4">
        {VERFAHRENSDOKU_ABSCHNITTE.map((abschnitt) => (
          <Card key={abschnitt.titel}>
            <CardHeader>
              <CardTitle className="text-base">{abschnitt.titel}</CardTitle>
              <CardDescription className="text-sm leading-relaxed text-foreground">
                {abschnitt.text}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Individuell ausfüllen</CardTitle>
        </CardHeader>
        <CardContent className="text-sm leading-relaxed text-muted-foreground">
          <p>
            Backup-Rhythmus, Aufbewahrungsort, letzter Restore-Test und
            verantwortliche Person gehören in die Vorlage im Repo — nicht in
            dieses Buchjahr.
          </p>
          <p className="mt-2">
            <Link
              href="/app/jahresnachweis"
              className="font-medium text-primary hover:underline"
            >
              Zum Jahresnachweis
            </Link>
            {" · "}
            <Link
              href="/app/fahrten/uebernahme"
              className="font-medium text-primary hover:underline"
            >
              Übernahme aus Altbestand
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
