"use client";

import { Visibility, VisibilityOff } from "@mui/icons-material";
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  IconButton,
  Modal,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import React, { useState } from "react";

import AuthForm from "@/modules/auth/components/AuthForm";
import TermsOfUseContent from "@/modules/legal/TermsOfUseContent";

function AuthLoginModule({
  isAuthLoading,
  handleLogin,
  email,
  setEmail,
  password,
  setPassword,
}: {
  isAuthLoading: boolean;
  handleLogin: () => void;
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
}) {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isCheckedTermsOfService, setIsCheckedTermsOfService] =
    useState<boolean>(false);

  const [modalOpen, setModalOpen] = useState<boolean>(false);

  return (
    <>
      <Modal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
        }}
      >
        <Box
          width={"100%"}
          height={"100%"}
          display={"flex"}
          justifyContent={"center"}
          alignItems={"center"}
          padding={"2rem"}
        >
          <Stack
            padding={"2rem"}
            bgcolor={"white"}
            borderRadius={"0.5rem"}
            spacing={2}
            alignItems={"center"}
            maxWidth={"28rem"}
            maxHeight={"80dvh"}
            overflow={"auto"}
            sx={{
              scrollbarWidth: "none",
            }}
          >
            <Typography variant={"h2"} textAlign={"center"}>
              {"Terms of Use"}
            </Typography>
            <TermsOfUseContent />
            <Button
              fullWidth
              variant={"outlined"}
              onClick={() => {
                setModalOpen(false);
              }}
            >
              {"I comply with the terms of use."}
            </Button>
          </Stack>
        </Box>
      </Modal>
      <AuthForm
        title={"Researcher Login"}
        isLoading={isAuthLoading}
        onSubmit={handleLogin}
      >
        <FormControl fullWidth>
          <Stack spacing={2}>
            <TextField
              type={"text"}
              size={"small"}
              label={"email"}
              fullWidth
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
              }}
            />
            <TextField
              type={showPassword ? "text" : "password"}
              size={"small"}
              label={"password"}
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
            <FormControlLabel
              control={
                <Checkbox
                  checked={isCheckedTermsOfService}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setIsCheckedTermsOfService(e.target.checked);
                  }}
                />
              }
              label={
                <Stack direction={"row"} spacing={1} alignItems={"center"}>
                  <Typography variant={"subtitle1"}>
                    {"You have read our "}
                  </Typography>
                  <Typography
                    component={"button"}
                    variant={"subtitle1"}
                    color={"#406AAF"}
                    sx={{
                      border: "none",
                      padding: "0",
                      backgroundColor: "white",
                      "&:hover": {
                        cursor: "pointer",
                        textDecoration: "underline",
                      },
                      "&:focus": {
                        outline: "none",
                      },
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      setModalOpen(true);
                    }}
                  >
                    {"Terms of Services"}
                  </Typography>
                </Stack>
              }
            />
            <Button
              type={"submit"}
              variant={"contained"}
              disabled={!email || !password || !isCheckedTermsOfService}
              onClick={() => {}}
            >
              {"Log In"}
            </Button>
          </Stack>
        </FormControl>
      </AuthForm>
    </>
  );
}

export default AuthLoginModule;
