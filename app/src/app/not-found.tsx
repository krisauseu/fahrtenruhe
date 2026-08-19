import Link from "next/link";

export default function NotFound() {
  return (
    <div className="auth-canvas flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
      <h1 className="text-xl font-semibold tracking-tight">Seite nicht gefunden</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        Diese Adresse gibt es in Fahrtenruhe nicht.
      </p>
      <Link href="/" className="text-sm font-medium text-primary hover:underline">
        Zur Startseite
      </Link>
    </div>
  );
}
