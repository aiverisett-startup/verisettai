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
        src: "/icon",
        sizes: "32x32",
        type: "image/png",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
