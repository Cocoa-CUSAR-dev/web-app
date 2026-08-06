import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { GET } from "@/app/api/v1/analytics/user/summary/route";

import { makeApiRequest } from "../../../../../../testUtils/nextRequest";

const validQuery = "mode=count&from=2024-01&to=2024-02";

describe("GET /api/v1/analytics/user/summary", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("returns 401 without calling the backend when there is no token cookie", async () => {
    const res = await GET(
      makeApiRequest(`/api/v1/analytics/user/summary?${validQuery}`),
    );

    expect(res.status).toBe(401);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("returns 400 when mode is missing", async () => {
    const res = await GET(
      makeApiRequest("/api/v1/analytics/user/summary?from=2024-01&to=2024-02", {
        token: "t",
      }),
    );

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "missing data mode" });
  });

  it("returns 400 when from/to dates fail the format check", async () => {
    const res = await GET(
      makeApiRequest(
        "/api/v1/analytics/user/summary?mode=count&from=bad&to=2024-02",
        { token: "t" },
      ),
    );

    expect(res.status).toBe(400);
  });

  it("returns 400 for a mode outside userSummaryMode", async () => {
    const res = await GET(
      makeApiRequest(
        "/api/v1/analytics/user/summary?mode=nonsense&from=2024-01&to=2024-02",
        { token: "t" },
      ),
    );

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "invalid data mode" });
  });

  it("returns the backend's summary data with 200 on success", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ value: { data: { value: 5 } } }), {
        status: 200,
      }),
    );

    const res = await GET(
      makeApiRequest(`/api/v1/analytics/user/summary?${validQuery}`, {
        token: "t",
      }),
    );

    expect(res.status).toBe(200);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("api/v1/analytics/users/summary/count"),
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("propagates the backend's error status and message", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ error: "server error" }), {
        status: 500,
      }),
    );

    const res = await GET(
      makeApiRequest(`/api/v1/analytics/user/summary?${validQuery}`, {
        token: "t",
      }),
    );

    expect(res.status).toBe(500);
  });

  it("returns 500 for an unexpected error", async () => {
    vi.mocked(fetch).mockRejectedValue(new Error("network down"));

    const res = await GET(
      makeApiRequest(`/api/v1/analytics/user/summary?${validQuery}`, {
        token: "t",
      }),
    );

    expect(res.status).toBe(500);
  });
});
