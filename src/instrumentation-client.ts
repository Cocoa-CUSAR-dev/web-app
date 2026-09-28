// X-2d: error tracking, client-side. NEXT_PUBLIC_SENTRY_DSN is safe to
// expose to the browser -- a Sentry DSN is a public identifier, not a
// secret. An empty/unset DSN disables the SDK entirely (no error, no
// events sent), so this is safe to leave blank in local dev/CI.
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ?? "local",
  // Traces cost quota on Sentry's free tier; only error capture is needed
  // right now.
  tracesSampleRate: 0,
});
