import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";
const repoName = "devops-cheatsheet";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // Al usar un dominio personalizado (custom domain), el sitio se sirve en la raíz (/)
  // por lo tanto ya no necesitamos basePath ni assetPrefix.
  // basePath: isProd ? `/${repoName}` : "",
  // assetPrefix: isProd ? `/${repoName}/` : "",
};

export default nextConfig;

