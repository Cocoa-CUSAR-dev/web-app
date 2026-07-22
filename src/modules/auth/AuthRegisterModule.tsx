"use client";

import { Visibility, VisibilityOff } from "@mui/icons-material";
import {
  Autocomplete,
  Button,
  Divider,
  FormControl,
  IconButton,
  Stack,
  TextField,
} from "@mui/material";
import { useState } from "react";

import { organizations } from "@/core/constants";

import AuthForm from "./components/AuthForm";

function AuthRegisterModule({
  toLoginState,
  isAuthLoading,
  email,
  setEmail,
  password,
  setPassword,
  firstName,
  setFirstName,
  lastName,
  setLastName,
  organization,
  setOrganization,
}: {
  toLoginState: () => void;
  isAuthLoading: boolean;
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  firstName: string;
  setFirstName: (firstName: string) => void;
  lastName: string;
  setLastName: (lastName: string) => void;
  organization: string;
  setOrganization: (organization: string) => void;
}) {
  const [showPassword, setShowPassword] = useState<boolean>(false);

  return (
    <AuthForm
      title={"Register an account"}
      onCornderButtonClick={toLoginState}
      cornerButtonLabel={"Already have an account? Log in now"}
      isLoading={isAuthLoading}
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
          <Divider
            sx={{
              fontSize: "0.875rem",
            }}
          >
            {"Account Information"}
          </Divider>
          <Stack direction={"row"} spacing={1}>
            <TextField
              type={"text"}
              size={"small"}
              label={"First Name"}
              value={firstName}
              onChange={(e) => {
                setFirstName(e.target.value);
              }}
            />
            <TextField
              type={"text"}
              size={"small"}
              label={"Last Name"}
              value={lastName}
              onChange={(e) => {
                setLastName(e.target.value);
              }}
            />
          </Stack>
          <Autocomplete
            value={organization}
            options={organizations}
            renderInput={(params) => (
              <TextField
                {...params}
                type={"text"}
                size={"small"}
                label={"Organization"}
              />
            )}
            onChange={(_, newValue: string | null) => {
              if (newValue && organizations.includes(newValue)) {
                setOrganization(newValue);
              }
            }}
          />
          <Button type={"submit"} variant={"contained"} onClick={() => {}}>
            {"Register"}
          </Button>
        </Stack>
      </FormControl>
    </AuthForm>
  );
}

export default AuthRegisterModule;
