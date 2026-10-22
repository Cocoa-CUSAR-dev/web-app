import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { refreshTokenName, tokenName } from "@/core/constants";
import { proxy } from "@/proxy";

import { clearSharedRefreshes } from "@/libs/backendSession";

import { tokenPair } from "./testUtils/nextRequest";

function makeRequest(url: string, token?: string, refreshToken?: string) {
  const req = new NextRequest(new URL(url, "http://localhost"));
  if (token) {
    req.cookies.set(tokenName, token);
  }
  if (refreshToken) {
    req.cookies.set(refreshTokenName, refreshToken);
  }
  return req;
}

describe("proxy middleware", () => {
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
    expect(res.headers.get("location")).toBe(
      "http://localhost/auth?page=login",
    );
  });

  it("strips the clear param and deletes the token cookie on /auth?clear=true", async () => {
    const res = await proxy(makeRequest("/auth?clear=true", "sometoken"));

    expect(res.status).toBe(307);
    const location = new URL(res.headers.get("location")!);
    expect(location.searchParams.has("clear")).toBe(false);
    expect(res.cookies.get(tokenName)?.value).toBe("");
    expect(res.cookies.get(refreshTokenName)?.value).toBe("");
  });

  it("redirects an authenticated user away from /auth?page=login to the dashboard", async () => {
    const res = await proxy(makeRequest("/auth?page=login", "sometoken"));

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("http://localhost/dashboard");
  });

  it("lets an authenticated user reach /auth?page=reset-password", async () => {
    const res = await proxy(
      makeRequest("/auth?page=reset-password", "sometoken"),
    );

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

  describe("when the access cookie has expired but the refresh cookie is still here", () => {
    beforeEach(() => {
      vi.stubGlobal("fetch", vi.fn());
      clearSharedRefreshes();
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it("asks the backend for a new pair and sets both cookies", async () => {
      vi.mocked(fetch).mockResolvedValue(
        new Response(
          JSON.stringify(
            tokenPair({ access_token: "a2", refresh_token: "r2" }),
          ),
          { status: 200 },
        ),
      );

      const res = await proxy(makeRequest("/dashboard", undefined, "r1"));

      const [url, init] = vi.mocked(fetch).mock.calls[0];
      expect(String(url)).toMatch(/\/api\/v1\/auth\/refresh$/);
      expect(JSON.parse(String(init?.body))).toEqual({ refresh_token: "r1" });
      expect(res.headers.get("x-middleware-next")).toBe("1");
      expect(res.cookies.get(tokenName)?.value).toBe("a2");
      expect(res.cookies.get(refreshTokenName)?.value).toBe("r2");
    });

    it("hands the new cookies to the page the request goes on to", async () => {
      vi.mocked(fetch).mockResolvedValue(
        new Response(
          JSON.stringify(
            tokenPair({ access_token: "a2", refresh_token: "r2" }),
          ),
          { status: 200 },
        ),
      );

      const res = await proxy(makeRequest("/dashboard", undefined, "r1"));

      // Next.js lists the request headers the middleware overrode here.
      const overridden = res.headers.get("x-middleware-override-headers");
      expect(overridden).toContain("cookie");
      const cookieHeader = res.headers.get("x-middleware-request-cookie");
      expect(cookieHeader).toContain(`${tokenName}=a2`);
      expect(cookieHeader).toContain(`${refreshTokenName}=r2`);
      expect(cookieHeader).not.toContain("=r1");
    });

    it("treats the person as signed in for this request", async () => {
      vi.mocked(fetch).mockResolvedValue(
        new Response(JSON.stringify(tokenPair()), { status: 200 }),
      );

      const res = await proxy(makeRequest("/auth?page=login", undefined, "r1"));

      expect(res.status).toBe(307);
      expect(res.headers.get("location")).toBe("http://localhost/dashboard");
      expect(res.cookies.get(tokenName)?.value).toBe("access-1");
    });

    it("sends the person to login but keeps the cookies when the refresh is refused", async () => {
      vi.mocked(fetch).mockResolvedValue(
        new Response(JSON.stringify({ detail: "expired" }), { status: 401 }),
      );

      const res = await proxy(makeRequest("/dashboard", undefined, "stale"));

      expect(res.status).toBe(307);
      expect(res.headers.get("location")).toBe(
        "http://localhost/auth?page=login",
      );
      // A refusal can be a request that lost a race with a parallel one
      // whose new cookies are on their way: clearing would sign the person out.
      expect(res.cookies.get(refreshTokenName)).toBeUndefined();
      expect(res.cookies.get(tokenName)).toBeUndefined();
    });

    it("does not ask for a new pair when the access cookie is still here", async () => {
      const res = await proxy(makeRequest("/dashboard", "live", "r1"));

      expect(fetch).not.toHaveBeenCalled();
      expect(res.headers.get("x-middleware-next")).toBe("1");
    });

    it("does not ask for a new pair for a static file", async () => {
      await proxy(makeRequest("/_next/static/chunk.js", undefined, "r1"));

      expect(fetch).not.toHaveBeenCalled();
    });
  });
});
