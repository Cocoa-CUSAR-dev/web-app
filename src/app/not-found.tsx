"use client";

import { Box, Typography } from "@mui/material";

import AnimatedLink from "@/components/utility/AnimatedLink";

export default function NotFound() {
  return (
    <Box
      flex={"1"}
      width={"100%"}
      height={"100dvh"}
      display={"flex"}
      justifyContent={"center"}
      alignItems={"center"}
      flexDirection={"column"}
    >
      <Typography fontSize={"1.25rem"}>{"This page doesn't exists"}</Typography>
      <Typography>
        {"Simply click"}{" "}
        <AnimatedLink underline="none" href={"/"} bottomLineGap={3}>
          {"here"}
        </AnimatedLink>{" "}
        {"to go to home page."}
      </Typography>
    </Box>
  );
}
