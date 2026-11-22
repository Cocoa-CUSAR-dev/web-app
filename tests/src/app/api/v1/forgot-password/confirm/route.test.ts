import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { POST } from "@/app/api/v1/forgot-password/confirm/route";

import { makeApiRequest } from "../../../../../testUtils/nextRequest";

const body = { login: "ann", code: "123456", newPassword: "new-pass-1" };

function confirm(b: unknown) {
  return POST(
    makeApiRequest("/api/v1/forgot-password/confirm", {
      method: "POST",
      body: b,
    }),
  );
}

describe("POST /api/v1/forgot-password/confirm", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it.each([
    ["login", { ...body, login: "" }],
    ["code", { ...body, code: " " }],
    ["new password", { ...body, newPassword: undefined }],
  ])(
    "returns 400 without calling the backend when the %s is missing",
    async (_, b) => {
      const res = await confirm(b);

      expect(res.status).toBe(400);
      expect(fetch).not.toHaveBeenCalled();
    },
  );

  it("sends the code with the new password under the field names of the backend", async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 204 }));

    const res = await confirm(body);

    expect(res.status).toBe(200);
    const [url, init] = vi.mocked(fetch).mock.calls[0];
    expect(new URL(String(url)).pathname).toBe(
      "/api/v1/auth/forgot-password/confirm",
    );
    expect(JSON.parse(String(init?.body))).toEqual({
      login: "ann",
      code: "123456",
      new_password: "new-pass-1",
    });
  });

  it("explains a wrong or expired code in English", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ detail: "รหัสไม่ถูกต้องหรือหมดอายุ" }), {
        status: 400,
      }),
    );

    const res = await confirm(body);

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({
      error: "The code is wrong or has expired. Request a new one.",
    });
  });
});
