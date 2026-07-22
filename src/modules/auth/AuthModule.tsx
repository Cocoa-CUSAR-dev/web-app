"use client";

import { Box, CircularProgress } from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { CustomToast } from "@/components/utility/CustomToast";
import { clientAuthApi } from "@/core/api/clientAuthApi";

import AuthLoginModule from "./AuthLoginModule";
import AuthRegisterModule from "./AuthRegisterModule";
import AuthResetPasswordModule from "./AuthResetPasswordModule";

const possiblePageStates = ["login", "register", "reset-password"] as const;
type PageState = (typeof possiblePageStates)[number];

function AuthModule() {
  const [pageState, setPageState] = useState<PageState | "loading">("loading");
  const params = useSearchParams();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(false);

  const [errorMessage, setErrorMessage] = useState<[string, string?] | null>(
    null,
  );
  const toastIdRef = useRef<string | null>(null);

  const router = useRouter();

  // #region register specific

  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [organization, setOrganization] = useState<string>("CUSAR");

  // #region functions
  const toLoginState = useCallback(() => {
    const newParams = new URLSearchParams(window.location.search);
    newParams.set("page", "login");
    const newUrl = `${window.location.pathname}?${newParams.toString()}`;
    window.history.replaceState(null, "", newUrl);
    setPageState("login");
  }, []);

  // const toRegisterState = useCallback(() => {
  //   const newParams = new URLSearchParams(window.location.search);
  //   newParams.set("page", "register");
  //   const newUrl = `${window.location.pathname}?${newParams.toString()}`;
  //   window.history.replaceState(null, "", newUrl);
  //   setPageState("register");
  // }, []);

  const handleLogin = useCallback(async () => {
    try {
      setIsAuthLoading(true);
      const isLoggedIn = await clientAuthApi.login(email, password);
      if (isLoggedIn) {
        router.push("/dashboard");
      } else {
        setErrorMessage(["Log In Error", "Please try again in a few seconds."]);
      }
    } catch (e) {
      console.error(
        e instanceof Error ? `${e.name}: ${e.message}` : "Unknown Error",
      );
      if (e instanceof Error) {
        setErrorMessage([e.name, e.message]);
      }
    } finally {
      setIsAuthLoading(false);
    }
  }, [email, password, router]);

  // #region effect
  useEffect(() => {
    let pageParam: PageState = params.get("page") as PageState;
    if (!pageParam || !possiblePageStates.includes(pageParam)) {
      toLoginState();
      pageParam = "login" as PageState;
    }
    if (pageParam === "login") {
      setPageState("login");
      return;
    }
    if (pageParam === "register") {
      setPageState("register");
      return;
    }
    if (pageParam === "reset-password") {
      setPageState("reset-password");
      return;
    }
  }, [params, toLoginState]);

  useEffect(() => {
    if (errorMessage) {
      if (toastIdRef.current) {
        CustomToast.dismiss(toastIdRef.current);
        toastIdRef.current = null;
      }
      toastIdRef.current = CustomToast.error(errorMessage[0], errorMessage[1], {
        duration: 5000,
      });
    }
  }, [errorMessage]);

  // #region auth box
  const component = useMemo(() => {
    switch (pageState) {
      case "loading":
        return null;
      case "login":
        return (
          <AuthLoginModule
            isAuthLoading={isAuthLoading}
            handleLogin={handleLogin}
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
          />
        );
      case "register":
        return (
          <AuthRegisterModule
            toLoginState={toLoginState}
            isAuthLoading={isAuthLoading}
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            firstName={firstName}
            setFirstName={setFirstName}
            lastName={lastName}
            setLastName={setLastName}
            organization={organization}
            setOrganization={setOrganization}
          />
        );
      case "reset-password":
        return (
          <AuthResetPasswordModule
            isAuthLoading={isAuthLoading}
            setIsAuthLoading={setIsAuthLoading}
          />
        );
      default:
        return null;
    }
  }, [
    email,
    firstName,
    handleLogin,
    isAuthLoading,
    lastName,
    organization,
    pageState,
    password,
    toLoginState,
  ]);

  // #region loading
  if (pageState === "loading") {
    return (
      <Box
        width={"100%"}
        height={"100dvh"}
        bgcolor={"white"}
        display={"flex"}
        justifyContent={"center"}
        alignItems={"center"}
      >
        <CircularProgress />
      </Box>
    );
  }

  // #region component
  return (
    <Box
      width={"100%"}
      height={"100dvh"}
      bgcolor={"white"}
      display={"flex"}
      justifyContent={"center"}
      alignItems={"center"}
      padding={"0 1rem"}
    >
      {component}
    </Box>
  );
}

export default AuthModule;
