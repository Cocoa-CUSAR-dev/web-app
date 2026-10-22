import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

import {
  backendEndpoints,
  backendGroups,
  backendHref,
  backendUrlFor,
} from "@/core/constants";

// The paths the backend serves today, written out in full. If one of these
// has to change, change it here on purpose: this is the list of what the web
// app asks the backend for.
describe("backendEndpoints paths", () => {
  it.each([
    [backendEndpoints.auth.login, "auth", "/api/v1/auth/login"],
    [backendEndpoints.auth.logout, "auth", "/api/v1/auth/logout"],
    [backendEndpoints.auth.me, "auth", "/api/v1/auth/me"],
    [
      backendEndpoints.auth.resetPassword,
      "auth",
      "/api/v1/auth/reset-password",
    ],
    [backendEndpoints.auth.ssoExchange, "auth", "/api/v1/auth/sso/exchange"],
    [backendEndpoints.me.history(), "me", "/api/v1/me/history"],
    [
      backendEndpoints.me.history("?limit=10&offset=20"),
      "me",
      "/api/v1/me/history?limit=10&offset=20",
    ],
    [
      backendEndpoints.me.historyOn("2026-09-01"),
      "me",
      "/api/v1/me/history/2026-09-01",
    ],
    [
      backendEndpoints.me.diary("2026-09-01"),
      "me",
      "/api/v1/me/diaries/2026-09-01",
    ],
    [backendEndpoints.admin.users, "admin", "/api/v1/admin/users"],
    [backendEndpoints.forms.list, "forms", "/api/v1/forms"],
    [backendEndpoints.forms.byId("f1"), "forms", "/api/v1/forms/f1"],
    [backendEndpoints.forms.edit("f1"), "forms", "/api/v1/forms/f1/edit"],
    [
      backendEndpoints.forms.reminder("f1"),
      "forms",
      "/api/v1/forms/f1/reminder",
    ],
    [backendEndpoints.forms.handlers, "forms", "/api/v1/forms/handlers"],
    [
      backendEndpoints.forms.handlerCatalog,
      "forms",
      "/api/v1/forms/handlers/catalog",
    ],
    [
      backendEndpoints.forms.handlerFields("harvest"),
      "forms",
      "/api/v1/forms/handlers/harvest/fields",
    ],
    [backendEndpoints.tasks.list, "tasks", "/api/v1/tasks"],
    [backendEndpoints.tasks.byId("t1"), "tasks", "/api/v1/tasks/t1"],
    [
      backendEndpoints.tasks.responses("t1"),
      "tasks",
      "/api/v1/tasks/t1/responses",
    ],
    [backendEndpoints.tasks.review("t1"), "tasks", "/api/v1/tasks/t1/review"],
    [
      backendEndpoints.tasks.review("t 1", "?limit=5"),
      "tasks",
      "/api/v1/tasks/t%201/review?limit=5",
    ],
    [
      backendEndpoints.tasks.correctField("t1", "r1", "plot id"),
      "tasks",
      "/api/v1/tasks/t1/review/r1/fields/plot%20id",
    ],
    [
      backendEndpoints.analytics.userSummary("count", "2026-01", "2026-03"),
      "analytics",
      "/api/v1/analytics/users/summary/count?from=2026-01&to=2026-03",
    ],
    [
      backendEndpoints.analytics.userTimeSeries("delta", "2026-01", "2026-03"),
      "analytics",
      "/api/v1/analytics/users/time-series/delta?from=2026-01&to=2026-03",
    ],
    [
      backendEndpoints.analytics.harvestTimeSeries(
        false,
        "sum",
        "2026-01",
        "2026-03",
      ),
      "analytics",
      "/api/v1/analytics/harvest/time-series/sum?from=2026-01&to=2026-03",
    ],
    [
      backendEndpoints.analytics.harvestTimeSeries(
        true,
        "sum",
        "2026-01",
        "2026-03",
      ),
      "analytics",
      "/api/v1/analytics/harvest/spatial/time-series/sum?from=2026-01&to=2026-03",
    ],
    // The harvest summary is served outside /analytics, and its spatial
    // variant is spelled "spartial": both exactly as the backend has them.
    [
      backendEndpoints.harvest.summary(false, "total", "2026-01", "2026-03"),
      "harvest",
      "/api/v1/harvest/summary/total?from=2026-01&to=2026-03",
    ],
    [
      backendEndpoints.harvest.summary(true, "count", "2026-01", "2026-03"),
      "harvest",
      "/api/v1/harvest/spartial/summary/count?from=2026-01&to=2026-03",
    ],
    [
      backendEndpoints.reminders.recipientRoles,
      "reminders",
      "/api/v1/reminders/recipient-options/roles",
    ],
    [
      backendEndpoints.reminders.recipientUsers("นาย ก"),
      "reminders",
      "/api/v1/reminders/recipient-options/users?q=%E0%B8%99%E0%B8%B2%E0%B8%A2%20%E0%B8%81",
    ],
    [
      backendEndpoints.reports.rawDataDownload(),
      "reports",
      "/api/v1/reports/raw-data/download",
    ],
    [
      backendEndpoints.reports.rawDataDownload("?sheets=FARM,HARVEST"),
      "reports",
      "/api/v1/reports/raw-data/download?sheets=FARM,HARVEST",
    ],
  ])("%j", (endpoint, group, expectedPath) => {
    expect(endpoint.group).toBe(group);
    expect(endpoint.path).toBe(expectedPath);
  });

  it("only uses groups that can be configured", () => {
    const groups = new Set<string>(backendGroups);
    expect(groups.has(backendEndpoints.tasks.list.group)).toBe(true);
    expect(
      groups.has(backendEndpoints.harvest.summary(false, "a", "b", "c").group),
    ).toBe(true);
  });
});

describe("per-group backend URL", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("uses BACKEND_URL for every group when nothing is overridden", () => {
    for (const group of backendGroups) {
      expect(backendUrlFor(group)).toBe("http://localhost:3001");
    }
    expect(backendHref(backendEndpoints.tasks.list)).toBe(
      "http://localhost:3001/api/v1/tasks",
    );
  });

  it("sends only the overridden group to its own backend", () => {
    vi.stubEnv("BACKEND_URL_TASKS", "http://hub.internal:8010");

    expect(backendHref(backendEndpoints.tasks.byId("t1"))).toBe(
      "http://hub.internal:8010/api/v1/tasks/t1",
    );
    expect(backendHref(backendEndpoints.forms.list)).toBe(
      "http://localhost:3001/api/v1/forms",
    );
  });

  it("treats an empty override as not set", () => {
    vi.stubEnv("BACKEND_URL_AUTH", "");

    expect(backendUrlFor("auth")).toBe("http://localhost:3001");
  });
});

// The map is only useful if nothing goes around it.
describe("no backend path outside the endpoint map", () => {
  const srcRoot = path.resolve(__dirname, "../../../../src");

  function sourceFiles(dir: string): string[] {
    return readdirSync(dir).flatMap((name) => {
      const full = path.join(dir, name);
      if (statSync(full).isDirectory()) return sourceFiles(full);
      return /\.(ts|tsx)$/.test(name) ? [full] : [];
    });
  }

  const files = sourceFiles(srcRoot).filter(
    (f) =>
      !f.endsWith(path.join("constants", "apiConstants.ts")) &&
      !f.endsWith(path.join("constants", "backendEndpoints.ts")),
  );

  it("builds no backend URL by hand", () => {
    const offenders = files.filter((f) =>
      readFileSync(f, "utf8").includes("${backendUrl}"),
    );
    expect(offenders).toEqual([]);
  });

  it("passes proxyToBackend an endpoint, never a path string", () => {
    const literalPath = /proxyToBackend(?:<[^>]*>)?\(\s*req,\s*[`"']/;
    const offenders = files.filter((f) =>
      literalPath.test(readFileSync(f, "utf8")),
    );
    expect(offenders).toEqual([]);
  });
});
