import { NextResponse } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  bearer,
  clearSessionCookies,
  clearSharedRefreshes,
  readBackendError,
  requestRefresh,
  setSessionCookies,
} from "@/libs/backendSession";

import { tokenPair } from "../testUtils/nextRequest";

describe("setSessionCookies", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("keeps the access token as long as it lives and the refresh token for 90 days", () => {
    const res = NextResponse.json({});

    setSessionCookies(res, tokenPair({ expires_in: 900 }));

    expect(res.cookies.get("token")).toMatchObject({
      value: "access-1",
      maxAge: 900,
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    });
    expect(res.cookies.get("refresh_token")).toMatchObject({
      value: "refresh-1",
      maxAge: 7776000,
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    });
  });

  it("marks the cookies secure in production only", () => {
    vi.stubEnv("NODE_ENV", "production");
    const prod = NextResponse.json({});
    setSessionCookies(prod, tokenPair());

    vi.stubEnv("NODE_ENV", "development");
    const dev = NextResponse.json({});
    setSessionCookies(dev, tokenPair());

    expect(prod.cookies.get("token")?.secure).toBe(true);
    expect(dev.cookies.get("token")?.secure).toBe(false);
  });
});

describe("clearSessionCookies", () => {
  it("expires both cookies", () => {
    const res = NextResponse.json({});

    clearSessionCookies(res);

    expect(res.cookies.get("token")?.value).toBe("");
    expect(res.cookies.get("refresh_token")?.value).toBe("");
  });
});

describe("readBackendError", () => {
  it("reads FastAPI's detail", async () => {
    const res = new Response(JSON.stringify({ detail: "nope" }), {
      status: 400,
    });

    expect(await readBackendError(res)).toBe("nope");
  });

  it("still reads the old backend's error", async () => {
    const res = new Response(JSON.stringify({ error: "old" }), { status: 400 });

    expect(await readBackendError(res)).toBe("old");
  });

  it("gives null for a validation list or a body that is not JSON", async () => {
    expect(
      await readBackendError(
        new Response(JSON.stringify({ detail: [{ msg: "x" }] }), {
          status: 422,
        }),
      ),
    ).toBeNull();
    expect(
      await readBackendError(new Response("<html>", { status: 502 })),
    ).toBeNull();
  });
});

describe("requestRefresh", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    clearSharedRefreshes();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns the new pair", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify(tokenPair()), { status: 200 }),
    );

    const pair = await requestRefresh("r1");

    expect(pair?.access_token).toBe("access-1");
    const [url, init] = vi.mocked(fetch).mock.calls[0];
    expect(String(url)).toMatch(/\/api\/v1\/auth\/refresh$/);
    expect(init?.method).toBe("POST");
    expect(JSON.parse(String(init?.body))).toEqual({ refresh_token: "r1" });
  });

  it("asks the backend once when several requests arrive with the same refresh token", async () => {
    vi.mocked(fetch).mockImplementation(
      async () => new Response(JSON.stringify(tokenPair()), { status: 200 }),
    );

    const [a, b, c] = await Promise.all([
      requestRefresh("r1"),
      requestRefresh("r1"),
      requestRefresh("r1"),
    ]);
    const late = await requestRefresh("r1");

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(a).toBe(b);
    expect(b).toBe(c);
    expect(late).toBe(a);
  });

  it("asks again for a different refresh token", async () => {
    vi.mocked(fetch).mockImplementation(
      async () => new Response(JSON.stringify(tokenPair()), { status: 200 }),
    );

    await requestRefresh("r1");
    await requestRefresh("r2");

    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("stops sharing an answer after a few seconds", async () => {
    vi.useFakeTimers();
    try {
      vi.mocked(fetch).mockImplementation(
        async () => new Response(JSON.stringify(tokenPair()), { status: 200 }),
      );

      await requestRefresh("r1");
      vi.advanceTimersByTime(11_000);
      await requestRefresh("r1");

      expect(fetch).toHaveBeenCalledTimes(2);
    } finally {
      vi.useRealTimers();
    }
  });

  it("does not remember a refusal", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ detail: "x" }), { status: 401 }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify(tokenPair()), { status: 200 }),
      );

    expect(await requestRefresh("r1")).toBeNull();
    // let the refusal's cleanup run
    await Promise.resolve();
    expect(await requestRefresh("r1")).not.toBeNull();
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("gives null when the backend refuses or cannot be reached", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ detail: "expired" }), { status: 401 }),
    );
    expect(await requestRefresh("r-expired")).toBeNull();

    vi.mocked(fetch).mockRejectedValueOnce(new Error("network down"));
    expect(await requestRefresh("r-down")).toBeNull();
  });
});

describe("bearer", () => {
  it("is the Authorization header value for an access token", () => {
    expect(bearer("abc")).toBe("Bearer abc");
  });
});
