import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { PUT } from "@/app/api/v1/forms/[id]/edit/route";

import { makeApiRequest } from "../../../../../../testUtils/nextRequest";

describe("PUT /api/v1/forms/[id]/edit", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("returns 401 without calling the backend when there is no token cookie", async () => {
    const res = await PUT(
      makeApiRequest("/api/v1/forms/abc/edit", {
        method: "PUT",
        body: { sections: [] },
      }),
      { params: Promise.resolve({ id: "abc" }) },
    );

    expect(res.status).toBe(401);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("returns 400 when sections is missing from the body", async () => {
    const res = await PUT(
      makeApiRequest("/api/v1/forms/abc/edit", {
        method: "PUT",
        body: {},
        token: "t",
      }),
      { params: Promise.resolve({ id: "abc" }) },
    );

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "missing form section body" });
    expect(fetch).not.toHaveBeenCalled();
  });

  it("sends the sections to the backend and returns the saved form on success", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ value: { id: "abc", sections: [] } }), {
        status: 200,
      }),
    );

    const res = await PUT(
      makeApiRequest("/api/v1/forms/abc/edit", {
        method: "PUT",
        body: { sections: [{ title: "Section 1" }] },
        token: "t",
      }),
      { params: Promise.resolve({ id: "abc" }) },
    );

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ value: { id: "abc", sections: [] } });
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/v1/forms/abc/edit"),
      expect.objectContaining({
        method: "PUT",
        body: JSON.stringify({ sections: [{ title: "Section 1" }] }),
      }),
    );
  });

  it("propagates the backend's error status and message", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ error: "validation failed" }), {
        status: 422,
      }),
    );

    const res = await PUT(
      makeApiRequest("/api/v1/forms/abc/edit", {
        method: "PUT",
        body: { sections: [] },
        token: "t",
      }),
      { params: Promise.resolve({ id: "abc" }) },
    );

    expect(res.status).toBe(422);
  });

  it("returns 500 for an unexpected error", async () => {
    vi.mocked(fetch).mockRejectedValue(new Error("network down"));

    const res = await PUT(
      makeApiRequest("/api/v1/forms/abc/edit", {
        method: "PUT",
        body: { sections: [] },
        token: "t",
      }),
      { params: Promise.resolve({ id: "abc" }) },
    );

    expect(res.status).toBe(500);
  });
});
