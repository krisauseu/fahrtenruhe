import { redirect } from "next/navigation";
import { isSetupRequired } from "@/lib/pb";
import { LoginForm } from "./login-form";
import { BrandMark } from "@/components/brand-mark";
import { ThemeToggle } from "@/components/theme-toggle";
import { Hinweis } from "@/components/ui/hinweis";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; hinweis?: string }>;
}) {
  if (await isSetupRequired()) {
    redirect("/setup");
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
      <Card className="w-full max-w-md">
        <CardHeader className="pb-2">
          <CardTitle>Anmelden</CardTitle>
          <CardDescription>Melde dich bei Fahrtenruhe an.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {params.hinweis ? (
            <Hinweis kind="success">{params.hinweis}</Hinweis>
          ) : null}
          <LoginForm error={params.error ?? null} />
        </CardContent>
      </Card>
      <div className="mt-6">
        <ThemeToggle withLabel />
      </div>
    </div>
  );
}
