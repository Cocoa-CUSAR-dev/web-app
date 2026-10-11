import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { GET } from "@/app/api/v1/forms/handlers/catalog/route";

import { makeApiRequest } from "../../../../../../testUtils/nextRequest";

describe("GET /api/v1/forms/handlers/catalog", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("returns 401 without calling the backend when there is no token cookie", async () => {
    const res = await GET(makeApiRequest("/api/v1/forms/handlers/catalog"));

    expect(res.status).toBe(401);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("returns the backend's handler catalog with 200 on success", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ value: [{ id: "1" }] }), { status: 200 }),
    );

    const res = await GET(
      makeApiRequest("/api/v1/forms/handlers/catalog", { token: "t" }),
    );

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ value: [{ id: "1" }] });
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:3001/api/v1/forms/handlers/catalog",
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
      makeApiRequest("/api/v1/forms/handlers/catalog", { token: "t" }),
    );

    expect(res.status).toBe(500);
  });

  it("returns 500 for an unexpected error", async () => {
    vi.mocked(fetch).mockRejectedValue(new Error("network down"));

    const res = await GET(
      makeApiRequest("/api/v1/forms/handlers/catalog", { token: "t" }),
    );

    expect(res.status).toBe(500);
  });
});
