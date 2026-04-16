import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";
const repoName = "devops-cheatsheet";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // En producción (GitHub Pages) los assets viven en /devops-cheatsheet/
  basePath: isProd ? `/${repoName}` : "",
  assetPrefix: isProd ? `/${repoName}/` : "",
};

export default nextConfig;

