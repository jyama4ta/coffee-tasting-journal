import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const isDev = process.env.NODE_ENV === "development";

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  disable: isDev,
});

const nextConfig: NextConfig = {
  output: "standalone",
  // Turbopack設定（空でもOK - Serwistは開発時無効）
  turbopack: {},
};

export default isDev ? nextConfig : withSerwist(nextConfig);
