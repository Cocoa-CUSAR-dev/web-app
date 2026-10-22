import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { GET } from "@/app/api/v1/history/[date]/route";

import { makeApiRequest } from "../../../../../testUtils/nextRequest";

// docs-and-plan#231: the BFF route in front of GET /me/history/{date}, the raw
// answers of one day (the fallback when no diary was generated).
describe("GET /api/v1/history/[date]", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  const params = (date: string) => ({ params: Promise.resolve({ date }) });

  it("returns 401 without calling the backend when there is no token cookie", async () => {
    const res = await GET(
      makeApiRequest("/api/v1/history/2026-10-20"),
      params("2026-10-20"),
    );

    expect(res.status).toBe(401);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("proxies that day's answers and returns 200", async () => {
    const answers = [
      {
        fieldName: "harvest_weight",
        label: "น้ำหนัก",
        inputType: "FLOAT",
        rawValue: "12.5",
      },
    ];
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ value: answers }), { status: 200 }),
    );

    const res = await GET(
      makeApiRequest("/api/v1/history/2026-10-20", { token: "t" }),
      params("2026-10-20"),
    );

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ value: answers });
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:3001/api/v1/me/history/2026-10-20",
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("passes a 400 for a malformed date through", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ error: "invalid date" }), { status: 400 }),
    );

    const res = await GET(
      makeApiRequest("/api/v1/history/20-10-2026", { token: "t" }),
      params("20-10-2026"),
    );

    expect(res.status).toBe(400);
  });
});
