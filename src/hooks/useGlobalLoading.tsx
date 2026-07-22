"use client";

import { createContext, useContext, useMemo, useState } from "react";

import { LoadingContextType } from "@/core/types";

const GlobalLoadingContext = createContext<LoadingContextType>({
  isLoading: false,
  setIsLoading: () => {},
});

function GlobalLoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const value = useMemo<LoadingContextType>(() => {
    return {
      isLoading,
      setIsLoading,
    };
  }, [isLoading, setIsLoading]);

  return <GlobalLoadingContext value={value}>{children}</GlobalLoadingContext>;
}

function useGlobalLoading() {
  const context = useContext(GlobalLoadingContext);
  if (!context) {
    throw new Error(
      "useGlobalLoading must be used inside GlobalLoadingProvider",
    );
  }
  return context;
}

export { useGlobalLoading };
export default GlobalLoadingProvider;
