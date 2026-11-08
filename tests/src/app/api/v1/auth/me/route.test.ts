import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { GET } from "@/app/api/v1/auth/me/route";

import { makeApiRequest } from "../../../../../testUtils/nextRequest";

// What the backend's /me answers ...
const backendMe = {
  user_id: "u-1",
  username: "r@test.com",
  roles: ["researcher"],
  must_reset_password: false,
  profiles: {
    researcher: { first_name: "R", last_name: "S", organization: "Chula" },
    farmer: null,
  },
};

// ... and the flat user the pages read.
const user = {
  userId: "u-1",
  email: "r@test.com",
  firstName: "R",
  lastName: "S",
  roles: ["researcher"],
  organization: "Chula",
  isRequiresPasswordReset: false,
  isPasswordReset: true,
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

  it("answers the signed-in user in the flat shape the pages read", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify(backendMe), { status: 200 }),
    );

    const res = await GET(makeApiRequest("/api/v1/auth/me", { token: "jwt" }));

    expect(res.status).toBe(200);
    expect((await res.json()).value).toEqual(user);
  });

  it("treats an expired session as anonymous, not as an error", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ detail: "expired" }), { status: 401 }),
    );

    const res = await GET(makeApiRequest("/api/v1/auth/me", { token: "old" }));

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ value: null });
  });

  it("reports a backend failure as an error", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ detail: "down" }), { status: 500 }),
    );

    const res = await GET(makeApiRequest("/api/v1/auth/me", { token: "jwt" }));

    expect(res.status).toBe(500);
  });
});
