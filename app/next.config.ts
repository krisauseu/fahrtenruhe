import type { NextConfig } from "next";

/** Hosts für Server-Action Origin-Check (CSRF light). */
function serverActionOrigins(): string[] {
  const base = [
    "localhost",
    "localhost:80",
    "localhost:3000",
    "127.0.0.1",
    "127.0.0.1:80",
    "127.0.0.1:3000",
  ];
  const appUrl = process.env.APP_URL?.trim();
  if (appUrl) {
    try {
      const u = new URL(appUrl);
      if (u.host) base.push(u.host);
      if (u.hostname && u.hostname !== u.host) base.push(u.hostname);
    } catch {
      // ungültige APP_URL → nur Defaults
    }
  }
  return [...new Set(base)];
}

const nextConfig: NextConfig = {
  output: "standalone",
  // @react-pdf/renderer — nativ/Node-side bundling (Jahresnachweis-PDF)
  serverExternalPackages: ["@react-pdf/renderer"],
  experimental: {
    serverActions: {
      allowedOrigins: serverActionOrigins(),
    },
  },
};

export default nextConfig;
