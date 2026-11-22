import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { POST } from "@/app/api/v1/admin/password-resets/route";

import { makeApiRequest } from "../../../../../testUtils/nextRequest";

function reset(body: unknown, token?: string) {
  return POST(
    makeApiRequest("/api/v1/admin/password-resets", {
      method: "POST",
      body,
      token,
    }),
  );
}

describe("POST /api/v1/admin/password-resets", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("returns 401 without calling the backend when there is no token cookie", async () => {
    const res = await reset({ login: "0811111111" });

    expect(res.status).toBe(401);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("returns 400 when the login is blank", async () => {
    const res = await reset({ login: " " }, "t");

    expect(res.status).toBe(400);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("forwards the token of the admin and returns the temporary password", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(
        JSON.stringify({ username: "0811111111", temporary_password: "abc" }),
        { status: 201 },
      ),
    );

    const res = await reset({ login: " 0811111111 " }, "admin-token");

    expect(res.status).toBe(201);
    expect(await res.json()).toEqual({
      value: { username: "0811111111", temporary_password: "abc" },
      error: null,
    });
    const [url, init] = vi.mocked(fetch).mock.calls[0];
    expect(new URL(String(url)).pathname).toBe("/api/v1/admin/password-resets");
    expect((init?.headers as Record<string, string>).Authorization).toBe(
      "Bearer admin-token",
    );
    expect(JSON.parse(String(init?.body))).toEqual({ login: "0811111111" });
  });

  it("passes on a 403 for someone who is not an admin", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ detail: "forbidden" }), { status: 403 }),
    );

    const res = await reset({ login: "0811111111" }, "t");

    expect(res.status).toBe(403);
  });
});
