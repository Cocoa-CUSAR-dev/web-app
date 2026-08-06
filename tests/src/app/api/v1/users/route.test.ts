import { cookies } from "next/headers";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { GET, POST } from "@/app/api/v1/users/route";

import { makeApiRequest } from "../../../../testUtils/nextRequest";

vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

function mockCookieStore(value?: string) {
  vi.mocked(cookies).mockResolvedValue({
    get: () => (value ? { name: "token", value } : undefined),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any);
}

describe("GET /api/v1/users", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns 400 when there is no token cookie", async () => {
    mockCookieStore(undefined);

    const res = await GET(makeApiRequest("/api/v1/users"));

    expect(res?.status).toBe(400);
    expect(await res?.json()).toEqual({
      error: "missing authorization token",
    });
  });

  it.fails(
    "returns a Response when authenticated (currently falls through to undefined - lookup branches are unimplemented, see BUG note in test.md)",
    async () => {
      // Both the `id` and "find all" branches are empty comments with no
      // return, so a valid request currently falls through to `undefined`.
      // Only the minimal "must return a Response" contract is asserted here,
      // not the shape of the not-yet-implemented user list/lookup.
      mockCookieStore("valid-token");

      const res = await GET(makeApiRequest("/api/v1/users"));

      expect(res).toBeInstanceOf(Response);
    },
  );
});

describe("POST /api/v1/users", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("returns 401 without calling the backend when there is no token cookie", async () => {
    const res = await POST(
      makeApiRequest("/api/v1/users", {
        method: "POST",
        body: { username: "new@test.com", password: "pw" },
      }),
    );

    expect(res.status).toBe(401);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("returns 400 when username or password is missing", async () => {
    const res = await POST(
      makeApiRequest("/api/v1/users", {
        method: "POST",
        body: { username: "new@test.com" },
        token: "t",
      }),
    );

    expect(res.status).toBe(400);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("returns the created user with 201 on success", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ value: { username: "new@test.com" } }), {
        status: 201,
      }),
    );

    const res = await POST(
      makeApiRequest("/api/v1/users", {
        method: "POST",
        body: { username: "new@test.com", password: "pw" },
        token: "t",
      }),
    );

    expect(res.status).toBe(201);
    expect(await res.json()).toEqual({ value: { username: "new@test.com" } });
  });

  it("propagates the backend's error status and message", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ error: "username taken" }), {
        status: 409,
      }),
    );

    const res = await POST(
      makeApiRequest("/api/v1/users", {
        method: "POST",
        body: { username: "dup@test.com", password: "pw" },
        token: "t",
      }),
    );

    expect(res.status).toBe(409);
    expect(await res.json()).toEqual({ error: "username taken" });
  });

  it("returns 500 for an unexpected error", async () => {
    vi.mocked(fetch).mockRejectedValue(new Error("network down"));

    const res = await POST(
      makeApiRequest("/api/v1/users", {
        method: "POST",
        body: { username: "new@test.com", password: "pw" },
        token: "t",
      }),
    );

    expect(res.status).toBe(500);
  });
});
