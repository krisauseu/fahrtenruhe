import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const STYLES = {
  success: "border-success/30 bg-success/8 text-success",
  error: "border-destructive/30 bg-destructive/8 text-destructive",
  warning: "border-warning/45 bg-warning/15 text-warning-foreground",
  info: "border-border bg-muted/70 text-muted-foreground",
} as const;

export function Hinweis({
  kind,
  children,
  className,
}: {
  kind: keyof typeof STYLES;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      role={kind === "error" ? "alert" : "status"}
      className={cn(
        "rounded-xl border px-4 py-3 text-sm leading-relaxed",
        STYLES[kind],
        className,
      )}
    >
      {children}
    </div>
  );
}
