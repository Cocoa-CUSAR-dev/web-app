import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { PATCH } from "@/app/api/v1/tasks/[taskId]/review/[responseId]/fields/[fieldName]/route";

import { makeApiRequest } from "../../../../../../../../../testUtils/nextRequest";

const params = Promise.resolve({
  taskId: "t1",
  responseId: "r1",
  fieldName: "fan_count",
});
const url = "/api/v1/tasks/t1/review/r1/fields/fan_count";

describe("PATCH /api/v1/tasks/[taskId]/review/[responseId]/fields/[fieldName]", () => {
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
      makeApiRequest(url, { method: "PATCH", body: { value: "7" } }),
      { params },
    );

    expect(res.status).toBe(401);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("returns 400 without calling the backend when the value is missing or blank", async () => {
    for (const body of [{}, { value: "   " }, { value: 7 }]) {
      const res = await PATCH(
        makeApiRequest(url, { method: "PATCH", body, token: "t" }),
        { params },
      );

      expect(res.status).toBe(400);
      expect(await res.json()).toEqual({ error: "missing value" });
    }
    expect(fetch).not.toHaveBeenCalled();
  });

  it("sends only value and reason to the backend and returns the corrected field", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ value: { fieldName: "fan_count" } }), {
        status: 200,
      }),
    );

    const res = await PATCH(
      makeApiRequest(url, {
        method: "PATCH",
        body: { value: "7", reason: "typo", userId: "attacker" },
        token: "t",
      }),
      { params },
    );

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ value: { fieldName: "fan_count" } });
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:3001/api/v1/tasks/t1/review/r1/fields/fan_count",
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({ value: "7", reason: "typo" }),
      }),
    );
  });

  it("encodes path parameters so they can't climb out of the route", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ value: {} }), { status: 200 }),
    );

    await PATCH(
      makeApiRequest(url, {
        method: "PATCH",
        body: { value: "7" },
        token: "t",
      }),
      {
        params: Promise.resolve({
          taskId: "t1",
          responseId: "r1",
          fieldName: "../../admin",
        }),
      },
    );

    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:3001/api/v1/tasks/t1/review/r1/fields/..%2F..%2Fadmin",
      expect.anything(),
    );
  });

  it("passes the backend's validation message through on a 400", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ error: "Value must be a whole number" }), {
        status: 400,
      }),
    );

    const res = await PATCH(
      makeApiRequest(url, {
        method: "PATCH",
        body: { value: "abc" },
        token: "t",
      }),
      { params },
    );

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Value must be a whole number" });
  });
});
