import Link from "next/link";
import { LogOut } from "lucide-react";
import type { SessionPayload } from "@/lib/session";
import { MITGLIEDSCHAFT_ROLLE_LABELS } from "@/lib/labels";
import { Button } from "@/components/ui/button";
import { BrandMark } from "@/components/brand-mark";
import { AppNav } from "@/components/app-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import type { MitgliedschaftRolle } from "@/modules/platform/rechte";

export function AppShell({
  session,
  firmaName,
  kennzeichenListe = [],
  mitgliedschaftRolle,
  children,
}: {
  session: SessionPayload;
  firmaName: string | null;
  kennzeichenListe?: string[];
  mitgliedschaftRolle: MitgliedschaftRolle | null;
  children: React.ReactNode;
}) {
  const kennzeichenText = kennzeichenListe.join(", ");

  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-20 border-b border-border/80 bg-card/90 pt-[env(safe-area-inset-top)] backdrop-blur-md">
        <div
          className="h-0.5 w-full bg-gradient-to-r from-primary via-primary to-[oklch(0.82_0.16_125)]"
          aria-hidden
        />
        <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <Link href="/app" className="inline-block">
                <BrandMark />
              </Link>
              {firmaName ? (
                <p className="mt-1 text-sm leading-snug text-muted-foreground">
                  {firmaName}
                  {kennzeichenText ? ` · ${kennzeichenText}` : ""}
                  {mitgliedschaftRolle
                    ? ` · ${MITGLIEDSCHAFT_ROLLE_LABELS[mitgliedschaftRolle]}`
                    : ""}
                </p>
              ) : null}
            </div>
            <div className="flex shrink-0 items-center gap-1 sm:gap-2">
              <p className="hidden text-sm text-muted-foreground sm:block">
                {session.name}
              </p>
              <ThemeToggle />
              <form action="/logout" method="post">
                <Button type="submit" variant="ghost" size="sm">
                  <LogOut className="h-4 w-4" aria-hidden />
                  Abmelden
                </Button>
              </form>
            </div>
          </div>
          <AppNav />
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:p-6 md:p-9">
        {children}
      </main>
    </div>
  );
}
