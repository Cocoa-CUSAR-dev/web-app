import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { POST } from "@/app/api/v1/login/route";

import { makeApiRequest } from "../../../../testUtils/nextRequest";

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

  it("forwards Set-Cookie headers and returns a success message when the backend accepts login", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(null, {
        status: 200,
        headers: { "set-cookie": "token=abc123; Path=/; HttpOnly" },
      }),
    );

    const res = await POST(
      makeApiRequest("/api/v1/login", {
        method: "POST",
        body: { username: "a@test.com", password: "pw" },
      }),
    );

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ message: "login success" });
    expect(res.headers.get("set-cookie")).toContain("token=abc123");
  });

  it("returns the backend's error status and message when login fails", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ error: "invalid credentials" }), {
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
