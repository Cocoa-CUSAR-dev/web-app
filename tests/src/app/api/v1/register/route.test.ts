import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { POST } from "@/app/api/v1/register/route";

import { makeApiRequest, tokenPair } from "../../../../testUtils/nextRequest";

const signup = {
  email: "new@test.com",
  password: "secret1",
  signupCode: "CODE",
  firstName: "Ann",
  lastName: "Lee",
  organization: "CUSAR",
};

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), { status });
}

function register(body: unknown) {
  return POST(makeApiRequest("/api/v1/register", { method: "POST", body }));
}

/** The backend path and JSON body of the n-th fetch call. */
function call(n: number) {
  const [url, init] = vi.mocked(fetch).mock.calls[n];
  return {
    path: new URL(String(url)).pathname,
    body: JSON.parse(String(init?.body)),
    auth: (init?.headers as Record<string, string>)?.Authorization,
  };
}

describe("POST /api/v1/register", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("returns 400 when email is missing", async () => {
    const res = await register({ ...signup, email: undefined });

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "missing email or password" });
    expect(fetch).not.toHaveBeenCalled();
  });

  it("returns 400 when password is missing", async () => {
    const res = await register({ ...signup, password: undefined });

    expect(res.status).toBe(400);
  });

  it("returns 400 without calling the backend when the sign-up code is missing", async () => {
    const res = await register({ ...signup, signupCode: " " });

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "missing signupCode" });
    expect(fetch).not.toHaveBeenCalled();
  });

  it("creates the account, adds the researcher role and keeps the role's session", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(
        json(tokenPair({ access_token: "no-role", refresh_token: "r0" }), 201),
      )
      .mockResolvedValueOnce(
        json(
          tokenPair({ access_token: "with-role", refresh_token: "r1" }),
          201,
        ),
      );

    const res = await register(signup);

    expect(res.status).toBe(201);
    expect(call(0)).toMatchObject({
      path: "/api/v1/auth/register",
      body: { username: "new@test.com", password: "secret1" },
    });
    expect(call(1)).toMatchObject({
      path: "/api/v1/me/roles/researcher",
      body: {
        signup_code: "CODE",
        first_name: "Ann",
        last_name: "Lee",
        organization: "CUSAR",
      },
      auth: "Bearer no-role",
    });
    expect(res.cookies.get("token")?.value).toBe("with-role");
  });

  it("passes on a wrong code and sets no session", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(json(tokenPair(), 201))
      .mockResolvedValueOnce(
        json({ detail: "รหัสลงทะเบียนนักวิจัยไม่ถูกต้อง" }, 403),
      );

    const res = await register(signup);

    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({
      error: "รหัสลงทะเบียนนักวิจัยไม่ถูกต้อง",
    });
    expect(res.cookies.get("token")).toBeUndefined();
  });

  it("trying again after a wrong code signs the existing account in and adds the role", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(
        json({ detail: "ชื่อผู้ใช้นี้ถูกใช้งานแล้ว" }, 409),
      )
      .mockResolvedValueOnce(json(tokenPair({ access_token: "login" }), 200))
      .mockResolvedValueOnce(
        json(tokenPair({ access_token: "with-role" }), 201),
      );

    const res = await register(signup);

    expect(res.status).toBe(201);
    expect(call(1).path).toBe("/api/v1/auth/login");
    expect(call(2).auth).toBe("Bearer login");
    expect(res.cookies.get("token")?.value).toBe("with-role");
  });

  it("an email taken by someone else (wrong password) answers 'already used'", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(
        json({ detail: "ชื่อผู้ใช้นี้ถูกใช้งานแล้ว" }, 409),
      )
      .mockResolvedValueOnce(json({ detail: "wrong login" }, 401));

    const res = await register(signup);

    expect(res.status).toBe(409);
    expect(await res.json()).toEqual({ error: "ชื่อผู้ใช้นี้ถูกใช้งานแล้ว" });
  });

  it("an account that already is a researcher just signs in", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(json({ detail: "taken" }, 409))
      .mockResolvedValueOnce(json(tokenPair({ access_token: "login" }), 200))
      .mockResolvedValueOnce(json({ detail: "คุณมีบทบาทนี้อยู่แล้ว" }, 409));

    const res = await register(signup);

    expect(res.status).toBe(201);
    expect(res.cookies.get("token")?.value).toBe("login");
  });
});
