import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: process.env.LOCAL === 'true' ? undefined : "export",
  basePath: "/post",
  trailingSlash: true,

  rewrites: process.env.LOCAL === 'true' ? async () => {
    return [
      {
        source: '/github-api/api/:slug*',
        destination: 'https://app.divops.kr/github-api/api/:slug*', // Matched parameters can be used in the destination
        basePath: false,
      },
      {
        source: '/api/:slug*',
        destination: 'https://app.divops.kr/api/:slug*', // Matched parameters can be used in the destination
        basePath: false,
      },
    ];
  } : undefined,

  // 타입 무시
  typescript: {
    ignoreBuildErrors: true,
  },

  // 린트 무시
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
