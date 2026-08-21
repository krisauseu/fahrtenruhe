import Link from "next/link";
import { requireFirmaSession } from "@/lib/session";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Hinweis } from "@/components/ui/hinweis";

export const dynamic = "force-dynamic";

export default async function KundenImportPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; gespeichert?: string }>;
}) {
  const session = await requireFirmaSession();
  const params = await searchParams;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <p className="text-sm text-muted-foreground">
          <Link
            href="/app/kunden"
            className="hover:text-foreground hover:underline"
          >
            ← Kund:innen
          </Link>
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
          CSV-Import Kund:innen
        </h1>
      </div>

      {params.gespeichert ? (
        <Hinweis kind="success">{params.gespeichert}</Hinweis>
      ) : null}
      {params.error ? <Hinweis kind="error">{params.error}</Hinweis> : null}

      <Card>
        <CardHeader>
          <CardTitle>Zettelruhe-Kontakte-CSV</CardTitle>
          <CardDescription>
            Dieselbe Datei wie unter Kontakte → CSV-Export in Zettelruhe.
            Übernommen werden Name und Kontaktnummer. Nur Kund:innen (inkl.
            Doppelrolle); reine Lieferant:innen und Zeilen ohne Nummer werden
            übersprungen. Gleiche Nummer aktualisiert den Namen. Kund:innen
            ohne Nummer werden nicht per Name zusammengeführt. Kein
            Live-Abgleich.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {session.kannSchreiben ? (
            <form
              action="/app/kunden/import/submit"
              method="post"
              encType="multipart/form-data"
              className="flex flex-col gap-4"
            >
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="file">CSV-Datei</Label>
                <input
                  id="file"
                  name="file"
                  type="file"
                  accept=".csv,text/csv,text/plain"
                  required
                  className="block w-full text-sm text-foreground file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-2 file:text-sm file:font-medium file:text-secondary-foreground hover:file:bg-secondary/80"
                />
              </div>
              <Button type="submit">Importieren</Button>
            </form>
          ) : (
            <p className="text-sm text-muted-foreground">Keine Schreibrechte.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
