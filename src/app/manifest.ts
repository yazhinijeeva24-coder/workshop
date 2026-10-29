import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PennyPilot — Effortless Expense Tracking",
    short_name: "PennyPilot",
    description:
      "Track expenses in two seconds: just type 'lunch 250' and PennyPilot detects the amount, category and day automatically. No signup, budget guard rails, insights and CSV export.",
    start_url: "/",
    display: "standalone",
    background_color: "#ecfdf5",
    theme_color: "#059669",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
