import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { GET } from "@/app/api/v1/logout/route";

import { makeApiRequest } from "../../../../testUtils/nextRequest";

describe("GET /api/v1/logout", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("returns 401 without calling the backend when no token cookie is present", async () => {
    const res = await GET(makeApiRequest("/api/v1/logout"));

    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({
      error: "missing authentication token",
    });
    expect(fetch).not.toHaveBeenCalled();
  });

  it("propagates the backend's error status and message", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ error: "session expired" }), {
        status: 401,
      }),
    );

    const res = await GET(makeApiRequest("/api/v1/logout", { token: "t" }));

    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "session expired" });
  });

  it.fails(
    "does not report success when the backend omits Set-Cookie (currently returns 200 with an error body, see BUG note in test.md)",
    async () => {
      // Route quirk: a missing Set-Cookie throws
      // `new HttpError(backendResponse.status, ...)` using the *successful*
      // backend status (200), so the response ends up 200 with an
      // error-shaped body instead of a real 4xx/5xx. The exact "correct"
      // status isn't specified anywhere, so this only asserts the one thing
      // we do know for certain: an error response shouldn't claim success.
      vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 200 }));

      const res = await GET(
        makeApiRequest("/api/v1/logout", { token: "t" }),
      );

      expect(res.status).not.toBe(200);
    },
  );

  it("returns a success body and forwards the first Set-Cookie header", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(null, {
        status: 200,
        headers: { "set-cookie": "token=; Max-Age=0" },
      }),
    );

    const res = await GET(makeApiRequest("/api/v1/logout", { token: "t" }));

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      value: "logout successful",
      error: null,
    });
    expect(res.headers.get("set-cookie")).toContain("token=");
  });

  it("returns 500 for an unexpected error", async () => {
    vi.mocked(fetch).mockRejectedValue(new Error("network down"));

    const res = await GET(makeApiRequest("/api/v1/logout", { token: "t" }));

    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: "Internal Server Error" });
  });
});
