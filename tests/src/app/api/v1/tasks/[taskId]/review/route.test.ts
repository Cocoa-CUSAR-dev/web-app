import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { GET } from "@/app/api/v1/tasks/[taskId]/review/route";

import { makeApiRequest } from "../../../../../../testUtils/nextRequest";

describe("GET /api/v1/tasks/[taskId]/review", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("returns 401 without calling the backend when there is no token cookie", async () => {
    const res = await GET(makeApiRequest("/api/v1/tasks/abc/review"), {
      params: Promise.resolve({ taskId: "abc" }),
    });

    expect(res.status).toBe(401);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("proxies the review list for the task and returns 200", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ value: [{ responseId: "r1" }] }), {
        status: 200,
      }),
    );

    const res = await GET(
      makeApiRequest("/api/v1/tasks/abc/review", { token: "t" }),
      { params: Promise.resolve({ taskId: "abc" }) },
    );

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ value: [{ responseId: "r1" }] });
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:3001/api/v1/tasks/abc/review",
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("forwards aiOnly, page and size", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ value: [] }), { status: 200 }),
    );

    await GET(
      makeApiRequest("/api/v1/tasks/abc/review?aiOnly=true&page=2&size=10", {
        token: "t",
      }),
      { params: Promise.resolve({ taskId: "abc" }) },
    );

    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:3001/api/v1/tasks/abc/review?aiOnly=true&page=2&size=10",
      expect.anything(),
    );
  });

  it("drops any other query parameter instead of forwarding it", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ value: [] }), { status: 200 }),
    );

    await GET(
      makeApiRequest("/api/v1/tasks/abc/review?page=1&evil=../../x", {
        token: "t",
      }),
      { params: Promise.resolve({ taskId: "abc" }) },
    );

    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:3001/api/v1/tasks/abc/review?page=1",
      expect.anything(),
    );
  });

  it("propagates the backend's error status and message", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ error: "Access Denied" }), { status: 403 }),
    );

    const res = await GET(
      makeApiRequest("/api/v1/tasks/abc/review", { token: "t" }),
      { params: Promise.resolve({ taskId: "abc" }) },
    );

    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({ error: "Access Denied" });
  });
});
