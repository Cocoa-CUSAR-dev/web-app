import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import GlobalLoadingProvider, {
  useGlobalLoading,
} from "@/hooks/useGlobalLoading";

describe("useGlobalLoading", () => {
  it("starts with isLoading: false", () => {
    const { result } = renderHook(() => useGlobalLoading(), {
      wrapper: GlobalLoadingProvider,
    });

    expect(result.current.isLoading).toBe(false);
  });

  it("updates isLoading through setIsLoading", () => {
    const { result } = renderHook(() => useGlobalLoading(), {
      wrapper: GlobalLoadingProvider,
    });

    act(() => {
      result.current.setIsLoading(true);
    });

    expect(result.current.isLoading).toBe(true);
  });

  it("returns the no-op default context (isLoading: false) outside of a provider", () => {
    const { result } = renderHook(() => useGlobalLoading());

    expect(result.current.isLoading).toBe(false);
    expect(() => result.current.setIsLoading(true)).not.toThrow();
  });
});
