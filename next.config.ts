import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Las fotografías de los inmuebles las aportan los anunciantes como URL
    // externas; se permiten hosts https arbitrarios.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
