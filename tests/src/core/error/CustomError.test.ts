import { describe, expect, it } from "vitest";

import { CustomError, CustomRedirectError } from "@/core/error/CustomError";

describe("CustomError", () => {
  it("sets type and message and extends Error", () => {
    const error = new CustomError("VALIDATION_ERROR", "bad input");

    expect(error).toBeInstanceOf(Error);
    expect(error.type).toBe("VALIDATION_ERROR");
    expect(error.message).toBe("bad input");
  });
});

describe("CustomRedirectError", () => {
  it("carries the redirect path as its message with a fixed type", () => {
    const error = new CustomRedirectError("/auth?page=login");

    expect(error).toBeInstanceOf(CustomError);
    expect(error.type).toBe("REDIRECT_ERROR");
    expect(error.message).toBe("/auth?page=login");
  });
});
