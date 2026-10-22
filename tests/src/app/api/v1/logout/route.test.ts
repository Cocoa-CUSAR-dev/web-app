import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { GET } from "@/app/api/v1/logout/route";
import { refreshTokenName, tokenName } from "@/core/constants";

import { makeApiRequest } from "../../../../testUtils/nextRequest";

function signedInRequest(refresh?: string) {
  const req = makeApiRequest("/api/v1/logout", { token: "access" });
  if (refresh) {
    req.cookies.set(refreshTokenName, refresh);
  }
  return req;
}

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
    expect(fetch).not.toHaveBeenCalled();
  });

  it("revokes the refresh token at backend-hub and clears both cookies", async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 204 }));

    const res = await GET(signedInRequest("refresh-1"));

    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:8000/api/v1/auth/logout",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ refresh_token: "refresh-1" }),
      }),
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ value: "logout successful", error: null });
    expect(res.cookies.get(tokenName)?.value).toBe("");
    expect(res.cookies.get(refreshTokenName)?.value).toBe("");
  });

  it("still signs out locally when backend-hub can't be reached", async () => {
    vi.mocked(fetch).mockRejectedValue(new Error("network down"));

    const res = await GET(signedInRequest("refresh-1"));

    expect(res.status).toBe(200);
    expect(res.cookies.get(tokenName)?.value).toBe("");
  });

  it("clears the cookies without calling the hub when there is no refresh token", async () => {
    const res = await GET(signedInRequest());

    expect(fetch).not.toHaveBeenCalled();
    expect(res.status).toBe(200);
    expect(res.cookies.get(tokenName)?.value).toBe("");
  });
});
