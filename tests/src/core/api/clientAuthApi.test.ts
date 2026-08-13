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
