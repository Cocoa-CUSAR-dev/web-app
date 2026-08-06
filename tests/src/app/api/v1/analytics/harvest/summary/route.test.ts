import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { POST } from "@/app/api/v1/analytics/harvest/summary/route";

import { makeApiRequest } from "../../../../../../testUtils/nextRequest";

const validQuery = "mode=total&from=2024-01&to=2024-02";

describe("POST /api/v1/analytics/harvest/summary", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("returns 401 without calling the backend when there is no token cookie", async () => {
    const res = await POST(
      makeApiRequest(`/api/v1/analytics/harvest/summary?${validQuery}`, {
        method: "POST",
        body: {},
      }),
    );

    expect(res.status).toBe(401);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("returns 400 when mode is missing", async () => {
    const res = await POST(
      makeApiRequest(
        "/api/v1/analytics/harvest/summary?from=2024-01&to=2024-02",
        { method: "POST", body: {}, token: "t" },
      ),
    );

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "missing data mode" });
  });

  it("returns 400 when from/to dates fail the format check", async () => {
    const res = await POST(
      makeApiRequest(
        "/api/v1/analytics/harvest/summary?mode=total&from=bad&to=2024-02",
        { method: "POST", body: {}, token: "t" },
      ),
    );

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({
      error: "invalid or missing request parameter",
    });
  });

  it("returns 400 for a mode outside harvestSummaryMode", async () => {
    const res = await POST(
      makeApiRequest(
        "/api/v1/analytics/harvest/summary?mode=nonsense&from=2024-01&to=2024-02",
        { method: "POST", body: {}, token: "t" },
      ),
    );

    expect(res.status).toBe(400);
  });

  it("uses the plain GET summary endpoint when no polygon is given", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ value: { data: { value: 1 } } }), {
        status: 200,
      }),
    );

    await POST(
      makeApiRequest(`/api/v1/analytics/harvest/summary?${validQuery}`, {
        method: "POST",
        body: {},
        token: "t",
      }),
    );

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("api/v1/harvest/summary/total"),
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("switches to the spatial POST summary endpoint when a polygon is given", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ value: { data: { value: 1 } } }), {
        status: 200,
      }),
    );

    await POST(
      makeApiRequest(`/api/v1/analytics/harvest/summary?${validQuery}`, {
        method: "POST",
        body: { polygon: { type: "Polygon", coordinates: [] } },
        token: "t",
      }),
    );

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("api/v1/harvest/spartial/summary/total"),
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("propagates the backend's error status and message", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ error: "server error" }), {
        status: 500,
      }),
    );

    const res = await POST(
      makeApiRequest(`/api/v1/analytics/harvest/summary?${validQuery}`, {
        method: "POST",
        body: {},
        token: "t",
      }),
    );

    expect(res.status).toBe(500);
  });

  it("returns 500 for an unexpected error", async () => {
    vi.mocked(fetch).mockRejectedValue(new Error("network down"));

    const res = await POST(
      makeApiRequest(`/api/v1/analytics/harvest/summary?${validQuery}`, {
        method: "POST",
        body: {},
        token: "t",
      }),
    );

    expect(res.status).toBe(500);
  });
});
