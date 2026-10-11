import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { POST } from "@/app/sso/exchange/route";

import { makeApiRequest } from "../../../testUtils/nextRequest";

// US3-2 #125 (F2): the /sso page reads the token out of the URL fragment and
// POSTs it here. This route is the only place the token touches the server,
// so it must carry it in the body (never a URL) and hand the session cookie
// back untouched.

describe("POST /sso/exchange", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("returns 400 without calling the backend when there is no token", async () => {
    const res = await POST(
      makeApiRequest("/sso/exchange", { method: "POST", body: {} }),
    );

    expect(res.status).toBe(400);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("returns 400 when the token is not a string", async () => {
    const res = await POST(
      makeApiRequest("/sso/exchange", { method: "POST", body: { token: 42 } }),
    );

    expect(res.status).toBe(400);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("returns 400 for a body that is not JSON", async () => {
    const req = makeApiRequest("/sso/exchange", { method: "POST" });

    const res = await POST(req);

    expect(res.status).toBe(400);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("sends the token to the backend in a POST body, never in the URL", async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 200 }));

    await POST(
      makeApiRequest("/sso/exchange", {
        method: "POST",
        body: { token: "SECRET123" },
      }),
    );

    const [url, init] = vi.mocked(fetch).mock.calls[0];
    expect(String(url)).toMatch(/\/api\/v1\/auth\/sso\/exchange$/);
    expect(String(url)).not.toContain("SECRET123");
    expect(init?.method).toBe("POST");
    expect(JSON.parse(String(init?.body))).toEqual({ token: "SECRET123" });
  });

  it("forwards the backend's Set-Cookie so the browser gets a session", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(null, {
        status: 200,
        headers: { "set-cookie": "token=session123; Path=/; HttpOnly" },
      }),
    );

    const res = await POST(
      makeApiRequest("/sso/exchange", {
        method: "POST",
        body: { token: "SECRET123" },
      }),
    );

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(res.headers.get("set-cookie")).toContain("token=session123");
  });

  it("returns 401 and no cookie when the backend refuses the token", async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 401 }));

    const res = await POST(
      makeApiRequest("/sso/exchange", {
        method: "POST",
        body: { token: "USED-ALREADY" },
      }),
    );

    expect(res.status).toBe(401);
    expect(res.headers.get("set-cookie")).toBeNull();
  });

  it("returns 502 when the backend cannot be reached", async () => {
    vi.mocked(fetch).mockRejectedValue(new Error("network down"));

    const res = await POST(
      makeApiRequest("/sso/exchange", {
        method: "POST",
        body: { token: "SECRET123" },
      }),
    );

    expect(res.status).toBe(502);
  });
});
