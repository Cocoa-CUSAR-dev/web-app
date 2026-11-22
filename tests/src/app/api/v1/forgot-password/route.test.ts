import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { POST } from "@/app/api/v1/forgot-password/route";

import { makeApiRequest } from "../../../../testUtils/nextRequest";

function ask(body: unknown) {
  return POST(
    makeApiRequest("/api/v1/forgot-password", { method: "POST", body }),
  );
}

describe("POST /api/v1/forgot-password", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("returns 400 without calling the backend when the login is blank", async () => {
    const res = await ask({ login: "  " });

    expect(res.status).toBe(400);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("asks the backend for a code, without any token", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ message: "ok" }), { status: 202 }),
    );

    const res = await ask({ login: " ann@test.com " });

    expect(res.status).toBe(202);
    const [url, init] = vi.mocked(fetch).mock.calls[0];
    expect(new URL(String(url)).pathname).toBe("/api/v1/auth/forgot-password");
    expect(JSON.parse(String(init?.body))).toEqual({ login: "ann@test.com" });
    expect(
      (init?.headers as Record<string, string>).Authorization,
    ).toBeUndefined();
  });

  it("passes the refusal of the backend on", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ detail: "slow down" }), { status: 429 }),
    );

    const res = await ask({ login: "ann" });

    expect(res.status).toBe(429);
    expect(await res.json()).toEqual({ error: "slow down" });
  });
});
