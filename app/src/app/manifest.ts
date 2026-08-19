import type { MetadataRoute } from "next";
import { PWA_MANIFEST } from "@/lib/pwa";

/** PWA-light: Name + Icons, kein Service Worker / Offline. */
export default function manifest(): MetadataRoute.Manifest {
  return PWA_MANIFEST;
}
