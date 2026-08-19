"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const ITEMS: Array<{ href: string; label: string; exact?: boolean }> = [
  { href: "/app", label: "Fahrtenbuch", exact: true },
  { href: "/app/fahrten", label: "Fahrten" },
  { href: "/app/iststand", label: "Iststand" },
  { href: "/app/jahresnachweis", label: "Jahresnachweis" },
  { href: "/app/fahrzeuge", label: "Fahrzeuge" },
  { href: "/app/stammorte", label: "Stammorte" },
  { href: "/app/kunden", label: "Kund:innen" },
  { href: "/app/verfahren", label: "Verfahren" },
];

function isActive(pathname: string, href: string, exact?: boolean): boolean {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppNav() {
  const pathname = usePathname();

  return (
    <nav
      className="-mx-1 flex flex-wrap gap-1 text-sm"
      aria-label="Stammdaten"
    >
      {ITEMS.map((item) => {
        const active = isActive(pathname, item.href, item.exact);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "rounded-lg px-2.5 py-1.5 font-medium transition-colors",
              active
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
