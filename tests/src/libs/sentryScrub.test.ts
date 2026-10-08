import type { Breadcrumb, Event } from "@sentry/nextjs";
import { describe, expect, it } from "vitest";

import {
  scrubEventUrl,
  scrubNavigationBreadcrumb,
  stripFragment,
} from "@/libs/sentryScrub";

// US3-2 #125 (F2): the SSO token rides in the URL fragment. These pin the one
// place it could still leak -- Sentry's own record of page URLs -- so a future
// change to the Sentry config can't silently put it back.

describe("stripFragment", () => {
  it("drops the fragment and keeps path and query", () => {
    expect(stripFragment("/sso#token=SECRET")).toBe("/sso");
    expect(
      stripFragment("https://app.example/history?tab=a#token=SECRET"),
    ).toBe("https://app.example/history?tab=a");
  });

  it("leaves a URL with no fragment untouched", () => {
    expect(stripFragment("/history")).toBe("/history");
    expect(stripFragment("")).toBe("");
  });
});

describe("scrubNavigationBreadcrumb", () => {
  it("removes the fragment from both ends of a navigation breadcrumb", () => {
    // The exact shape Sentry recorded in the reproduction: `from` is the href
    // captured when the SDK started, still carrying the token.
    const breadcrumb: Breadcrumb = {
      category: "navigation",
      data: { from: "/sso#token=SECRET", to: "/sso#token=SECRET" },
    };

    const result = scrubNavigationBreadcrumb(breadcrumb);

    expect(result.data).toEqual({ from: "/sso", to: "/sso" });
    expect(JSON.stringify(result)).not.toContain("SECRET");
  });

  it("keeps the navigation trail useful: the path survives, only the fragment goes", () => {
    const result = scrubNavigationBreadcrumb({
      category: "navigation",
      data: { from: "/sso#token=SECRET", to: "/history" },
    });

    expect(result.data).toEqual({ from: "/sso", to: "/history" });
  });

  it("does not touch breadcrumbs that are not navigation", () => {
    const fetchCrumb: Breadcrumb = {
      category: "fetch",
      data: { url: "/sso/exchange#frag", method: "POST" },
    };

    expect(scrubNavigationBreadcrumb(fetchCrumb)).toEqual({
      category: "fetch",
      data: { url: "/sso/exchange#frag", method: "POST" },
    });
  });

  it("tolerates a navigation breadcrumb with no data or non-string values", () => {
    expect(scrubNavigationBreadcrumb({ category: "navigation" })).toEqual({
      category: "navigation",
    });
    expect(
      scrubNavigationBreadcrumb({
        category: "navigation",
        data: { from: 42, to: undefined },
      }).data,
    ).toEqual({ from: 42, to: undefined });
  });
});

describe("scrubEventUrl", () => {
  it("removes the fragment from the event's request URL", () => {
    const event: Event = {
      request: { url: "https://app.example/sso#token=SECRET" },
    };

    expect(scrubEventUrl(event).request?.url).toBe("https://app.example/sso");
  });

  it("returns an event with no request unchanged", () => {
    const event: Event = { message: "boom" };

    expect(scrubEventUrl(event)).toEqual({ message: "boom" });
  });
});
