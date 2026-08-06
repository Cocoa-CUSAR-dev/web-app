import { renderHook } from "@testing-library/react";
import { usePathname } from "next/navigation";
import { describe, expect, it, vi } from "vitest";

import { BreadcrumbsProvider, useBreadcrumbs } from "@/hooks/useBreadcrumbs";

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(),
}));

describe("useBreadcrumbs", () => {
  it("returns an empty-string-only breadcrumb list for the root pathname", () => {
    vi.mocked(usePathname).mockReturnValue("/");

    const { result } = renderHook(() => useBreadcrumbs(), {
      wrapper: BreadcrumbsProvider,
    });

    expect(result.current).toEqual([""]);
  });

  it("splits a nested pathname into breadcrumb segments", () => {
    vi.mocked(usePathname).mockReturnValue("/dashboard/map");

    const { result } = renderHook(() => useBreadcrumbs(), {
      wrapper: BreadcrumbsProvider,
    });

    expect(result.current).toEqual(["dashboard", "map"]);
  });

  it("returns [] when used outside of BreadcrumbsProvider (default context value)", () => {
    const { result } = renderHook(() => useBreadcrumbs());

    expect(result.current).toEqual([]);
  });
});
