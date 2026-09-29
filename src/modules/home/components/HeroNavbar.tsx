"use client";

import { Box, Stack } from "@mui/material";
import { useState } from "react";

import LogoutConfirmDialog from "@/components/LogoutConfirmDialog";
import AnimatedLink from "@/components/utility/AnimatedLink";
import { useAuthInfo } from "@/hooks/useAuthInfo";

function HeroNavBar() {
  const { isAuthenticated } = useAuthInfo();
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState<boolean>(false);

  return (
    <Stack
      width={"100%"}
      component={"nav"}
      direction={"row"}
      position={"absolute"}
      alignItems={"center"}
      justifyContent={"space-between"}
      top={"0"}
      left={"0"}
      padding={"0.5rem 2rem"}
    >
      <Box />
      <Stack direction={"row"} spacing={2} alignItems={"center"}>
        <AnimatedLink underline={"none"} href={"/form"} color={"#FFFFFF"}>
          {"Form"}
        </AnimatedLink>
        <AnimatedLink underline={"none"} href={"/dashboard"} color={"#FFFFFF"}>
          {"Dashboard"}
        </AnimatedLink>
        {isAuthenticated ? (
          <AnimatedLink
            underline={"none"}
            component={"button"}
            onClick={() => setLogoutConfirmOpen(true)}
            color={"#FFFFFF"}
          >
            {"Log Out"}
          </AnimatedLink>
        ) : (
          <AnimatedLink
            underline={"none"}
            href={"/auth?page=login"}
            color={"#FFFFFF"}
          >
            {"Log In"}
          </AnimatedLink>
        )}
      </Stack>
      <LogoutConfirmDialog
        open={logoutConfirmOpen}
        onClose={() => setLogoutConfirmOpen(false)}
      />
    </Stack>
  );
}

export default HeroNavBar;
