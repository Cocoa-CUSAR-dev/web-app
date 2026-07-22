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
            <Typography
              variant={"body1"}
              textAlign={"justify"}
              sx={{
                textIndent: "2rem",
              }}
            >{`Morbi porttitor elementum libero convallis sagittis. Morbi sodales pulvinar gravida. Fusce eget risus scelerisque, blandit sem in, vehicula enim. Maecenas mattis feugiat nulla, at pellentesque libero eleifend quis. Phasellus cursus justo sit amet elementum ultricies. Mauris vitae nulla ut nunc imperdiet convallis. Etiam nec libero gravida, porta nibh in, viverra metus. Mauris purus nisi, tempor non vehicula vel, porta vel eros. Vivamus ultricies condimentum augue quis iaculis. Quisque ultrices vitae magna ac iaculis. Cras euismod orci ac gravida sollicitudin.`}</Typography>
            <Typography
              variant={"body1"}
              textAlign={"justify"}
              sx={{
                textIndent: "2rem",
              }}
            >{`Donec et egestas neque, id tristique nulla. Mauris non tellus metus. Suspendisse potenti. Morbi eget porttitor justo. Aliquam a efficitur metus. Quisque consequat quam dolor, quis sodales libero consectetur vel. Sed ac arcu a justo iaculis gravida. Cras nec quam eget nulla efficitur molestie.`}</Typography>
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
