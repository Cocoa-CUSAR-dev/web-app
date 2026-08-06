import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { tokenName } from "@/core/constants";
import { proxy } from "@/proxy";

function makeRequest(url: string, token?: string) {
  const req = new NextRequest(new URL(url, "http://localhost"));
  if (token) {
    req.cookies.set(tokenName, token);
  }
  return req;
}

describe("proxy middleware", () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    vi.stubEnv("NODE_ENV", originalEnv ?? "test");
  });

  it("allows /debug routes through in development", () => {
    vi.stubEnv("NODE_ENV", "development");

    const res = proxy(makeRequest("/debug/map"));

    expect(res.status).toBe(200);
    expect(res.headers.get("x-middleware-next")).toBe("1");
  });

  it("redirects /debug routes when not in development", () => {
    vi.stubEnv("NODE_ENV", "production");

    const res = proxy(makeRequest("/debug/map"));

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("http://localhost/auth?page=login");
  });

  it("strips the clear param and deletes the token cookie on /auth?clear=true", () => {
    const res = proxy(makeRequest("/auth?clear=true", "sometoken"));

    expect(res.status).toBe(307);
    const location = new URL(res.headers.get("location")!);
    expect(location.searchParams.has("clear")).toBe(false);
    expect(res.cookies.get(tokenName)?.value).toBe("");
  });

  it("redirects an authenticated user away from /auth?page=login to the dashboard", () => {
    const res = proxy(makeRequest("/auth?page=login", "sometoken"));

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("http://localhost/dashboard");
  });

  it("lets an authenticated user reach /auth?page=reset-password", () => {
    const res = proxy(makeRequest("/auth?page=reset-password", "sometoken"));

    expect(res.headers.get("x-middleware-next")).toBe("1");
  });

  it("redirects an unauthenticated user away from reset-password to login", () => {
    const res = proxy(makeRequest("/auth?page=reset-password"));

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe(
      "http://localhost/auth?page=login",
    );
  });

  it("redirects to login when the page param is missing or invalid", () => {
    const missing = proxy(makeRequest("/auth"));
    expect(missing.headers.get("location")).toBe(
      "http://localhost/auth?page=login",
    );

    const invalid = proxy(makeRequest("/auth?page=nonsense"));
    expect(invalid.headers.get("location")).toBe(
      "http://localhost/auth?page=login",
    );
  });

  it("allows a valid /auth page for an unauthenticated visitor", () => {
    const res = proxy(makeRequest("/auth?page=register"));

    expect(res.headers.get("x-middleware-next")).toBe("1");
  });

  it("allows public paths through without a token", () => {
    const res = proxy(makeRequest("/"));

    expect(res.headers.get("x-middleware-next")).toBe("1");
  });

  it("redirects unauthenticated users away from protected, non-public paths", () => {
    const res = proxy(makeRequest("/dashboard"));

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe(
      "http://localhost/auth?page=login",
    );
  });

  it("allows authenticated users to reach protected paths", () => {
    const res = proxy(makeRequest("/dashboard", "sometoken"));

    expect(res.headers.get("x-middleware-next")).toBe("1");
  });
});
