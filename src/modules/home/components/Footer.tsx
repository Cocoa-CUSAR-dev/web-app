"use client";

import { FacebookRounded } from "@mui/icons-material";
import { Box, Link, Stack, Typography } from "@mui/material";
import Image from "next/image";

function Footer() {
  return (
    <Stack
      component={"footer"}
      flexShrink={"0"}
      direction={{
        xs: "column",
        md: "row",
      }}
      spacing={{
        xs: 3,
        md: 12,
      }}
      width={"100%"}
      padding={"3rem"}
      bgcolor={"#4B2E2B"}
      color={"#FFFFFF"}
      alignItems={"center"}
    >
      <Stack direction={"column"} spacing={2} flex={"1"}>
        <Typography variant={"h3"} fontWeight={600}>
          {"Enhance Craft Chocolate Market"}
        </Typography>
        <Typography variant={"body1"}>
          {
            "Empowering and enhancing craft cocoa market in Thailand with data-driven decisions and researches from experts in the field. Drive businesses to go even further beyond with accurate guidance and powerful tools crafted to their needs."
          }
        </Typography>
        <Stack direction={"row"} spacing={1.5} alignItems={"center"}>
          <Box
            component={"a"}
            href={"/"}
            width={"1.75rem"}
            height={"1.75rem"}
            color={"#FFFFFF"}
          >
            <FacebookRounded
              sx={{
                width: "100%",
                height: "100%",
              }}
            />
          </Box>
          <Box
            component={"a"}
            href={"/"}
            width={"1.5rem"}
            height={"1.5rem"}
            position={"relative"}
          >
            <Image
              src={"/logos/x-logo-white.png"}
              fill={true}
              sizes={"(max-width: 1920px) 1.5rem"}
              alt={"X Logo"}
            />
          </Box>
          <Box
            component={"a"}
            href={"/"}
            width={"1.5rem"}
            height={"1.5rem"}
            position={"relative"}
          >
            <Image
              src={"/logos/ig-logo-white.png"}
              fill={true}
              sizes={"(max-width: 1920px) 1.5rem"}
              alt={"Instagram Logo"}
            />
          </Box>
          <Box
            component={"a"}
            href={"/"}
            width={"2.5rem"}
            height={"2.5rem"}
            position={"relative"}
          >
            <Image
              src={"/logos/yt-logo-white.png"}
              fill={true}
              sizes={"(max-width: 1920px) 1.5rem"}
              alt={"YouTube Logo"}
            />
          </Box>
        </Stack>
      </Stack>
      <Stack
        direction={"row"}
        spacing={4}
        width={{
          xs: "100%",
          md: "fit-content",
        }}
      >
        <Stack
          spacing={2}
          alignItems={{
            xs: "start",
            md: "end",
          }}
        >
          <Typography variant={"h3"} fontWeight={600}>
            {"Pages"}
          </Typography>
          <Stack
            spacing={1}
            alignItems={{
              xs: "start",
              md: "end",
            }}
          >
            <Link underline={"none"} color={"inherit"} href={"/dashboard"}>
              {"Dashboard"}
            </Link>
            <Link underline={"none"} color={"inherit"} href={"/form"}>
              {"Form"}
            </Link>
            <Link
              underline={"none"}
              color={"inherit"}
              href={"/auth?page=login"}
            >
              {"Log In"}
            </Link>
            <Link underline={"none"} color={"inherit"} href={"/terms-of-use"}>
              {"Terms of Use"}
            </Link>
          </Stack>
        </Stack>
        <Stack
          spacing={2}
          alignItems={{
            xs: "start",
            md: "end",
          }}
        >
          <Typography variant={"h3"} fontWeight={600}>
            {"Contact"}
          </Typography>
          <Stack
            spacing={1}
            alignItems={{
              xs: "start",
              md: "end",
            }}
          >
            <Link underline={"none"} color={"inherit"} href={"/dashboard"}>
              {"Chulalongkorn University"}
            </Link>
            <Link
              underline={"none"}
              color={"inherit"}
              href={"/form"}
              maxWidth={"18rem"}
            >
              {"ISTC"}
            </Link>
            <Link
              underline={"none"}
              color={"inherit"}
              href={"/auth?page=login"}
            >
              {"Chula Engineering"}
            </Link>
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  );
}

export default Footer;
