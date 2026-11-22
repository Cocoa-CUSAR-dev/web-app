import { afterEach, describe, expect, it, vi } from "vitest";

import { clientAuthApi } from "@/core/api/clientAuthApi";
import { fetchResponse } from "@/libs/fetchResponse";

vi.mock("@/libs/fetchResponse", () => ({
  fetchResponse: vi.fn(),
}));

describe("clientAuthApi.login", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("posts credentials to the login endpoint and returns true on success", async () => {
    vi.mocked(fetchResponse).mockResolvedValue(new Response(null));

    const result = await clientAuthApi.login("user@test.com", "pw123");

    expect(fetchResponse).toHaveBeenCalledWith("/api/v1/login", {
      method: "POST",
      body: JSON.stringify({ username: "user@test.com", password: "pw123" }),
    });
    expect(result).toBe(true);
  });

  it("returns false when fetchResponse resolves without a response", async () => {
    vi.mocked(fetchResponse).mockResolvedValue(
      undefined as unknown as Response,
    );

    const result = await clientAuthApi.login("user@test.com", "pw123");

    expect(result).toBe(false);
  });

  it("returns false and swallows the error when fetchResponse rejects", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(fetchResponse).mockRejectedValue(new Error("network error"));

    const result = await clientAuthApi.login("user@test.com", "pw123");

    expect(result).toBe(false);
  });
});

describe("clientAuthApi forgot password", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("asks for a code and sends the code with the new password", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null));
    vi.stubGlobal("fetch", fetchMock);

    await clientAuthApi.forgotPassword("ann@test.com");
    await clientAuthApi.confirmForgotPassword(
      "ann@test.com",
      "123456",
      "pw-12345",
    );

    expect(fetchMock.mock.calls[0][0]).toBe("/api/v1/forgot-password");
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({
      login: "ann@test.com",
    });
    expect(fetchMock.mock.calls[1][0]).toBe("/api/v1/forgot-password/confirm");
    expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toEqual({
      login: "ann@test.com",
      code: "123456",
      newPassword: "pw-12345",
    });
  });

  it("throws the own message of the route when the code is refused", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: "The code is wrong" }), {
          status: 400,
        }),
      ),
    );

    await expect(
      clientAuthApi.confirmForgotPassword("ann", "000000", "pw-12345"),
    ).rejects.toThrow("The code is wrong");
  });
});
