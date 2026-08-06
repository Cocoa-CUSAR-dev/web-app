import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  DashboardContentProvider,
  useDashboardContent,
} from "@/modules/dashboard/hooks/useDashboardContent";

describe("useDashboardContent", () => {
  it("starts with empty content, isLoading: true, and flips isShowing to true after mount", () => {
    const { result } = renderHook(() => useDashboardContent(), {
      wrapper: DashboardContentProvider,
    });

    expect(result.current.content).toEqual([]);
    expect(result.current.isLoading).toBe(true);
    expect(result.current.isShowing).toBe(true);
  });

  it("updates content through setContent", () => {
    const { result } = renderHook(() => useDashboardContent(), {
      wrapper: DashboardContentProvider,
    });

    act(() => {
      result.current.setContent([{ label: "Harvest", link: "/harvest" }]);
    });

    expect(result.current.content).toEqual([
      { label: "Harvest", link: "/harvest" },
    ]);
  });

  it("updates isLoading through setIsLoading", () => {
    const { result } = renderHook(() => useDashboardContent(), {
      wrapper: DashboardContentProvider,
    });

    act(() => {
      result.current.setIsLoading(false);
    });

    expect(result.current.isLoading).toBe(false);
  });

  it("returns the non-null default context outside of a provider", () => {
    const { result } = renderHook(() => useDashboardContent());

    expect(result.current.content).toEqual([]);
    expect(result.current.isLoading).toBe(true);
    expect(result.current.isShowing).toBe(true);
  });
});
