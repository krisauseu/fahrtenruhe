import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Projekt } from "./types";

export function ProjektForm({
  action,
  kundeId,
  projekt,
  submitLabel,
  error,
  readOnly = false,
}: {
  action: string;
  kundeId: string;
  projekt?: Projekt | null;
  submitLabel: string;
  error?: string | null;
  readOnly?: boolean;
}) {
  return (
    <form action={action} method="post" className="flex flex-col gap-5">
      <input type="hidden" name="kunde" value={kundeId} />
      <fieldset disabled={readOnly} className="flex flex-col gap-5 border-0 p-0">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="projekt-name">Name</Label>
          <Input
            id="projekt-name"
            name="name"
            required
            maxLength={200}
            defaultValue={projekt?.name ?? ""}
            autoComplete="off"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="zettelruhe_projekt_id">
            Zettelruhe-Projekt-Id (optional)
          </Label>
          <Input
            id="zettelruhe_projekt_id"
            name="zettelruhe_projekt_id"
            maxLength={40}
            defaultValue={projekt?.zettelruhe_projekt_id ?? ""}
            autoComplete="off"
          />
          <p className="text-xs text-muted-foreground">
            Nur Merker. Fahrten hängen primär an der:m Kund:in.
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
