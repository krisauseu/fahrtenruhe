import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getFirmaById, isSetupRequired } from "@/lib/pb";
import { AppShell } from "@/components/app-shell";
import { EmptyState } from "@/components/ui/empty-state";
import {
  listFirmenFuerNutzer,
  resolveMitgliedschaftFuerSession,
} from "@/modules/platform/mitgliedschaft";
import { listFahrzeuge } from "@/modules/vehicles";

export const dynamic = "force-dynamic";

export default async function ProtectedAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (await isSetupRequired()) {
    redirect("/setup");
  }

  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const firmen = await listFirmenFuerNutzer(session.userId).catch(() => []);
  const mitgliedschaft = await resolveMitgliedschaftFuerSession(
    session.userId,
    session.firmaId,
  );
  const firmaId = mitgliedschaft?.firmaId ?? firmen[0]?.id ?? null;
  const firma = firmaId ? await getFirmaById(firmaId) : null;
  const mitgliedschaftRolle = mitgliedschaft?.rolle ?? null;

  if (!firmaId || !mitgliedschaftRolle || !firma) {
    return (
      <AppShell
        session={{ ...session, firmaId: null }}
        firmaName={null}
        mitgliedschaftRolle={null}
      >
        <EmptyState
          title="Kein Zugang zu einer Firma"
          description="Für dieses Login liegt keine Mitgliedschaft vor. Bitte die Eigentümer:in um eine Einladung."
        />
      </AppShell>
    );
  }

  const fahrzeuge = await listFahrzeuge(firmaId).catch(() => []);
  const kennzeichenListe = fahrzeuge
    .filter((f) => !f.ausser_betrieb)
    .map((f) => f.kennzeichen);

  return (
    <AppShell
      session={{ ...session, firmaId }}
      firmaName={firma.name}
      kennzeichenListe={kennzeichenListe}
      mitgliedschaftRolle={mitgliedschaftRolle}
    >
      {children}
    </AppShell>
  );
}
