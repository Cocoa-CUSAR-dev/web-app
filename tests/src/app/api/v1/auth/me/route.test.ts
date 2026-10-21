import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { GET } from "@/app/api/v1/auth/me/route";

import { makeApiRequest } from "../../../../../testUtils/nextRequest";

const user = {
  userId: "u-1",
  email: "r@test.com",
  firstName: "R",
  lastName: "S",
  roles: ["researcher"],
  organization: "Chula",
};

describe("GET /api/v1/auth/me", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("answers an anonymous visitor with value: null, without calling the backend", async () => {
    const res = await GET(makeApiRequest("/api/v1/auth/me"));

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ value: null });
    expect(fetch).not.toHaveBeenCalled();
  });

  it("passes the signed-in user through", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ value: user, error: null }), {
        status: 200,
      }),
    );

    const res = await GET(makeApiRequest("/api/v1/auth/me", { token: "jwt" }));

    expect(res.status).toBe(200);
    expect((await res.json()).value).toEqual(user);
  });

  it("treats an expired session as anonymous, not as an error", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ error: "expired" }), { status: 401 }),
    );

    const res = await GET(makeApiRequest("/api/v1/auth/me", { token: "old" }));

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ value: null });
  });

  it("reports a backend failure as an error", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ error: "down" }), { status: 500 }),
    );

    const res = await GET(makeApiRequest("/api/v1/auth/me", { token: "jwt" }));

    expect(res.status).toBe(500);
  });
});
