import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { POST } from "@/app/api/v1/login/route";
import { refreshTokenName, tokenName } from "@/core/constants";

import { hubJson, tokenPair } from "../../../../testUtils/hub";
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

  it("signs in at backend-hub and keeps both tokens in HttpOnly cookies", async () => {
    const pair = tokenPair();
    vi.mocked(fetch).mockResolvedValue(hubJson(pair));

    const res = await POST(
      makeApiRequest("/api/v1/login", {
        method: "POST",
        body: { username: "a@test.com", password: "pw" },
      }),
    );

    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:8000/api/v1/auth/login",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ username: "a@test.com", password: "pw" }),
      }),
    );
    expect(res.status).toBe(200);
    // The tokens stay out of the body -- the browser only gets cookies.
    expect(await res.json()).toEqual({
      message: "login success",
      mustResetPassword: false,
    });
    expect(res.cookies.get(tokenName)?.value).toBe(pair.access_token);
    expect(res.cookies.get(tokenName)?.httpOnly).toBe(true);
    expect(res.cookies.get(refreshTokenName)?.value).toBe("refresh-1");
    expect(res.cookies.get(refreshTokenName)?.httpOnly).toBe(true);
  });

  it("returns the hub's status and Thai message when login fails", async () => {
    vi.mocked(fetch).mockResolvedValue(
      hubJson({ detail: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" }, 401),
    );

    const res = await POST(
      makeApiRequest("/api/v1/login", {
        method: "POST",
        body: { username: "a@test.com", password: "wrong" },
      }),
    );

    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" });
    expect(res.cookies.get(tokenName)).toBeUndefined();
  });
});
