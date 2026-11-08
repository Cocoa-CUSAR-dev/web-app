import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { POST } from "@/app/api/v1/login/route";

import { makeApiRequest, tokenPair } from "../../../../testUtils/nextRequest";

describe("POST /api/v1/login", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("returns 400 without calling the backend when username is missing", async () => {
    const res = await POST(
      makeApiRequest("/api/v1/login", {
        method: "POST",
        body: { password: "pw" },
      }),
    );

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({
      error: "missing username or password",
    });
    expect(fetch).not.toHaveBeenCalled();
  });

  it("returns 400 without calling the backend when password is missing", async () => {
    const res = await POST(
      makeApiRequest("/api/v1/login", {
        method: "POST",
        body: { username: "a@test.com" },
      }),
    );

    expect(res.status).toBe(400);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("stores the token pair in cookies and returns a success message when the backend accepts login", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify(tokenPair()), { status: 200 }),
    );

    const res = await POST(
      makeApiRequest("/api/v1/login", {
        method: "POST",
        body: { username: "a@test.com", password: "pw" },
      }),
    );

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ message: "login success" });
    expect(res.cookies.get("token")).toMatchObject({
      value: "access-1",
      httpOnly: true,
      maxAge: 3600,
      path: "/",
    });
    expect(res.cookies.get("refresh_token")).toMatchObject({
      value: "refresh-1",
      httpOnly: true,
      maxAge: 90 * 24 * 60 * 60,
    });
  });

  it("sends the username and password to the backend's login", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify(tokenPair()), { status: 200 }),
    );

    await POST(
      makeApiRequest("/api/v1/login", {
        method: "POST",
        body: { username: "a@test.com", password: "pw" },
      }),
    );

    const [url, init] = vi.mocked(fetch).mock.calls[0];
    expect(String(url)).toMatch(/\/api\/v1\/auth\/login$/);
    expect(JSON.parse(String(init?.body))).toEqual({
      username: "a@test.com",
      password: "pw",
    });
  });

  it("returns the backend's error status and message when login fails", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ detail: "invalid credentials" }), {
        status: 401,
      }),
    );

    const res = await POST(
      makeApiRequest("/api/v1/login", {
        method: "POST",
        body: { username: "a@test.com", password: "wrong" },
      }),
    );

    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "invalid credentials" });
    expect(res.cookies.get("token")).toBeUndefined();
  });

  it("falls back to the status text when the backend's detail is a validation list", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ detail: [{ msg: "field required" }] }), {
        status: 422,
        statusText: "Unprocessable Content",
      }),
    );

    const res = await POST(
      makeApiRequest("/api/v1/login", {
        method: "POST",
        body: { username: "a@test.com", password: "pw" },
      }),
    );

    expect(res.status).toBe(422);
    expect(await res.json()).toEqual({ error: "Unprocessable Content" });
  });

  it("returns 500 for an unexpected error", async () => {
    vi.mocked(fetch).mockRejectedValue(new Error("network down"));

    const res = await POST(
      makeApiRequest("/api/v1/login", {
        method: "POST",
        body: { username: "a@test.com", password: "pw" },
      }),
    );

    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: "Internal Server Error" });
  });
});
