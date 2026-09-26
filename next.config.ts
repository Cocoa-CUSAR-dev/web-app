import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs/config";

const nextConfig: NextConfig = {
  /* config options here */
  output: process.env.NEXT_STANDALONE === "true" ? "standalone" : undefined,
};

// X-2d: wraps the build so Sentry can (optionally) upload source maps.
// Without SENTRY_AUTH_TOKEN set, the upload step is skipped -- this is
// safe to run in local dev/CI with no Sentry project configured yet.
export default withSentryConfig(nextConfig, {
  silent: true,
});
