import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Verisett AI",
    short_name: "Verisett",
    description: "Deterministic Escrow & Programmatic Settlement for Autonomous Multi-Agent Workflows",
    start_url: "/",
    display: "standalone",
    background_color: "#FDFCF9",
    theme_color: "#1C1A17",
    icons: [
      {
        src: "/icon.png?v=4",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/apple-icon.png?v=4",
        sizes: "180x180",
        type: "image/png",
      },
      {
        src: "/icon-512x512.png?v=4",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
