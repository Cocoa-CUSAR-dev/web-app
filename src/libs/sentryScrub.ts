import type { Breadcrumb, Event } from "@sentry/nextjs";

// US3-2 #125 (F2): the diary card links to /sso#token=<jwt>, so the SSO token
// sits in the URL *fragment* -- which is exactly why the server never sees it.
// The browser-side Sentry SDK is the exception: it records the page href as it
// was when the SDK started (fragment included) in a navigation breadcrumb, and
// attaches that breadcrumb to every later event in the session. Left alone
// that puts the token in a third-party log after all, the very thing moving it
// out of the query string was meant to prevent.
//
// A fragment is never useful in an error report, so these drop it everywhere
// Sentry would record a URL.

function stripFragment(url: string): string {
  const hashIndex = url.indexOf("#");
  return hashIndex === -1 ? url : url.slice(0, hashIndex);
}

/** `beforeBreadcrumb`: navigation breadcrumbs carry `from` / `to` URLs. */
function scrubNavigationBreadcrumb(breadcrumb: Breadcrumb): Breadcrumb {
  if (breadcrumb.category !== "navigation" || !breadcrumb.data) {
    return breadcrumb;
  }

  for (const key of ["from", "to"] as const) {
    const value: unknown = breadcrumb.data[key];
    if (typeof value === "string") {
      breadcrumb.data[key] = stripFragment(value);
    }
  }
  return breadcrumb;
}

/**
 * `beforeSend`: the event's own `request.url` is the page href at capture
 * time. Usually the fragment is long gone by then (the /sso page clears it as
 * its first act), but an error thrown in the instant before that would carry it.
 */
function scrubEventUrl<T extends Event>(event: T): T {
  if (event.request?.url) {
    event.request.url = stripFragment(event.request.url);
  }
  return event;
}

export { scrubEventUrl, scrubNavigationBreadcrumb, stripFragment };
