import { redirect } from "next/navigation";
import { isSetupRequired } from "@/lib/pb";
import { SetupForm } from "./setup-form";
import { BrandMark } from "@/components/brand-mark";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function SetupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (!(await isSetupRequired())) {
    redirect("/login");
  }

  const params = await searchParams;

  return (
    <div className="auth-canvas flex flex-1 flex-col items-center justify-center px-4 py-6 pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      <div className="mb-8 flex flex-col items-center text-center">
        <BrandMark size="lg" />
        <p className="mt-2 text-sm text-muted-foreground">
          Elektronisches Fahrtenbuch
        </p>
      </div>
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Fahrtenruhe einrichten</CardTitle>
          <CardDescription>
            Leere Instanz: lege die Eigentümer:in und die erste Firma an. Der
            PocketBase-Superuser ist nicht das App-Login.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SetupForm error={params.error ?? null} />
        </CardContent>
      </Card>
      <div className="mt-6">
        <ThemeToggle withLabel />
      </div>
    </div>
  );
}
