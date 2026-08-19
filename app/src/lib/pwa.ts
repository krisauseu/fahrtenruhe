/**
 * PWA-light (ADR-0010): Manifest + Icons, installierbar am Homescreen.
 * Kein Service Worker, kein Offline-First, kein GPS, kein App-Store-Client.
 */

export const PWA_NAME = "Fahrtenruhe";
export const PWA_SHORT_NAME = "Fahrtenruhe";
export const PWA_DESCRIPTION =
  "Self-hosted elektronisches Fahrtenbuch für Solo-Selbstständige in Deutschland";
export const PWA_START_URL = "/app";
export const PWA_SCOPE = "/";
export const PWA_DISPLAY = "standalone" as const;
export const PWA_LANG = "de" as const;
export const PWA_THEME_COLOR = "#f4fbfc";
export const PWA_BACKGROUND_COLOR = "#f4fbfc";
export const PWA_ICON_192 = "/icon-192.png";
export const PWA_ICON_512 = "/icon-512.png";

export const PWA_MANIFEST = {
  name: PWA_NAME,
  short_name: PWA_SHORT_NAME,
  description: PWA_DESCRIPTION,
  start_url: PWA_START_URL,
  scope: PWA_SCOPE,
  display: PWA_DISPLAY,
  background_color: PWA_BACKGROUND_COLOR,
  theme_color: PWA_THEME_COLOR,
  lang: PWA_LANG,
  prefer_related_applications: false,
  icons: [
    {
      src: PWA_ICON_192,
      sizes: "192x192",
      type: "image/png",
      purpose: "any" as const,
    },
    {
      src: PWA_ICON_512,
      sizes: "512x512",
      type: "image/png",
      purpose: "any" as const,
    },
    {
      src: PWA_ICON_512,
      sizes: "512x512",
      type: "image/png",
      purpose: "maskable" as const,
    },
  ],
};
