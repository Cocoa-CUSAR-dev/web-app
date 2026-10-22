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

  it("revokes the refresh token on the backend and clears both cookies", async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 204 }));

    const res = await GET(
      makeApiRequest("/api/v1/logout", { token: "t", refreshToken: "r" }),
    );

    const [url, init] = vi.mocked(fetch).mock.calls[0];
    expect(String(url)).toMatch(/\/api\/v1\/auth\/logout$/);
    expect(init?.method).toBe("POST");
    expect(JSON.parse(String(init?.body))).toEqual({ refresh_token: "r" });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      value: "logout successful",
      error: null,
    });
    expect(res.cookies.get("token")?.value).toBe("");
    expect(res.cookies.get("refresh_token")?.value).toBe("");
  });

  it("clears the cookies even when the backend refuses", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ detail: "session expired" }), {
        status: 401,
      }),
    );

    const res = await GET(
      makeApiRequest("/api/v1/logout", { token: "t", refreshToken: "r" }),
    );

    expect(res.status).toBe(200);
    expect(res.cookies.get("token")?.value).toBe("");
    expect(res.cookies.get("refresh_token")?.value).toBe("");
  });

  it("clears the cookies even when the backend cannot be reached", async () => {
    vi.mocked(fetch).mockRejectedValue(new Error("network down"));

    const res = await GET(
      makeApiRequest("/api/v1/logout", { token: "t", refreshToken: "r" }),
    );

    expect(res.status).toBe(200);
    expect(res.cookies.get("token")?.value).toBe("");
    expect(res.cookies.get("refresh_token")?.value).toBe("");
  });

  it("does not call the backend when there is no refresh token to revoke", async () => {
    const res = await GET(makeApiRequest("/api/v1/logout", { token: "t" }));

    expect(fetch).not.toHaveBeenCalled();
    expect(res.status).toBe(200);
    expect(res.cookies.get("token")?.value).toBe("");
  });
});
