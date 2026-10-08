"use client";

import { PermIdentityRounded } from "@mui/icons-material";
import {
  Button,
  Divider,
  IconButton,
  Menu,
  Stack,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import React, { useCallback, useMemo, useState } from "react";

import { useAuthInfo } from "@/hooks/useAuthInfo";

import AnimatedLink from "./utility/AnimatedLink";

function ProfileMenu({
  iconColor = "white",
  loginTextColor = "white",
  setMenuOpen,
}: {
  iconColor?: string;
  loginTextColor?: string;
  setMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { firstName, lastName, email, organization, isAuthenticated, logout } =
    useAuthInfo();

  // #region menu
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const router = useRouter();

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = useCallback(async () => {
    const isLoggedOut = await logout();
    if (isLoggedOut) {
      router.push("/auth?page=login");
    }
  }, [logout, router]);

  const desktopMenu = useMemo(() => {
    if (!isAuthenticated) return null;
    return (
      <>
        <IconButton onClick={handleClick} id={"desktop-navbar-profile-button"}>
          <PermIdentityRounded
            sx={{
              color: iconColor,
              display: {
                xs: "none",
                sm: "flex",
              },
            }}
          />
        </IconButton>
        <Menu
          id={"profile-menu"}
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          sx={{
            display: {
              xs: "none",
              sm: "block",
            },
          }}
          slotProps={{
            list: {
              "aria-labelledby": "lock-button",
            },
            paper: {
              elevation: 2,
              style: {
                borderRadius: "0.25rem",
              },
            },
          }}
        >
          <Stack width={"10rem"} padding={"0.5rem"} spacing={0}>
            <Stack spacing={0.25}>
              {firstName && lastName && (
                <Typography noWrap={true} variant={"body1"} fontWeight={"500"}>
                  {firstName + " " + lastName}
                </Typography>
              )}
              <Typography noWrap={true} fontSize={"0.75rem"}>
                {email}
              </Typography>
              {organization && (
                <Typography noWrap={true} fontSize={"0.75rem"}>
                  {organization}
                </Typography>
              )}
            </Stack>
            <Divider>{"action"}</Divider>
            <Button
              onClick={async () => {
                handleClose();
                await handleLogout();
              }}
              variant={"contained"}
              sx={{
                padding: "0.125rem",
              }}
              disableElevation={true}
            >
              {"Log Out"}
            </Button>
          </Stack>
        </Menu>
      </>
    );
  }, [
    anchorEl,
    email,
    firstName,
    handleLogout,
    iconColor,
    isAuthenticated,
    lastName,
    open,
    organization,
  ]);

  const mobileMenu = useMemo(() => {
    if (!isAuthenticated) return null;
    return (
      <Stack
        spacing={1}
        color={"black"}
        display={{
          sm: "none",
        }}
        padding={"0 1rem"}
      >
        {firstName && lastName && (
          <Typography noWrap={true} variant={"body1"} fontWeight={"500"}>
            {firstName + " " + lastName}
          </Typography>
        )}
        <Typography variant={"body2"} noWrap={true}>
          {email}
        </Typography>
        {organization && (
          <Typography variant={"body2"} noWrap={true}>
            {organization}
          </Typography>
        )}
        <Button
          variant={"contained"}
          onClick={async () => {
            setMenuOpen(false);
            await handleLogout();
          }}
        >
          {"Log Out"}
        </Button>
      </Stack>
    );
  }, [
    email,
    firstName,
    handleLogout,
    isAuthenticated,
    lastName,
    organization,
    setMenuOpen,
  ]);

  if (!isAuthenticated) {
    return (
      <AnimatedLink
        href="/auth?page=login"
        underline={"none"}
        padding={{
          xs: "1rem",
          sm: "0",
        }}
        sx={{
          color: {
            xs: "black",
            sm: loginTextColor,
          },
        }}
      >
        {"Log In"}
      </AnimatedLink>
    );
  }

  return (
    <>
      {desktopMenu}
      {mobileMenu}
    </>
  );
}

export default ProfileMenu;
