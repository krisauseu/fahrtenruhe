import { formatZeitstempelDe } from "@/lib/berlin-datum";
import {
  ABRECHNUNGSSTATUS_LABELS,
  FAHRT_FELD_LABELS,
  formatKilometerstand,
  NUTZUNGSTYP_LABELS,
} from "@/lib/labels";
import { istUebernahmeSpur, parseBuchfelder, parseUebernahmeVorher } from "./invariants";
import type { FahrtBuchfelder, Korrekturspur } from "./types";

function formatFeldwert(
  key: keyof typeof FAHRT_FELD_LABELS,
  value: unknown,
): string {
  if (key === "kilometerstand_ende" && (value === null || value === undefined)) {
    return "offen";
  }
  if (
    (key === "kilometerstand_start" || key === "kilometerstand_ende") &&
    typeof value === "number"
  ) {
    return formatKilometerstand(value);
  }
  if (key === "nutzungstyp" && typeof value === "string") {
    return (
      NUTZUNGSTYP_LABELS[value as keyof typeof NUTZUNGSTYP_LABELS] ?? value
    );
  }
  if (key === "abrechnungsstatus" && typeof value === "string") {
    return (
      ABRECHNUNGSSTATUS_LABELS[
        value as keyof typeof ABRECHNUNGSSTATUS_LABELS
      ] ?? value
    );
  }
  if (value === "" || value === null || value === undefined) {
    return "—";
  }
  return String(value);
}

function geaenderteFelder(
  vorher: FahrtBuchfelder,
  nachher: FahrtBuchfelder,
): Array<keyof typeof FAHRT_FELD_LABELS> {
  const keys = Object.keys(FAHRT_FELD_LABELS) as Array<
    keyof typeof FAHRT_FELD_LABELS
  >;
  return keys.filter((k) => vorher[k] !== nachher[k]);
}

export function KorrekturspurListe({
  spuren,
}: {
  spuren: Korrekturspur[];
}) {
  return (
    <section aria-labelledby="korrekturspur-heading" className="flex flex-col gap-3">
      <h2
        id="korrekturspur-heading"
        className="text-base font-semibold text-foreground"
      >
        Korrekturspur
      </h2>
      {spuren.length === 0 ? (
        <p className="text-sm text-muted-foreground">Keine Korrekturspur.</p>
      ) : (
        <ol className="flex flex-col gap-3">
          {spuren.map((spur) => {
            const uebernahme = parseUebernahmeVorher(spur.vorher);
            const vorher = parseBuchfelder(spur.vorher);
            const nachher = parseBuchfelder(spur.nachher);
            const felder =
              vorher && nachher ? geaenderteFelder(vorher, nachher) : [];
            return (
              <li
                key={spur.id}
                className="rounded-xl border border-border/80 border-l-4 border-l-primary bg-card px-4 py-3 text-sm shadow-card"
              >
                <p className="font-medium text-foreground">
                  {formatZeitstempelDe(spur.wann)} · {spur.wer}
                  {istUebernahmeSpur(spur) ? " · Übernahme" : ""}
                </p>
                {uebernahme ? (
                  <p className="mt-2 text-muted-foreground">
                    Übernahme aus Altbestand — nicht zuvor im Buch
                    {uebernahme.quelle ? ` (${uebernahme.quelle})` : ""}.
                  </p>
                ) : felder.length > 0 && vorher && nachher ? (
                  <ul className="mt-2 flex flex-col gap-1 text-muted-foreground">
                    {felder.map((feld) => (
                      <li key={feld}>
                        <span className="text-foreground">
                          {FAHRT_FELD_LABELS[feld]}:
                        </span>{" "}
                        {formatFeldwert(feld, vorher[feld])} →{" "}
                        {formatFeldwert(feld, nachher[feld])}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    <p>
                      <span className="text-foreground">vorher:</span>{" "}
                      {spur.vorher}
                    </p>
                    <p>
                      <span className="text-foreground">nachher:</span>{" "}
                      {spur.nachher}
                    </p>
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
