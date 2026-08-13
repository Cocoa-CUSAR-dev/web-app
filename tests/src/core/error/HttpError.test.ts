import { describe, expect, it } from "vitest";

import { HttpError } from "@/core/error/HttpError";

describe("HttpError", () => {
  it("sets status, message, and name", () => {
    const error = new HttpError(404, "not found");

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe("HttpError");
    expect(error.status).toBe(404);
    expect(error.message).toBe("not found");
    expect(error.setCookies).toBeUndefined();
  });

  it("carries optional setCookies through", () => {
    const cookies = ["session=abc", "refresh=def"];
    const error = new HttpError(401, "unauthorized", cookies);

    expect(error.setCookies).toBe(cookies);
  });

  it("defaults setCookies to undefined when omitted", () => {
    const error = new HttpError(500, "server error");

    expect(error.setCookies).toBeUndefined();
  });
});
