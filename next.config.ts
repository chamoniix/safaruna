import type { NextConfig } from "next";
import { withSentryConfig } from '@sentry/nextjs'

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
};

const sentryConfig = {
  silent: true,
  hideSourceMaps: true,
  disableLogger: true,
}

export default withSentryConfig(nextConfig, sentryConfig)
