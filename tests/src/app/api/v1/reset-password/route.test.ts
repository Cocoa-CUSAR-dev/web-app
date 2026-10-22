import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { PATCH } from "@/app/api/v1/reset-password/route";
import { refreshTokenName, tokenName } from "@/core/constants";

import { hubJson, tokenPair } from "../../../../testUtils/hub";
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

  it("changes the password at backend-hub and keeps the new token pair", async () => {
    const pair = tokenPair({ refresh_token: "refresh-2" });
    vi.mocked(fetch).mockResolvedValue(hubJson(pair));

    const res = await PATCH(
      makeApiRequest("/api/v1/reset-password", {
        method: "PATCH",
        body: { newPassword: "new-pass" },
        token: "t",
      }),
    );

    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:8000/api/v1/auth/reset-password",
      expect.objectContaining({
        method: "PATCH",
        headers: expect.objectContaining({ Authorization: "Bearer t" }),
        body: JSON.stringify({ new_password: "new-pass" }),
      }),
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ value: "password changed", error: null });
    expect(res.cookies.get(tokenName)?.value).toBe(pair.access_token);
    expect(res.cookies.get(refreshTokenName)?.value).toBe("refresh-2");
  });

  it("propagates the hub's error status and message", async () => {
    vi.mocked(fetch).mockResolvedValue(
      hubJson({ detail: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร" }, 422),
    );

    const res = await PATCH(
      makeApiRequest("/api/v1/reset-password", {
        method: "PATCH",
        body: { newPassword: "123" },
        token: "t",
      }),
    );

    expect(res.status).toBe(422);
    expect(await res.json()).toEqual({ error: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร" });
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
