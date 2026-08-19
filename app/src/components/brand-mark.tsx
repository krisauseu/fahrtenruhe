import Image from "next/image";
import { cn } from "@/lib/utils";

const SIZES = {
  sm: { px: 36, className: "size-9" },
  md: { px: 56, className: "size-14" },
  lg: { px: 72, className: "size-[4.5rem]" },
} as const;

/**
 * Wortmarke Fahrtenruhe — Auftraggeber-Logo (Tachometer), kein Buchstaben-F.
 */
export function BrandMark({
  size = "sm",
  wordmark = true,
  className,
}: {
  size?: keyof typeof SIZES;
  wordmark?: boolean;
  className?: string;
}) {
  const spec = SIZES[size];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2.5 font-semibold tracking-tight text-foreground",
        size === "lg" ? "text-2xl" : size === "md" ? "text-xl" : "text-lg",
        className,
      )}
    >
      <Image
        src="/brand/fahrtenruhe-mark.png"
        alt=""
        width={spec.px}
        height={spec.px}
        className={cn("shrink-0", spec.className)}
        preload
      />
      {wordmark ? <span>Fahrtenruhe</span> : <span className="sr-only">Fahrtenruhe</span>}
    </span>
  );
}
