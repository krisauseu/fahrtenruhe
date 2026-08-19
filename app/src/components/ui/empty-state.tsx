import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function EmptyState({
  title,
  description,
  className,
  children,
}: {
  title: string;
  description?: string;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-start gap-2 rounded-xl border border-dashed border-border bg-muted/40 px-8 py-12 text-sm text-muted-foreground",
        className,
      )}
      role="status"
    >
      <p className="text-base font-medium text-foreground">{title}</p>
      {description ? (
        <p className="max-w-prose leading-relaxed">{description}</p>
      ) : null}
      {children ? <div className="mt-3">{children}</div> : null}
    </div>
  );
}
