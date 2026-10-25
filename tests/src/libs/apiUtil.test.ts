import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { tokenName } from "@/core/constants";
import { HttpError } from "@/core/error";
import {
  checkTokenPresence,
  handleApiError,
  isValueResponse,
  proxyValueToBackend,
  valueResponse,
} from "@/libs/apiUtil";

import { hubList, hubTimeSeries } from "../testUtils/hubShapes";

function requestWithCookie(name?: string, value?: string) {
  const req = new NextRequest("http://localhost/api/v1/tasks");
  if (name && value) {
    req.cookies.set(name, value);
  }
  return req;
}

describe("checkTokenPresence", () => {
  it("does not throw when the auth token cookie is present", () => {
    const req = requestWithCookie(tokenName, "a-valid-token");

    expect(() => checkTokenPresence(req)).not.toThrow();
  });

  it("throws a 401 HttpError when the token cookie is missing", () => {
    const req = requestWithCookie();

    expect(() => checkTokenPresence(req)).toThrow(HttpError);
    try {
      checkTokenPresence(req);
    } catch (e) {
      expect(e).toBeInstanceOf(HttpError);
      expect((e as HttpError).status).toBe(401);
    }
  });

  it("throws a 401 HttpError when the token cookie value is empty", () => {
    const req = requestWithCookie(tokenName, "");

    expect(() => checkTokenPresence(req)).toThrow(HttpError);
  });
});

describe("handleApiError", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("logs HttpError with its status code", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});

    handleApiError(new HttpError(403, "forbidden"));

    expect(spy).toHaveBeenCalledWith("HTTP 403: forbidden");
  });

  it("logs generic Error with its name and message", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});

    handleApiError(new TypeError("boom"));

    expect(spy).toHaveBeenCalledWith("TypeError: boom");
  });

  it("logs a fallback message for non-Error values", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});

    handleApiError("just a string");

    expect(spy).toHaveBeenCalledWith("Unkown Error");
  });
});

// The pages read every answer as { value, error } (web-backend wrapped
// everything that way); the merged backend (the hub) answers with the data
// itself. These pin the one place that closes the gap.
describe("valueResponse", () => {
  it("wraps what the hub sends: an object, a list, a text, a number", () => {
    expect(valueResponse(hubTimeSeries)).toEqual({
      value: hubTimeSeries,
      error: null,
    });
    expect(valueResponse(hubList)).toEqual({ value: hubList, error: null });
    expect(valueResponse("form updated")).toEqual({
      value: "form updated",
      error: null,
    });
    expect(valueResponse(0)).toEqual({ value: 0, error: null });
    expect(valueResponse(null)).toEqual({ value: null, error: null });
  });

  it("leaves an answer web-backend already wrapped exactly as it is", () => {
    const wrapped = { value: { series: [] }, error: null };

    expect(valueResponse(wrapped)).toBe(wrapped);
  });

  it("also leaves { value } without an error key alone", () => {
    const wrapped = { value: [1, 2] };

    expect(valueResponse<unknown>(wrapped)).toBe(wrapped);
  });

  it("does not take data that merely has a field called value for a wrapper", () => {
    const item = { label: "Harvest", value: 30, unit: "kg" };

    expect(valueResponse(item)).toEqual({ value: item, error: null });
  });

  it("wraps a list even when its first item looks like a wrapper", () => {
    const list = [{ value: 1, error: null }];

    expect(valueResponse(list)).toEqual({ value: list, error: null });
  });
});

describe("isValueResponse", () => {
  it.each([
    [{ value: 1 }, true],
    [{ value: null, error: null }, true],
    [{ value: 1, error: "x" }, true],
    [{ error: "x" }, false],
    [{ value: 1, extra: 2 }, false],
    [{}, false],
    [[], false],
    [null, false],
    ["value", false],
    [undefined, false],
  ])("%j -> %s", (body, expected) => {
    expect(isValueResponse(body)).toBe(expected);
  });
});

describe("proxyValueToBackend", () => {
  function request() {
    const req = new NextRequest("http://localhost/api/v1/analytics");
    req.cookies.set(tokenName, "t");
    return req;
  }
  const endpoint = { group: "analytics", path: "/api/v1/analytics/x" } as const;

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("gives the page { value, error } when the hub answers with the bare data", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          new Response(JSON.stringify(hubTimeSeries), { status: 200 }),
        ),
    );

    const answer = await proxyValueToBackend(request(), endpoint);

    expect(answer).toEqual({ value: hubTimeSeries, error: null });
  });

  it("does not wrap twice when a group is still served by web-backend", async () => {
    const wrapped = { value: hubList, error: null };
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          new Response(JSON.stringify(wrapped), { status: 200 }),
        ),
    );

    const answer = await proxyValueToBackend(request(), endpoint);

    expect(answer).toEqual(wrapped);
  });

  it("still throws the backend's status when it refuses", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          new Response(JSON.stringify({ detail: "no" }), { status: 403 }),
        ),
    );

    await expect(
      proxyValueToBackend(request(), endpoint),
    ).rejects.toMatchObject({
      status: 403,
    });
  });
});
