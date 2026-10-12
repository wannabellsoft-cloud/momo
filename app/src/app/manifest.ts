import type { MetadataRoute } from "next";
import { BASE } from "@/lib/base";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Momo · โมโม่",
    short_name: "Momo",
    description: "Your little bunny who cares. · เพื่อนตัวเล็กที่คอยดูแลแพรวา",
    lang: "th",
    start_url: `${BASE}/`,
    scope: `${BASE}/`,
    display: "standalone",
    orientation: "portrait",
    background_color: "#FFF8F2",
    theme_color: "#FFDCE9",
    icons: [
      { src: `${BASE}/icons/icon-192.png`, sizes: "192x192", type: "image/png" },
      { src: `${BASE}/icons/icon-512.png`, sizes: "512x512", type: "image/png" },
      { src: `${BASE}/icons/icon-maskable-512.png`, sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
