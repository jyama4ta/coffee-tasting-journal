import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Coffee Tasting Journal",
    short_name: "Coffee Log",
    description: "コーヒードリップ記録アプリ - ハンドドリップの記録を管理",
    start_url: "/",
    display: "standalone",
    background_color: "#fffbeb",
    theme_color: "#78350f",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    categories: ["food", "lifestyle"],
    lang: "ja",
  };
}
