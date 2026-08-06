import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { AuthResponseType } from "@/core/types";
import { AuthInfoProvider, useAuthInfo } from "@/hooks/useAuthInfo";
import { fetchResponse } from "@/libs/fetchResponse";

vi.mock("@/libs/fetchResponse", () => ({
  fetchResponse: vi.fn(),
}));

function wrapperWithValue(value: AuthResponseType["value"]) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <AuthInfoProvider value={value}>{children}</AuthInfoProvider>;
  };
}

describe("useAuthInfo", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("throws when used outside of AuthInfoProvider", () => {
    expect(() => renderHook(() => useAuthInfo())).toThrow(
      "useAuthInfo must be used inside AuthInfoProvvider",
    );
  });

  it("reports isAuthenticated: false and no user fields when value is null", () => {
    const { result } = renderHook(() => useAuthInfo(), {
      wrapper: wrapperWithValue(null),
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.logout).toBeInstanceOf(Function);
  });

  it("reports isAuthenticated: true when at least one identifying field is present", () => {
    const { result } = renderHook(() => useAuthInfo(), {
      wrapper: wrapperWithValue({
        email: "a@test.com",
        firstName: "",
        lastName: "",
        organization: "",
        userId: "1",
        roles: ["researcher"],
        isPasswordReset: true,
        isRequiresPasswordReset: false,
      }),
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.email).toBe("a@test.com");
  });

  it("reports isAuthenticated: false when all identifying fields are empty", () => {
    const { result } = renderHook(() => useAuthInfo(), {
      wrapper: wrapperWithValue({
        email: "",
        firstName: "",
        lastName: "",
        organization: "",
        userId: "1",
        roles: [],
        isPasswordReset: false,
        isRequiresPasswordReset: false,
      }),
    });

    expect(result.current.isAuthenticated).toBe(false);
  });

  it("logout calls the logout endpoint and returns true on success", async () => {
    vi.mocked(fetchResponse).mockResolvedValue(new Response(null));

    const { result } = renderHook(() => useAuthInfo(), {
      wrapper: wrapperWithValue(null),
    });

    await expect(result.current.logout()).resolves.toBe(true);
    expect(fetchResponse).toHaveBeenCalledWith("/api/v1/logout", {
      method: "GET",
    });
  });

  it("logout returns false and logs when fetchResponse rejects", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(fetchResponse).mockRejectedValue(new Error("network error"));

    const { result } = renderHook(() => useAuthInfo(), {
      wrapper: wrapperWithValue(null),
    });

    await waitFor(async () => {
      await expect(result.current.logout()).resolves.toBe(false);
    });
  });
});
