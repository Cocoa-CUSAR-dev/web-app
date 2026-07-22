"use client";

import { usePathname } from "next/navigation";
import { createContext, useContext, useMemo } from "react";

import type { Breadcrumbs } from "@/core/types";

const BreadcrumbsContext = createContext<Breadcrumbs>([]);

function BreadcrumbsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const value = useMemo(() => {
    const pathnameArr = pathname.trim().slice(1).split("/");
    return pathnameArr;
  }, [pathname]);
  return <BreadcrumbsContext value={value}>{children}</BreadcrumbsContext>;
}

function useBreadcrumbs() {
  const context = useContext(BreadcrumbsContext);
  if (!context) {
    throw new Error("useBreadcrumbs must be used inside BreadcrumbsProvider");
  }
  return context;
}

export { BreadcrumbsProvider, useBreadcrumbs };
