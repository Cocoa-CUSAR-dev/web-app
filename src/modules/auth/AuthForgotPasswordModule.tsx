"use client";

import { Alert, Button, FormControl, Stack, TextField } from "@mui/material";
import { useCallback, useState } from "react";

import { CustomToast } from "@/components/utility/CustomToast";
import { clientAuthApi } from "@/core/api/clientAuthApi";

import AuthForm from "./components/AuthForm";

const MIN_PASSWORD_LENGTH = 6;

// Two steps: ask for a code (sent to the email or LINE on the account), then
// send the code with a new password. Whether or not the account exists, the
// first step answers the same, so this page cannot be used to find out.
function AuthForgotPasswordModule({
  isAuthLoading,
  setIsAuthLoading,
  toLoginState,
  initialLogin,
}: {
  isAuthLoading: boolean;
  setIsAuthLoading: (isAuthLoading: boolean) => void;
  toLoginState: () => void;
  initialLogin: string;
}) {
  const [step, setStep] = useState<"ask" | "confirm">("ask");
  const [login, setLogin] = useState<string>(initialLogin);
  const [code, setCode] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [matchingPassword, setMatchingPassword] = useState<string>("");

  const askForCode = useCallback(async () => {
    try {
      setIsAuthLoading(true);
      await clientAuthApi.forgotPassword(login);
      setStep("confirm");
    } catch (e) {
      CustomToast.error(
        "Could not request a code",
        e instanceof Error ? e.message : "Please try again in a few seconds.",
      );
    } finally {
      setIsAuthLoading(false);
    }
  }, [login, setIsAuthLoading]);

  const confirm = useCallback(async () => {
    try {
      setIsAuthLoading(true);
      await clientAuthApi.confirmForgotPassword(login, code, newPassword);
      CustomToast.success("Password changed", "Log in with your new password.");
      toLoginState();
    } catch (e) {
      CustomToast.error(
        "Could not change the password",
        e instanceof Error ? e.message : "Please try again in a few seconds.",
      );
    } finally {
      setIsAuthLoading(false);
    }
  }, [login, code, newPassword, setIsAuthLoading, toLoginState]);

  if (step === "ask") {
    return (
      <AuthForm
        title={"Forgot Password"}
        isLoading={isAuthLoading}
        onSubmit={askForCode}
        onCornderButtonClick={toLoginState}
        cornerButtonLabel={"Back to log in"}
      >
        <FormControl fullWidth>
          <Stack spacing={2}>
            <TextField
              type={"text"}
              size={"small"}
              label={"username or email"}
              fullWidth
              value={login}
              onChange={(e) => {
                setLogin(e.target.value);
              }}
            />
            <Button
              type={"submit"}
              variant={"contained"}
              disabled={!login.trim()}
            >
              {"Send me a code"}
            </Button>
          </Stack>
        </FormControl>
      </AuthForm>
    );
  }

  const passwordTooShort =
    newPassword.length > 0 && newPassword.length < MIN_PASSWORD_LENGTH;
  const passwordsDiffer =
    matchingPassword.length > 0 && newPassword !== matchingPassword;

  return (
    <AuthForm
      title={"Enter the Code"}
      isLoading={isAuthLoading}
      onSubmit={confirm}
      onCornderButtonClick={toLoginState}
      cornerButtonLabel={"Back to log in"}
    >
      <FormControl fullWidth>
        <Stack spacing={2}>
          <Alert severity={"info"}>
            {
              "If the account has an email or LINE, a 6-digit code is on its way. It works for 15 minutes. No email or LINE? Ask an admin to reset your password."
            }
          </Alert>
          <TextField
            type={"text"}
            size={"small"}
            label={"6-digit code"}
            fullWidth
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
            }}
            slotProps={{ htmlInput: { inputMode: "numeric", maxLength: 12 } }}
          />
          <TextField
            type={"password"}
            size={"small"}
            label={"new password"}
            fullWidth
            value={newPassword}
            error={passwordTooShort}
            helperText={
              passwordTooShort
                ? `At least ${MIN_PASSWORD_LENGTH} characters`
                : undefined
            }
            onChange={(e) => {
              setNewPassword(e.target.value);
            }}
          />
          <TextField
            type={"password"}
            size={"small"}
            label={"confirm new password"}
            fullWidth
            value={matchingPassword}
            error={passwordsDiffer}
            helperText={passwordsDiffer ? "Passwords do not match" : undefined}
            onChange={(e) => {
              setMatchingPassword(e.target.value);
            }}
          />
          <Button
            type={"submit"}
            variant={"contained"}
            disabled={
              !code.trim() ||
              newPassword.length < MIN_PASSWORD_LENGTH ||
              newPassword !== matchingPassword
            }
          >
            {"Change password"}
          </Button>
          <Button
            variant={"text"}
            size={"small"}
            onClick={() => {
              setCode("");
              setStep("ask");
            }}
          >
            {"Send a new code"}
          </Button>
        </Stack>
      </FormControl>
    </AuthForm>
  );
}

export default AuthForgotPasswordModule;
