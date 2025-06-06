import type { NextConfig } from "next";
import { SentryBuildOptions, withSentryConfig } from "@sentry/nextjs";

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

function withPlugins(config: NextConfig) {
  const plugins = [{
    plugin: withSentryConfig,
    options: {
      org: "creco-9n",
      project: "blog-creco-dev-post",
      silent: !process.env.CI,
      disableLogger: true,
    } as SentryBuildOptions,
  }];

  for (const { options, plugin } of plugins) {
    config = plugin(config, options);
  }

  return config;
}

export default withPlugins(nextConfig);
