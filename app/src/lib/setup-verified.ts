/**
 * Anlegen der Eigentümer:in (Setup-Wizard).
 * Eine Eigentümer:in, self-hosted: beim Anlegen automatisch verifizieren.
 * Login hängt nicht an users.verified und nicht an SMTP.
 * Superuser bleibt getrennt — das ist ein App-User in "users".
 */
export function eigentuemerCreateBody(input: {
  email: string;
  password: string;
  name: string;
  firmaId: string;
}): {
  email: string;
  password: string;
  passwordConfirm: string;
  name: string;
  role: "eigentuemer";
  firma: string;
  emailVisibility: true;
  verified: true;
} {
  return {
    email: input.email,
    password: input.password,
    passwordConfirm: input.password,
    name: input.name,
    role: "eigentuemer",
    firma: input.firmaId,
    emailVisibility: true,
    verified: true,
  };
}
