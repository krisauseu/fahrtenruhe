import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Hinweis } from "@/components/ui/hinweis";

/**
 * Klassischer Form-POST → /setup/submit (Route-Handler).
 * Bewusst kein Server-Action-Form: zuverlässiger hinter Caddy.
 */
export function SetupForm({ error }: { error?: string | null }) {
  return (
    <form action="/setup/submit" method="post" className="flex flex-col gap-5">
      <fieldset className="flex flex-col gap-3">
        <legend className="text-sm font-semibold text-foreground">
          Eigentümer:in
        </legend>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" required autoComplete="name" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">E-Mail</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">Passwort</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="passwordConfirm">Passwort bestätigen</Label>
          <Input
            id="passwordConfirm"
            name="passwordConfirm"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
          />
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <legend className="text-sm font-semibold text-foreground">Firma</legend>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="firmaName">Name der Firma</Label>
          <Input id="firmaName" name="firmaName" required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="strasse">Straße und Hausnummer</Label>
          <Input id="strasse" name="strasse" autoComplete="street-address" />
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="plz">PLZ</Label>
            <Input id="plz" name="plz" autoComplete="postal-code" />
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="ort">Ort</Label>
            <Input id="ort" name="ort" autoComplete="address-level2" />
          </div>
        </div>
      </fieldset>

      {error ? <Hinweis kind="error">{error}</Hinweis> : null}

      <Button type="submit" className="w-full">
        Instanz einrichten
      </Button>
    </form>
  );
}
