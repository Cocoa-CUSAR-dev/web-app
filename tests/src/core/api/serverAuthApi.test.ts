import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { serverAuthApi } from "@/core/api/serverAuthApi";
import { CustomRedirectError } from "@/core/error";

describe("serverAuthApi.authMe", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("asks backend-hub's /me with the Bearer token and maps it for the UI", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(
        JSON.stringify({
          user_id: "u-1",
          username: "a@test.com",
          roles: ["admin"],
          must_reset_password: true,
          profiles: { researcher: null },
        }),
        { status: 200 },
      ),
    );

    const result = await serverAuthApi.authMe("abc");

    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:8000/api/v1/me",
      expect.objectContaining({ headers: { Authorization: "Bearer abc" } }),
    );
    expect(result).toEqual({
      userId: "u-1",
      email: "a@test.com",
      firstName: "",
      lastName: "",
      organization: "",
      roles: ["admin"],
      isRequiresPasswordReset: true,
      isPasswordReset: false,
    });
  });

  it("sends a visitor without an access token to login, without calling the hub", async () => {
    await expect(serverAuthApi.authMe(undefined)).rejects.toThrow(CustomRedirectError);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("throws CustomRedirectError to the login page on a 401 response", async () => {
    // A fresh Response per call: Response bodies can only be read once, and
    // authMe reads .json() internally, so a shared instance would fail on
    // a second invocation.
    vi.mocked(fetch).mockImplementation(
      async () =>
        new Response(JSON.stringify({ error: "unauthorized" }), {
          status: 401,
        }),
    );

    await expect(serverAuthApi.authMe("bad")).rejects.toThrow(
      CustomRedirectError,
    );
    await expect(serverAuthApi.authMe("bad")).rejects.toMatchObject({
      message: "/auth?page=login&clear=true",
    });
  });

  it("returns null for non-401 backend errors without redirecting", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ error: "server exploded" }), {
        status: 500,
      }),
    );

    const result = await serverAuthApi.authMe("abc");

    expect(result).toBeNull();
  });

  it("returns null when fetch itself rejects", async () => {
    vi.mocked(fetch).mockRejectedValue(new Error("network down"));

    const result = await serverAuthApi.authMe("abc");

    expect(result).toBeNull();
  });
});
