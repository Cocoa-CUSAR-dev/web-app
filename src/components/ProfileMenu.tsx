"use client";

import { PermIdentityRounded } from "@mui/icons-material";
import {
  alpha,
  Avatar,
  Button,
  Chip,
  Divider,
  IconButton,
  Menu,
  Stack,
  Typography,
} from "@mui/material";
import React, { useMemo, useState } from "react";

import { roleLabels } from "@/core/constants";
import type { UserRole } from "@/core/types";
import { useAuthInfo } from "@/hooks/useAuthInfo";

import BecomeResearcherDialog from "./BecomeResearcherDialog";
import LogoutConfirmDialog from "./LogoutConfirmDialog";
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
  const { firstName, lastName, email, organization, isAuthenticated, roles } =
    useAuthInfo();

  // Every role the account holds, in a fixed order.
  const heldRoles = useMemo(
    () =>
      (Object.keys(roleLabels) as UserRole[]).filter((role) =>
        roles?.includes(role),
      ),
    [roles],
  );
  // Someone signed in without researcher (e.g. a farmer) can add it with
  // the team's sign-up code. An admin doesn't need it.
  const canBecomeResearcher =
    !roles?.includes("researcher") && !roles?.includes("admin");
  const [becomeResearcherOpen, setBecomeResearcherOpen] =
    useState<boolean>(false);

  const roleChips = useMemo(
    () =>
      heldRoles.length > 0 && (
        <Stack direction={"row"} flexWrap={"wrap"} gap={0.5}>
          {heldRoles.map((role) => (
            <Chip
              key={role}
              label={roleLabels[role]}
              size={"small"}
              color={"primary"}
              variant={"outlined"}
            />
          ))}
        </Stack>
      ),
    [heldRoles],
  );

  const initials =
    [firstName?.[0], lastName?.[0]].filter(Boolean).join("").toUpperCase() ||
    "?";

  // #region menu
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState<boolean>(false);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

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
              elevation: 3,
              style: {
                borderRadius: "0.75rem",
                marginTop: "0.5rem",
              },
            },
          }}
        >
          <Stack width={"16rem"} padding={"1rem"} spacing={1.5}>
            <Stack direction={"row"} spacing={1.5} alignItems={"center"}>
              <Avatar
                sx={{
                  width: "2.5rem",
                  height: "2.5rem",
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.15),
                  color: "primary.dark",
                  fontWeight: 600,
                }}
              >
                {initials}
              </Avatar>
              <Stack spacing={0} minWidth={0}>
                {firstName && lastName && (
                  <Typography noWrap={true} variant={"body1"} fontWeight={600}>
                    {firstName + " " + lastName}
                  </Typography>
                )}
                <Typography
                  noWrap={true}
                  variant={"body2"}
                  color={"text.secondary"}
                >
                  {email}
                </Typography>
              </Stack>
            </Stack>
            {organization && (
              <Typography
                noWrap={true}
                variant={"body2"}
                color={"text.secondary"}
              >
                {organization}
              </Typography>
            )}
            {roleChips}
            <Divider />
            {canBecomeResearcher && (
              <Button
                onClick={() => {
                  handleClose();
                  setBecomeResearcherOpen(true);
                }}
                variant={"outlined"}
                fullWidth
              >
                {"Become a researcher"}
              </Button>
            )}

            <Button
              onClick={() => {
                handleClose();
                setLogoutConfirmOpen(true);
              }}
              variant={"outlined"}
              color={"error"}
              fullWidth
            >
              {"Log Out"}
            </Button>
          </Stack>
        </Menu>
      </>
    );
  }, [
    anchorEl,
    canBecomeResearcher,
    email,
    firstName,
    iconColor,
    initials,
    isAuthenticated,
    lastName,
    open,
    organization,
    roleChips,
  ]);

  const mobileMenu = useMemo(() => {
    if (!isAuthenticated) return null;
    return (
      <Stack
        spacing={1.5}
        color={"black"}
        display={{
          sm: "none",
        }}
        padding={"0 1rem"}
      >
        <Stack direction={"row"} spacing={1.5} alignItems={"center"}>
          <Avatar
            sx={{
              width: "2.5rem",
              height: "2.5rem",
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.15),
              color: "primary.dark",
              fontWeight: 600,
            }}
          >
            {initials}
          </Avatar>
          <Stack spacing={0} minWidth={0}>
            {firstName && lastName && (
              <Typography noWrap={true} variant={"body1"} fontWeight={600}>
                {firstName + " " + lastName}
              </Typography>
            )}
            <Typography
              variant={"body2"}
              color={"text.secondary"}
              noWrap={true}
            >
              {email}
            </Typography>
          </Stack>
        </Stack>
        {organization && (
          <Typography variant={"body2"} color={"text.secondary"} noWrap={true}>
            {organization}
          </Typography>
        )}
        {roleChips}
        {canBecomeResearcher && (
          <Button
            variant={"outlined"}
            onClick={() => {
              setMenuOpen(false);
              setBecomeResearcherOpen(true);
            }}
          >
            {"Become a researcher"}
          </Button>
        )}
        <Button
          variant={"outlined"}
          color={"error"}
          onClick={() => {
            setMenuOpen(false);
            setLogoutConfirmOpen(true);
          }}
        >
          {"Log Out"}
        </Button>
      </Stack>
    );
  }, [
    canBecomeResearcher,
    email,
    firstName,
    initials,
    isAuthenticated,
    lastName,
    organization,
    roleChips,
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
      <LogoutConfirmDialog
        open={logoutConfirmOpen}
        onClose={() => setLogoutConfirmOpen(false)}
      />
      {canBecomeResearcher && (
        <BecomeResearcherDialog
          open={becomeResearcherOpen}
          onClose={() => setBecomeResearcherOpen(false)}
        />
      )}
    </>
  );
}

export default ProfileMenu;
