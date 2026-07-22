"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

import {
  DashboardContent,
  DashboardContentContextType,
} from "../dashboardTypes";

const DashboardContentContext = createContext<DashboardContentContextType>({
  content: [],
  setContent: () => {},
  isLoading: true,
  setIsLoading: () => {},
  isShowing: true,
  setIsShowing: () => {},
});

function DashboardContentProvider({ children }: { children: React.ReactNode }) {
  const [dashboardContents, setDashboardContents] = useState<
    DashboardContent[]
  >([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isShowing, setIsShowing] = useState<boolean>(false);

  useEffect(() => {
    setIsShowing(true);
  }, []);

  const value = useMemo<DashboardContentContextType>(
    () => ({
      content: dashboardContents,
      setContent: setDashboardContents,
      isLoading,
      setIsLoading,
      isShowing,
      setIsShowing,
    }),
    [dashboardContents, isLoading, isShowing],
  );

  // #region debug

  return (
    <DashboardContentContext value={value}>{children}</DashboardContentContext>
  );
}

function useDashboardContent() {
  const context = useContext(DashboardContentContext);
  if (!context) {
    throw new Error(
      "useDashboardContent must be used inside DashboardContentProvider",
    );
  }
  return context;
}

export { DashboardContentProvider, useDashboardContent };
