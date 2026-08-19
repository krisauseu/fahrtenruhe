import { Hinweis } from "@/components/ui/hinweis";
import type { BuchjahrHinweis } from "./buchjahr";

export function BuchjahrHinweisBanner({
  hinweis,
}: {
  hinweis: BuchjahrHinweis;
}) {
  if (hinweis.nachweistauglich) return null;

  return (
    <Hinweis kind="warning">
      <p className="font-medium text-warning-foreground">
        Nicht nachweistauglich
      </p>
      <p className="mt-1 leading-relaxed">{hinweis.text}</p>
    </Hinweis>
  );
}
