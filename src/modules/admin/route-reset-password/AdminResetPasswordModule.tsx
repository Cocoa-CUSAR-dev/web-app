"use client";

import {
  Alert,
  Box,
  Button,
  FormControl,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useCallback, useState } from "react";

import AnimatedLink from "@/components/utility/AnimatedLink";
import { CustomToast } from "@/components/utility/CustomToast";
import { adminPasswordResetApi } from "@/core/api/adminPasswordResetApi";

// For someone who forgot their password and has neither an email nor LINE, so
// no code can reach them. The temporary password is shown once, here; the
// person must pick their own at their next sign-in.
function AdminResetPasswordModule() {
  const [login, setLogin] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<{
    username: string;
    temporaryPassword: string;
  } | null>(null);

  const reset = useCallback(async () => {
    try {
      setIsLoading(true);
      setResult(null);
      setResult(await adminPasswordResetApi.reset(login));
      setLogin("");
    } catch (e) {
      CustomToast.error(
        "Could not reset the password",
        e instanceof Error ? e.message : "Please try again in a few seconds.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [login]);

  return (
    <Stack
      width={"100%"}
      height={"100%"}
      justifyContent={"center"}
      alignItems={"center"}
      bgcolor={"white"}
    >
      <Stack width={"22rem"} spacing={1}>
        <AnimatedLink underline={"none"} href="/" width={"fit-content"}>
          {"Home"}
        </AnimatedLink>
        <Stack
          component={Paper}
          elevation={2}
          spacing={2}
          padding={"2rem"}
          alignItems={"center"}
        >
          <Typography variant="h3">{"Reset Password"}</Typography>
          <form
            style={{ width: "100%" }}
            onSubmit={(e) => {
              e.preventDefault();
              if (!login.trim() || isLoading) return;
              void reset();
            }}
          >
            <FormControl fullWidth size={"small"}>
              <Stack spacing={2}>
                <TextField
                  fullWidth
                  size={"small"}
                  label={"Username, phone number or email"}
                  value={login}
                  onChange={(e) => {
                    setLogin(e.target.value);
                  }}
                />
                <Button
                  type={"submit"}
                  variant={"contained"}
                  disabled={!login.trim() || isLoading}
                >
                  {"Reset password"}
                </Button>
              </Stack>
            </FormControl>
          </form>
          {result && (
            <Alert severity={"success"} sx={{ width: "100%" }}>
              <Typography fontSize={"0.875rem"}>
                {`New temporary password for ${result.username}:`}
              </Typography>
              <Box
                component={"code"}
                fontSize={"1.25rem"}
                fontWeight={600}
                sx={{ userSelect: "all" }}
              >
                {result.temporaryPassword}
              </Box>
              <Typography fontSize={"0.75rem"} marginTop={"0.5rem"}>
                {
                  "Shown once. Pass it on privately; they must choose their own password when they sign in. Their old password and sessions no longer work."
                }
              </Typography>
            </Alert>
          )}
        </Stack>
      </Stack>
    </Stack>
  );
}

export default AdminResetPasswordModule;
