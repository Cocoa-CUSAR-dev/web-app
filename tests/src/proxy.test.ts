import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { refreshTokenName, tokenName } from "@/core/constants";
import { proxy } from "@/proxy";

import { hubJson, jwtExpiringIn, tokenPair } from "./testUtils/hub";

function makeRequest(url: string, token?: string, refresh?: string) {
  const req = new NextRequest(new URL(url, "http://localhost"));
  if (token) {
    req.cookies.set(tokenName, token);
  }
  if (refresh) {
    req.cookies.set(refreshTokenName, refresh);
  }
  return req;
}

describe("proxy middleware", async () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    vi.stubEnv("NODE_ENV", originalEnv ?? "test");
  });

  it("allows /debug routes through in development", async () => {
    vi.stubEnv("NODE_ENV", "development");

    const res = await proxy(makeRequest("/debug/map"));

    expect(res.status).toBe(200);
    expect(res.headers.get("x-middleware-next")).toBe("1");
  });

  it("redirects /debug routes when not in development", async () => {
    vi.stubEnv("NODE_ENV", "production");

    const res = await proxy(makeRequest("/debug/map"));

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("http://localhost/auth?page=login");
  });

  it("strips the clear param and deletes the token cookie on /auth?clear=true", async () => {
    const res = await proxy(makeRequest("/auth?clear=true", "sometoken"));

    expect(res.status).toBe(307);
    const location = new URL(res.headers.get("location")!);
    expect(location.searchParams.has("clear")).toBe(false);
    expect(res.cookies.get(tokenName)?.value).toBe("");
  });

  it("redirects an authenticated user away from /auth?page=login to the dashboard", async () => {
    const res = await proxy(makeRequest("/auth?page=login", "sometoken"));

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("http://localhost/dashboard");
  });

  it("lets an authenticated user reach /auth?page=reset-password", async () => {
    const res = await proxy(makeRequest("/auth?page=reset-password", "sometoken"));

    expect(res.headers.get("x-middleware-next")).toBe("1");
  });

  it("redirects an unauthenticated user away from reset-password to login", async () => {
    const res = await proxy(makeRequest("/auth?page=reset-password"));

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe(
      "http://localhost/auth?page=login",
    );
  });

  it("redirects to login when the page param is missing or invalid", async () => {
    const missing = await proxy(makeRequest("/auth"));
    expect(missing.headers.get("location")).toBe(
      "http://localhost/auth?page=login",
    );

    const invalid = await proxy(makeRequest("/auth?page=nonsense"));
    expect(invalid.headers.get("location")).toBe(
      "http://localhost/auth?page=login",
    );
  });

  it("allows a valid /auth page for an unauthenticated visitor", async () => {
    const res = await proxy(makeRequest("/auth?page=register"));

    expect(res.headers.get("x-middleware-next")).toBe("1");
  });

  it("allows public paths through without a token", async () => {
    const res = await proxy(makeRequest("/"));

    expect(res.headers.get("x-middleware-next")).toBe("1");
  });

  it("redirects unauthenticated users away from protected, non-public paths", async () => {
    const res = await proxy(makeRequest("/dashboard"));

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe(
      "http://localhost/auth?page=login",
    );
  });

  it("allows authenticated users to reach protected paths", async () => {
    const res = await proxy(makeRequest("/dashboard", "sometoken"));

    expect(res.headers.get("x-middleware-next")).toBe("1");
  });

  describe("keeping the backend-hub session alive", () => {
    beforeEach(() => {
      vi.stubGlobal("fetch", vi.fn());
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it("leaves a token with plenty of time left alone", async () => {
      const res = await proxy(makeRequest("/dashboard", jwtExpiringIn(1800), "refresh-1"));

      expect(fetch).not.toHaveBeenCalled();
      expect(res.headers.get("x-middleware-next")).toBe("1");
    });

    it("refreshes an expiring token before the page runs, for the page and the browser", async () => {
      const pair = tokenPair({ refresh_token: "refresh-2" });
      vi.mocked(fetch).mockResolvedValue(hubJson(pair));

      const res = await proxy(makeRequest("/dashboard", jwtExpiringIn(10), "refresh-1"));

      expect(fetch).toHaveBeenCalledWith(
        "http://localhost:8000/api/v1/auth/refresh",
        expect.objectContaining({ body: JSON.stringify({ refresh_token: "refresh-1" }) }),
      );
      expect(res.headers.get("x-middleware-next")).toBe("1");
      // The browser keeps the new pair...
      expect(res.cookies.get(tokenName)?.value).toBe(pair.access_token);
      expect(res.cookies.get(refreshTokenName)?.value).toBe("refresh-2");
      // ...and the page rendering this request already sees the new token.
      expect(res.headers.get("x-middleware-request-cookie")).toContain(pair.access_token);
    });

    it("signs a visitor back in from the refresh token alone", async () => {
      vi.mocked(fetch).mockResolvedValue(hubJson(tokenPair()));

      const res = await proxy(makeRequest("/dashboard", undefined, "refresh-1"));

      expect(res.headers.get("x-middleware-next")).toBe("1");
    });

    it("signs out when backend-hub refuses the refresh token", async () => {
      vi.mocked(fetch).mockResolvedValue(hubJson({ detail: "revoked" }, 401));

      const res = await proxy(makeRequest("/dashboard", jwtExpiringIn(-60), "stolen"));

      expect(res.status).toBe(307);
      expect(res.headers.get("location")).toBe("http://localhost/auth?page=login");
      expect(res.cookies.get(tokenName)?.value).toBe("");
      expect(res.cookies.get(refreshTokenName)?.value).toBe("");
    });

    it("never calls the hub for static files", async () => {
      await proxy(makeRequest("/_next/static/chunk.js", jwtExpiringIn(10), "refresh-1"));

      expect(fetch).not.toHaveBeenCalled();
    });
  });
});
