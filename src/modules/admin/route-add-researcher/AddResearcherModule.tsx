"use client";

import { ExpandMore, Visibility, VisibilityOff } from "@mui/icons-material";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  CircularProgress,
  FormControl,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import AnimatedLink from "@/components/utility/AnimatedLink";
import { CustomToast } from "@/components/utility/CustomToast";
import { useAuthInfo } from "@/hooks/useAuthInfo";
import { fetchResponse } from "@/libs/fetchResponse";

function AddResearcherModule() {
  // #region page config
  const { roles, isAuthenticated } = useAuthInfo();
  const isLoading = Boolean(!roles);
  const router = useRouter();

  // #region page state
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [boxLoading, setBoxLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);

  const toastIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && !roles) {
      router.push("/");
    }
  }, [isAuthenticated, roles, router]);

  const handleAddResearcher = useCallback(async () => {
    if (toastIdRef.current) {
      CustomToast.dismiss(toastIdRef.current);
    }
    try {
      setBoxLoading(true);
      const toastId = "add-researcher-toast-id";
      toastIdRef.current = toastId;
      await CustomToast.promise(
        fetchResponse("/api/v1/users", {
          method: "POST",
          body: JSON.stringify({
            username,
            password,
          }),
        }),
        {
          loading: "adding a researcher...",
          success: "a researcher is successfully added.",
          error: "an error occured, please try again.",
        },
        undefined,
        {
          duration: 3000,
          id: toastId,
        },
      );
    } catch (e) {
      console.error(e);
    } finally {
      setBoxLoading(false);
      setUsername("");
      setPassword("");
    }
  }, [password, username]);

  if (isLoading) {
    return (
      <Box
        width={"100%"}
        height={"100%"}
        bgcolor={"white"}
        display={"flex"}
        justifyContent={"center"}
        alignItems={"center"}
      >
        <CircularProgress />
      </Box>
    );
  }
  return (
    <Stack
      width={"100%"}
      height={"100%"}
      display={"flex"}
      justifyContent={"center"}
      alignItems={"center"}
      bgcolor={"white"}
      spacing={1}
      flexWrap={"nowrap"}
      overflow={"auto"}
      flexShrink={0}
    >
      <Box
        width={"22rem"}
        borderRadius={"0.5rem"}
        position={"relative"}
        flexShrink={0}
        padding={"6rem 0 14rem"}
      >
        <Stack width={"22rem"}>
          <AnimatedLink underline={"none"} href="/" width={"fit-content"}>
            {"Home"}
          </AnimatedLink>
        </Stack>
        <Stack
          component={Paper}
          elevation={2}
          spacing={2}
          padding={"2rem"}
          alignItems={"center"}
          width={"100%"}
          paddingY={"4rem"}
        >
          <Typography variant="h3">{"Add Researcher"}</Typography>
          <form
            style={{
              width: "100%",
            }}
            onSubmit={(e) => {
              e.preventDefault();
              if (!username || !password) return;
              handleAddResearcher();
            }}
          >
            <FormControl fullWidth size={"small"}>
              <Stack spacing={2}>
                <TextField
                  suppressHydrationWarning={true}
                  fullWidth
                  type={"email"}
                  size={"small"}
                  label={"Email"}
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                  }}
                />
                <TextField
                  fullWidth
                  type={showPassword ? "text" : "password"}
                  size={"small"}
                  label={"Password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                  }}
                  slotProps={{
                    input: {
                      endAdornment: showPassword ? (
                        <IconButton
                          sx={{
                            opacity: "0.5",
                          }}
                          onClick={() => {
                            setShowPassword(!showPassword);
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
                            setShowPassword(!showPassword);
                          }}
                        >
                          <VisibilityOff />
                        </IconButton>
                      ),
                    },
                  }}
                />
                <TextField
                  fullWidth
                  type={showConfirmPassword ? "text" : "password"}
                  size={"small"}
                  label={"Confirm Password"}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                  }}
                  slotProps={{
                    input: {
                      endAdornment: showConfirmPassword ? (
                        <IconButton
                          sx={{
                            opacity: "0.5",
                          }}
                          onClick={() => {
                            setShowConfirmPassword(!showConfirmPassword);
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
                            setShowConfirmPassword(!showConfirmPassword);
                          }}
                        >
                          <VisibilityOff />
                        </IconButton>
                      ),
                    },
                  }}
                />
                <Button
                  disabled={
                    !username.trim() ||
                    !password.trim() ||
                    boxLoading ||
                    isLoading ||
                    password !== confirmPassword
                  }
                  type={"submit"}
                  variant={"contained"}
                >
                  {"Submit"}
                </Button>
              </Stack>
            </FormControl>
          </form>
        </Stack>
        {boxLoading && (
          <Box
            width={"100%"}
            height={"100%"}
            position={"absolute"}
            top={"0"}
            left={"0"}
            display={"flex"}
            justifyContent={"center"}
            alignItems={"center"}
            bgcolor={"white"}
            zIndex={9999}
            sx={{
              opacity: "0.33",
            }}
          >
            <CircularProgress color={"primary"} />
          </Box>
        )}
        <Accordion
          sx={{
            position: "absolute",
            marginTop: "1rem",
            "&.Mui-expanded": {
              marginTop: "1rem",
            },
            "&::before": {
              content: "none",
            },
          }}
        >
          <AccordionSummary expandIcon={<ExpandMore />}>
            {"What is required after a researcher registration?"}
          </AccordionSummary>
          <AccordionDetails>
            <Typography fontSize={"0.875rem"}>
              {
                "A researcher is required to reset their initial password given by an admin. As an admin, you are required to give a proper disclosure and ensure privacy and integrity of the credentials."
              }
            </Typography>
          </AccordionDetails>
        </Accordion>
      </Box>
    </Stack>
  );
}

export default AddResearcherModule;
