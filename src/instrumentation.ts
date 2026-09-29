// X-2d: error tracking, server + edge runtime. Same DSN as
// instrumentation-client.ts -- a Sentry DSN is a public identifier, safe
// to reuse across client/server. Empty/unset DSN disables the SDK
// entirely, safe to leave blank in local dev/CI.
import * as Sentry from "@sentry/nextjs";

export async function register() {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  const environment = process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ?? "local";

  if (process.env.NEXT_RUNTIME === "nodejs") {
    Sentry.init({ dsn, environment, tracesSampleRate: 0 });
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    Sentry.init({ dsn, environment, tracesSampleRate: 0 });
  }
}

export const onRequestError = Sentry.captureRequestError;
