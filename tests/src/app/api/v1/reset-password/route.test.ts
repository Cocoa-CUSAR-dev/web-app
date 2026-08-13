import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { PATCH } from "@/app/api/v1/reset-password/route";

import { makeApiRequest } from "../../../../testUtils/nextRequest";

describe("PATCH /api/v1/reset-password", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("returns 401 without calling the backend when there is no token cookie", async () => {
    const res = await PATCH(
      makeApiRequest("/api/v1/reset-password", {
        method: "PATCH",
        body: { newPassword: "new-pw" },
      }),
    );

    expect(res.status).toBe(401);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("returns 400 when newPassword is missing", async () => {
    const res = await PATCH(
      makeApiRequest("/api/v1/reset-password", {
        method: "PATCH",
        body: {},
        token: "t",
      }),
    );

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "missing new password" });
    expect(fetch).not.toHaveBeenCalled();
  });

  it("returns the backend data with 200 on success", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ value: "password reset" }), {
        status: 200,
      }),
    );

    const res = await PATCH(
      makeApiRequest("/api/v1/reset-password", {
        method: "PATCH",
        body: { newPassword: "new-pw" },
        token: "t",
      }),
    );

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ value: "password reset" });
  });

  it("propagates the backend's error status and message", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ error: "weak password" }), {
        status: 400,
      }),
    );

    const res = await PATCH(
      makeApiRequest("/api/v1/reset-password", {
        method: "PATCH",
        body: { newPassword: "123" },
        token: "t",
      }),
    );

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "weak password" });
  });

  it("returns 500 for an unexpected error", async () => {
    vi.mocked(fetch).mockRejectedValue(new Error("network down"));

    const res = await PATCH(
      makeApiRequest("/api/v1/reset-password", {
        method: "PATCH",
        body: { newPassword: "new-pw" },
        token: "t",
      }),
    );

    expect(res.status).toBe(500);
  });
});
