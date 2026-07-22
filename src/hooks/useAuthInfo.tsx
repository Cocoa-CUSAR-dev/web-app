"use client";

import { createContext, useCallback, useContext, useMemo } from "react";

import type { AuthInfoContextType, AuthResponseType } from "@/core/types";
import { fetchResponse } from "@/libs/fetchResponse";

const AuthInfoContext = createContext<AuthInfoContextType | null>(null);

function AuthInfoProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  value: AuthResponseType["value"];
}) {
  const logout = useCallback(async () => {
    try {
      const response = await fetchResponse("/api/v1/logout", {
        method: "GET",
      });
      if (!response) {
        throw new Error("error: can't log out");
      }
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }, []);

  const contextValue = useMemo<AuthInfoContextType | null>(() => {
    if (!value) return { logout, isAuthenticated: false };
    const { email, firstName, lastName, organization } = value;
    return {
      ...value,
      isAuthenticated: Object.values({
        email,
        firstName,
        lastName,
        organization,
      }).some(Boolean),
      logout,
    };
  }, [logout, value]);

  return <AuthInfoContext value={contextValue}>{children}</AuthInfoContext>;
}

function useAuthInfo() {
  const context = useContext(AuthInfoContext);
  if (!context) {
    throw new Error("useAuthInfo must be used inside AuthInfoProvvider");
  }
  return context;
}

export { AuthInfoProvider, useAuthInfo };
