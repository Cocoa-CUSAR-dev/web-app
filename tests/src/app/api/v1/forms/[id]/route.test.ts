import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { GET } from "@/app/api/v1/forms/[id]/route";

import { makeApiRequest } from "../../../../../testUtils/nextRequest";

describe("GET /api/v1/forms/[id]", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("returns 401 without calling the backend when there is no token cookie", async () => {
    const res = await GET(makeApiRequest("/api/v1/forms/abc"), {
      params: Promise.resolve({ id: "abc" }),
    });

    expect(res.status).toBe(401);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("fetches the given form id and returns 200 on success", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ value: { id: "abc" } }), { status: 200 }),
    );

    const res = await GET(makeApiRequest("/api/v1/forms/abc", { token: "t" }), {
      params: Promise.resolve({ id: "abc" }),
    });

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ value: { id: "abc" } });
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/v1/forms/abc"),
      expect.anything(),
    );
  });

  it("propagates the backend's error status and message", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ error: "form not found" }), {
        status: 404,
      }),
    );

    const res = await GET(
      makeApiRequest("/api/v1/forms/missing", { token: "t" }),
      { params: Promise.resolve({ id: "missing" }) },
    );

    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: "form not found" });
  });

  it("returns 500 for an unexpected error", async () => {
    vi.mocked(fetch).mockRejectedValue(new Error("network down"));

    const res = await GET(makeApiRequest("/api/v1/forms/abc", { token: "t" }), {
      params: Promise.resolve({ id: "abc" }),
    });

    expect(res.status).toBe(500);
  });
});
