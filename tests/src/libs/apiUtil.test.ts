import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { tokenName } from "@/core/constants";
import { HttpError } from "@/core/error";
import { checkTokenPresence, handleApiError } from "@/libs/apiUtil";

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
