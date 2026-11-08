import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { POST } from "@/app/api/v1/me/roles/researcher/route";

import {
  makeApiRequest,
  tokenPair,
} from "../../../../../../testUtils/nextRequest";

const signup = {
  signupCode: "CODE",
  firstName: "Ann",
  lastName: "Lee",
  organization: "CUSAR",
};

function become(body: unknown, token?: string) {
  return POST(
    makeApiRequest("/api/v1/me/roles/researcher", {
      method: "POST",
      body,
      token,
    }),
  );
}

describe("POST /api/v1/me/roles/researcher", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("returns 401 without calling the backend when not signed in", async () => {
    const res = await become(signup);

    expect(res.status).toBe(401);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("returns 400 when a field is missing", async () => {
    const res = await become({ ...signup, organization: "" }, "t");

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "missing organization" });
    expect(fetch).not.toHaveBeenCalled();
  });

  it("adds the role with the signed-in token and swaps in the new session", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify(tokenPair({ access_token: "with-role" })), {
        status: 201,
      }),
    );

    const res = await become(signup, "farmer-token");

    expect(res.status).toBe(201);
    const [url, init] = vi.mocked(fetch).mock.calls[0];
    expect(new URL(String(url)).pathname).toBe("/api/v1/me/roles/researcher");
    expect((init?.headers as Record<string, string>).Authorization).toBe(
      "Bearer farmer-token",
    );
    expect(res.cookies.get("token")?.value).toBe("with-role");
  });

  it("passes on a wrong code", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(
        JSON.stringify({ detail: "รหัสลงทะเบียนนักวิจัยไม่ถูกต้อง" }),
        { status: 403 },
      ),
    );

    const res = await become(signup, "t");

    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({
      error: "รหัสลงทะเบียนนักวิจัยไม่ถูกต้อง",
    });
    expect(res.cookies.get("token")).toBeUndefined();
  });

  it("already a researcher: 200 and the session is left as it is", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ detail: "คุณมีบทบาทนี้อยู่แล้ว" }), {
        status: 409,
      }),
    );

    const res = await become(signup, "t");

    expect(res.status).toBe(200);
    expect(res.cookies.get("token")).toBeUndefined();
  });
});
