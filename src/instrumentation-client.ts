// X-2d: error tracking, client-side. NEXT_PUBLIC_SENTRY_DSN is safe to
// expose to the browser -- a Sentry DSN is a public identifier, not a
// secret. An empty/unset DSN disables the SDK entirely (no error, no
// events sent), so this is safe to leave blank in local dev/CI.
import * as Sentry from "@sentry/nextjs";

import { scrubEventUrl, scrubNavigationBreadcrumb } from "@/libs/sentryScrub";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ?? "local",
  // Traces cost quota on Sentry's free tier; only error capture is needed
  // right now.
  tracesSampleRate: 0,
  // The SSO deep link carries its token in the URL fragment (/sso#token=...).
  // Sentry records page URLs, fragment included, in navigation breadcrumbs and
  // on events -- see src/libs/sentryScrub.ts for why that has to be cut.
  beforeBreadcrumb: scrubNavigationBreadcrumb,
  beforeSend: scrubEventUrl,
});
