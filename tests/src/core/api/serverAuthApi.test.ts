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

  it("returns the auth value on a successful response", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(
        JSON.stringify({ value: { email: "a@test.com", roles: ["admin"] } }),
        { status: 200 },
      ),
    );

    const result = await serverAuthApi.authMe("token=abc");

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/v1/auth/me"),
      expect.objectContaining({
        method: "GET",
        headers: { Cookie: "token=abc" },
      }),
    );
    expect(result).toEqual({ email: "a@test.com", roles: ["admin"] });
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

    await expect(serverAuthApi.authMe("token=bad")).rejects.toThrow(
      CustomRedirectError,
    );
    await expect(serverAuthApi.authMe("token=bad")).rejects.toMatchObject({
      message: "/auth?page=login&clear=true",
    });
  });

  it("returns null for non-401 backend errors without redirecting", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ error: "server exploded" }), {
        status: 500,
      }),
    );

    const result = await serverAuthApi.authMe("token=abc");

    expect(result).toBeNull();
  });

  it("returns null when fetch itself rejects", async () => {
    vi.mocked(fetch).mockRejectedValue(new Error("network down"));

    const result = await serverAuthApi.authMe("token=abc");

    expect(result).toBeNull();
  });
});
