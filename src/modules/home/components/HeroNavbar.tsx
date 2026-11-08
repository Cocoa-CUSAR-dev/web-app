"use client";

import { Box, Stack } from "@mui/material";
import { useState } from "react";

import LogoutConfirmDialog from "@/components/LogoutConfirmDialog";
import ProfileMenu from "@/components/ProfileMenu";
import AnimatedLink from "@/components/utility/AnimatedLink";
import { useAuthInfo } from "@/hooks/useAuthInfo";

import { ink } from "../homeScenes";

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
        <AnimatedLink underline={"none"} href={"/form"} color={ink}>
          {"Form"}
        </AnimatedLink>
        <AnimatedLink underline={"none"} href={"/dashboard"} color={ink}>
          {"Dashboard"}
        </AnimatedLink>
        {/* ProfileMenu's mobile-authenticated variant assumes a parent
            Drawer to gate its visibility, which this navbar doesn't have --
            it's only safe to use here at sm+, where it renders as a plain
            icon + dropdown instead. */}
        <Box display={{ xs: "none", sm: "block" }}>
          <ProfileMenu
            setMenuOpen={() => {}}
            iconColor={ink}
            loginTextColor={ink}
          />
        </Box>
        <Box display={{ xs: "block", sm: "none" }}>
          {isAuthenticated ? (
            <AnimatedLink
              underline={"none"}
              component={"button"}
              onClick={() => setLogoutConfirmOpen(true)}
              color={ink}
            >
              {"Log Out"}
            </AnimatedLink>
          ) : (
            <AnimatedLink
              underline={"none"}
              href={"/auth?page=login"}
              color={ink}
            >
              {"Log In"}
            </AnimatedLink>
          )}
        </Box>
      </Stack>
      <LogoutConfirmDialog
        open={logoutConfirmOpen}
        onClose={() => setLogoutConfirmOpen(false)}
      />
    </Stack>
  );
}

export default HeroNavBar;
