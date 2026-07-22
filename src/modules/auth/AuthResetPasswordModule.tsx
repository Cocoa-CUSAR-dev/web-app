"use client";

import { Visibility, VisibilityOff } from "@mui/icons-material";
import {
  Button,
  FormControl,
  IconButton,
  Stack,
  TextField,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";

import { CustomToast } from "@/components/utility/CustomToast";
import { fetchResponse } from "@/libs/fetchResponse";

import AuthForm from "./components/AuthForm";

function AuthResetPasswordModule({
  isAuthLoading,
  setIsAuthLoading,
}: {
  isAuthLoading: boolean;
  setIsAuthLoading: (isAuthLoading: boolean) => void;
}) {
  const [newPassword, setNewPassword] = useState<string>("");
  const [matchingPassword, setMatchingPassword] = useState<string>("");

  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [showMatchingPassword, setShowMatchingPassword] =
    useState<boolean>(false);

  const disabledButton =
    newPassword !== matchingPassword || !newPassword.trim();

  const router = useRouter();

  const toastIdRef = useRef<string | null>(null);

  const onSubmit = useCallback(async () => {
    if (disabledButton) return;
    if (toastIdRef.current) {
      CustomToast.dismiss(toastIdRef.current);
    }
    try {
      const toastId = "reset-password-toast-id";
      toastIdRef.current = toastId;
      setIsAuthLoading(true);
      await CustomToast.promise(
        fetchResponse("/api/v1/reset-password", {
          method: "PATCH",
          body: JSON.stringify({
            newPassword,
          }),
        }),
        {
          loading: "resetting password...",
          success:
            "successfully reset password, you will be navigated in a moment",
          error: "failed to reset password",
        },
        undefined,
        {
          duration: 3000,
          id: toastId,
        },
      );
      setTimeout(() => {
        router.push("/dashboard");
      }, 300);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAuthLoading(false);
    }
  }, [disabledButton, newPassword, router, setIsAuthLoading]);
  return (
    <AuthForm
      title={"Reset Password"}
      isLoading={isAuthLoading}
      onSubmit={onSubmit}
      disabledOnSubmit={disabledButton}
    >
      <FormControl fullWidth size={"small"}>
        <Stack spacing={2}>
          <TextField
            type={showNewPassword ? "text" : "password"}
            label={"New Password"}
            value={newPassword}
            size={"small"}
            onChange={(e) => {
              setNewPassword(e.target.value);
            }}
            slotProps={{
              input: {
                endAdornment: showNewPassword ? (
                  <IconButton
                    sx={{
                      opacity: "0.5",
                    }}
                    onClick={() => {
                      setShowNewPassword(!showNewPassword);
                    }}
                  >
                    <Visibility />
                  </IconButton>
                ) : (
                  <IconButton
                    sx={{
                      opacity: "0.5",
                    }}
                    onClick={() => {
                      setShowNewPassword(!showNewPassword);
                    }}
                  >
                    <VisibilityOff />
                  </IconButton>
                ),
              },
            }}
          />
          <TextField
            type={showMatchingPassword ? "text" : "password"}
            label={"Repeat Password"}
            value={matchingPassword}
            size={"small"}
            onChange={(e) => {
              setMatchingPassword(e.target.value);
            }}
            slotProps={{
              input: {
                endAdornment: showMatchingPassword ? (
                  <IconButton
                    sx={{
                      opacity: "0.5",
                    }}
                    onClick={() => {
                      setShowMatchingPassword(!showMatchingPassword);
                    }}
                  >
                    <Visibility />
                  </IconButton>
                ) : (
                  <IconButton
                    sx={{
                      opacity: "0.5",
                    }}
                    onClick={() => {
                      setShowMatchingPassword(!showMatchingPassword);
                    }}
                  >
                    <VisibilityOff />
                  </IconButton>
                ),
              },
            }}
          />
          <Button
            type={"submit"}
            variant={"contained"}
            disabled={disabledButton}
          >
            {"Reset Password"}
          </Button>
        </Stack>
      </FormControl>
    </AuthForm>
  );
}

export default AuthResetPasswordModule;
