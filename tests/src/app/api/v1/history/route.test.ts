import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { GET } from "@/app/api/v1/history/route";

import { makeApiRequest } from "../../../../testUtils/nextRequest";

// docs-and-plan#231: the BFF route in front of web-backend's GET /me/history.
describe("GET /api/v1/history", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("returns 401 without calling the backend when there is no token cookie", async () => {
    const res = await GET(makeApiRequest("/api/v1/history"));

    expect(res.status).toBe(401);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("proxies the farmer's days and returns 200", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ value: ["2026-10-20", "2026-10-18"] }), {
        status: 200,
      }),
    );

    const res = await GET(makeApiRequest("/api/v1/history", { token: "t" }));

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ value: ["2026-10-20", "2026-10-18"] });
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:3001/api/v1/me/history",
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("forwards page and size", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ value: [] }), { status: 200 }),
    );

    await GET(makeApiRequest("/api/v1/history?page=2&size=50", { token: "t" }));

    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:3001/api/v1/me/history?page=2&size=50",
      expect.anything(),
    );
  });

  it("drops any other query parameter instead of forwarding it", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ value: [] }), { status: 200 }),
    );

    // Whose history it is comes from the session; a user_id in the URL must
    // never reach the backend.
    await GET(
      makeApiRequest("/api/v1/history?page=1&user_id=someone-else", {
        token: "t",
      }),
    );

    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:3001/api/v1/me/history?page=1",
      expect.anything(),
    );
  });

  it("passes the backend's status through when it refuses", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ error: "page must be >= 0" }), {
        status: 400,
      }),
    );

    const res = await GET(
      makeApiRequest("/api/v1/history?page=-1", { token: "t" }),
    );

    expect(res.status).toBe(400);
  });
});
