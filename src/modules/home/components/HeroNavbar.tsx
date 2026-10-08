import { Box, Stack } from "@mui/material";

import AnimatedLink from "@/components/utility/AnimatedLink";

function HeroNavBar() {
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
        <AnimatedLink
          underline={"none"}
          href={"/auth?page=login"}
          color={"#FFFFFF"}
        >
          {"Log In"}
        </AnimatedLink>
      </Stack>
    </Stack>
  );
}

export default HeroNavBar;
