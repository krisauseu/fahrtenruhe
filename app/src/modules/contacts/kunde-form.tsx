import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Kunde } from "./types";

export function KundeForm({
  action,
  kunde,
  submitLabel,
  error,
  readOnly = false,
}: {
  action: string;
  kunde?: Kunde | null;
  submitLabel: string;
  error?: string | null;
  readOnly?: boolean;
}) {
  return (
    <form action={action} method="post" className="flex flex-col gap-5">
      <fieldset disabled={readOnly} className="flex flex-col gap-5 border-0 p-0">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            required
            maxLength={200}
            defaultValue={kunde?.name ?? ""}
            autoComplete="organization"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="zettelruhe_kontakt_id">
            Zettelruhe-Kontakt-Id (optional)
          </Label>
          <Input
            id="zettelruhe_kontakt_id"
            name="zettelruhe_kontakt_id"
            maxLength={40}
            defaultValue={kunde?.zettelruhe_kontakt_id ?? ""}
            autoComplete="off"
          />
          <p className="text-xs text-muted-foreground">
            Nur Merker für den späteren Export. Kein Live-Abgleich mit
            Zettelruhe.
          </p>
        </div>
      </fieldset>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      {readOnly ? null : <Button type="submit">{submitLabel}</Button>}
    </form>
  );
}
