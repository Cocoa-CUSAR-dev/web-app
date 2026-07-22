"use client";

import { HelpRounded, MenuRounded } from "@mui/icons-material";
import {
  Box,
  Divider,
  Drawer,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import React, { useMemo, useState } from "react";
import { Step } from "react-joyride";

import { useAuthInfo } from "@/hooks/useAuthInfo";

import ProfileMenu from "./ProfileMenu";
import AnimatedLink from "./utility/AnimatedLink";
import UnControlledRerunableTutorial from "./utility/UnControlledRerunableTutorial";

const navbarDesktopGuides: Step[] = [
  {
    target: "#desktop-navbar-profile-button",
    content: (
      <>
        <Typography>{"Click here to open a profile menu."}</Typography>
      </>
    ),
    skipBeacon: true,
  },
  {
    target: "#navbar-home-link",
    content: (
      <>
        <Typography>
          {"You can navigate to home page by clicking this button."}
        </Typography>
      </>
    ),
    skipBeacon: true,
  },
];

const navbarMobileGuides: Step[] = [
  {
    target: "#navbar-mobile-menu-button",
    content: (
      <>
        <Typography>{"Click here to open a profile menu."}</Typography>
      </>
    ),
    skipBeacon: true,
  },
  {
    target: "#navbar-home-link",
    content: (
      <>
        <Typography>
          {"You can navigate to home page by clicking this button."}
        </Typography>
      </>
    ),
    skipBeacon: true,
  },
];

function NavigationBar({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState<boolean>(false);

  const { roles } = useAuthInfo();
  const isAdmin = roles?.includes("admin");

  // #region desktop menu
  const desktopMenu = useMemo(() => {
    return (
      <Stack
        direction={"row"}
        alignItems={"center"}
        display={{
          xs: "none",
          sm: "flex",
        }}
      >
        <UnControlledRerunableTutorial
          steps={navbarDesktopGuides}
          isIconButton={true}
          icon={
            <HelpRounded
              sx={{
                color: "white",
              }}
            />
          }
          skipInitialRun={true}
        />
        <Stack direction={"row"} alignItems={"center"} spacing={2.5}>
          {isAdmin && (
            <AnimatedLink
              href={"/admin/add-researcher"}
              underline={"none"}
              color={"white"}
            >
              {"Register Researcher"}
            </AnimatedLink>
          )}
          <AnimatedLink href={"/dashboard"} underline={"none"} color={"white"}>
            {"Dashboard"}
          </AnimatedLink>
          <AnimatedLink href={"/form"} underline={"none"} color={"white"}>
            {"Form"}
          </AnimatedLink>
          <ProfileMenu setMenuOpen={setMenuOpen} />
        </Stack>
      </Stack>
    );
  }, [isAdmin]);

  const mobileMenu = useMemo(() => {
    return (
      <>
        <Stack
          direction={"row"}
          spacing={1}
          alignItems={"center"}
          display={{
            sm: "none",
          }}
        >
          <UnControlledRerunableTutorial
            steps={navbarMobileGuides}
            isIconButton={true}
            icon={
              <HelpRounded
                sx={{
                  color: "white",
                }}
              />
            }
            skipInitialRun={true}
          />
          <IconButton
            id={"navbar-mobile-menu-button"}
            onClick={() => {
              setMenuOpen((p) => !p);
            }}
            disableRipple={true}
            sx={{
              padding: "0",
              borderRadius: "0",
              color: "white",
            }}
          >
            <MenuRounded />
          </IconButton>
        </Stack>
        <Drawer
          anchor={"right"}
          open={menuOpen}
          onClose={() => {
            setMenuOpen(false);
          }}
          sx={{
            display: {
              sm: "none",
            },
          }}
        >
          <Stack width={"12rem"} divider={<Divider flexItem={true} />}>
            <Stack
              color={"black"}
              alignItems={"start"}
              padding={"1rem"}
              spacing={2}
            >
              <AnimatedLink
                href={"/dashboard"}
                underline={"none"}
                color={"black"}
              >
                {"Dashboard"}
              </AnimatedLink>
              <AnimatedLink href={"/form"} underline={"none"} color={"black"}>
                {"Form"}
              </AnimatedLink>
            </Stack>
            <Box>
              <ProfileMenu setMenuOpen={setMenuOpen} />
            </Box>
          </Stack>
        </Drawer>
      </>
    );
  }, [menuOpen]);

  // #region navbar
  const navigationBar = useMemo(() => {
    return (
      <Stack
        component={"nav"}
        direction={"row"}
        alignItems={"center"}
        justifyContent={"space-between"}
        sx={{
          outline: "1px solid lightgray",
        }}
        height={"3rem"}
        padding={"0 1.5rem"}
        bgcolor={"#518D29"}
      >
        <AnimatedLink
          href={"/"}
          underline={"none"}
          fontWeight={"bold"}
          color={"white"}
          id={"navbar-home-link"}
        >
          {"Reseacher App"}
        </AnimatedLink>
        {desktopMenu}
        {mobileMenu}
      </Stack>
    );
  }, [desktopMenu, mobileMenu]);

  return (
    <Box
      width={"100%"}
      height={"100dvh"}
      display={"flex"}
      flexDirection={"column"}
      overflow={"hidden"}
    >
      {navigationBar}
      <Box
        width={"100%"}
        display={"flex"}
        flexDirection={"column"}
        flex={"1"}
        minHeight={0}
        sx={{
          overflowY: "auto",
          scrollbarWidth: "thin",
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

export default NavigationBar;
