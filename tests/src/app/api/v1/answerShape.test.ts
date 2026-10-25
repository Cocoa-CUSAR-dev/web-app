import type { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { hubList } from "../../../testUtils/hubShapes";
import { makeApiRequest } from "../../../testUtils/nextRequest";

// Every route that hands the backend's answer straight to a page. The pages
// read { value, error}; the merged backend (the hub) answers with the data
// itself, so each of these must wrap it -- and must NOT wrap an answer that
// web-backend already wrapped (a group can still be pointed at web-backend with
// BACKEND_URL_<GROUP>). The dashboard charts broke on exactly this.
//
// Each route types its own { params }, so the module is loaded as unknown and
// called through this one loose handler type.
type Handler = (
  req: NextRequest,
  ctx: { params: Promise<Record<string, string>> },
) => Promise<Response>;

type RouteCase = {
  name: string;
  load: () => Promise<unknown>;
  url: string;
  params?: Record<string, string>;
};

const routes: RouteCase[] = [
  {
    name: "forms",
    load: () => import("@/app/api/v1/forms/route"),
    url: "/api/v1/forms",
  },
  {
    name: "forms/handlers",
    load: () => import("@/app/api/v1/forms/handlers/route"),
    url: "/api/v1/forms/handlers",
  },
  {
    name: "forms/handlers/catalog",
    load: () => import("@/app/api/v1/forms/handlers/catalog/route"),
    url: "/api/v1/forms/handlers/catalog",
  },
  {
    name: "forms/handlers/[handler]/fields",
    load: () => import("@/app/api/v1/forms/handlers/[handler]/fields/route"),
    url: "/api/v1/forms/handlers/farm_activity/fields",
    params: { handler: "farm_activity" },
  },
  {
    name: "forms/[id]",
    load: () => import("@/app/api/v1/forms/[id]/route"),
    url: "/api/v1/forms/f1",
    params: { id: "f1" },
  },
  {
    name: "forms/[id]/reminder",
    load: () => import("@/app/api/v1/forms/[id]/reminder/route"),
    url: "/api/v1/forms/f1/reminder",
    params: { id: "f1" },
  },
  {
    name: "reminders/recipient-options/roles",
    load: () => import("@/app/api/v1/reminders/recipient-options/roles/route"),
    url: "/api/v1/reminders/recipient-options/roles",
  },
  {
    name: "reminders/recipient-options/users",
    load: () => import("@/app/api/v1/reminders/recipient-options/users/route"),
    url: "/api/v1/reminders/recipient-options/users?q=som",
  },
  {
    name: "history",
    load: () => import("@/app/api/v1/history/route"),
    url: "/api/v1/history",
  },
  {
    name: "history/[date]",
    load: () => import("@/app/api/v1/history/[date]/route"),
    url: "/api/v1/history/2026-10-05",
    params: { date: "2026-10-05" },
  },
  {
    name: "diaries/[date]",
    load: () => import("@/app/api/v1/diaries/[date]/route"),
    url: "/api/v1/diaries/2026-10-05",
    params: { date: "2026-10-05" },
  },
  {
    name: "tasks",
    load: () => import("@/app/api/v1/tasks/route"),
    url: "/api/v1/tasks",
  },
  {
    name: "tasks/[taskId]",
    load: () => import("@/app/api/v1/tasks/[taskId]/route"),
    url: "/api/v1/tasks/t1",
    params: { taskId: "t1" },
  },
  {
    name: "tasks/[taskId]/responses",
    load: () => import("@/app/api/v1/tasks/[taskId]/responses/route"),
    url: "/api/v1/tasks/t1/responses",
    params: { taskId: "t1" },
  },
  {
    name: "tasks/[taskId]/review",
    load: () => import("@/app/api/v1/tasks/[taskId]/review/route"),
    url: "/api/v1/tasks/t1/review",
    params: { taskId: "t1" },
  },
];

async function call(route: RouteCase, backendBody: unknown) {
  vi.mocked(fetch).mockResolvedValue(
    new Response(JSON.stringify(backendBody), { status: 200 }),
  );
  const { GET } = (await route.load()) as { GET: Handler };
  return GET(makeApiRequest(route.url, { token: "t" }), {
    params: Promise.resolve(route.params ?? {}),
  });
}

describe("what the pages get from a route that forwards the backend's answer", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it.each(routes)(
    "$name: wraps the hub's bare answer in { value, error }",
    async (route) => {
      const res = await call(route, hubList);

      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({ value: hubList, error: null });
    },
  );

  it.each(routes)(
    "$name: leaves an answer web-backend already wrapped alone",
    async (route) => {
      const wrapped = { value: hubList, error: null };

      const res = await call(route, wrapped);

      expect(await res.json()).toEqual(wrapped);
    },
  );
});
