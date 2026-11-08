"use client";

import { FacebookRounded, Instagram, X, YouTube } from "@mui/icons-material";
import { Box, Link, Stack, Typography } from "@mui/material";
import { type Ref, useState } from "react";

import LogoutConfirmDialog from "@/components/LogoutConfirmDialog";
import { useAuthInfo } from "@/hooks/useAuthInfo";

import { accent, displayFont, glassPanelSx, ink, inkSoft } from "../homeScenes";
import { Reveal } from "./Reveal";
import SplitWords from "./SplitWords";

const linkSx = {
  color: inkSoft,
  transition: "color 0.2s ease",
  "&:hover": { color: accent },
} as const;

const socials = [
  { label: "Facebook", icon: FacebookRounded },
  { label: "X", icon: X },
  { label: "Instagram", icon: Instagram },
  { label: "YouTube", icon: YouTube },
] as const;

interface FooterProps {
  ref?: Ref<HTMLElement>;
}

function Footer({ ref }: FooterProps) {
  const { isAuthenticated } = useAuthInfo();
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState<boolean>(false);

  return (
    <Box
      ref={ref}
      // Not <section>: a <footer> nested in a sectioning element loses its
      // contentinfo landmark role.
      component={"div"}
      minHeight={"100dvh"}
      display={"flex"}
      flexDirection={"column"}
      paddingX={{ xs: "1rem", md: "4%" }}
      paddingBottom={"1.5rem"}
    >
      {/* On phones the headline sits up in the scrimmed sky; centred, it
          landed on the hills and was hard to read. */}
      <Stack
        flex={1}
        justifyContent={{ xs: "flex-start", md: "center" }}
        alignItems={"center"}
        paddingTop={{ xs: "5.5rem", md: "6rem" }}
        paddingBottom={"6rem"}
      >
        <Reveal>
          <Stack spacing={2} alignItems={"center"} textAlign={"center"}>
            <Typography
              variant={"overline"}
              color={accent}
              letterSpacing={"0.3em"}
            >
              {"Under the same stars"}
            </Typography>
            <Typography
              component={"h2"}
              fontFamily={displayFont}
              fontWeight={600}
              color={ink}
              fontSize={{ xs: "2.25rem", sm: "3.25rem", md: "4rem" }}
              lineHeight={1.1}
              maxWidth={"48rem"}
              sx={{ textShadow: "0 0.25rem 1.5rem rgba(255,255,255,0.8)" }}
            >
              <SplitWords text={"Enhance Craft Chocolate Market"} />
            </Typography>
            <Typography color={inkSoft} maxWidth={"40rem"}>
              {
                "Empowering Thailand's craft cocoa market with data-driven decisions and research from experts in the field."
              }
            </Typography>
          </Stack>
        </Reveal>
      </Stack>

      <Stack
        component={"footer"}
        direction={{ xs: "column", md: "row" }}
        spacing={{ xs: 3, md: 8 }}
        padding={{ xs: "1.75rem", md: "2.25rem 2.75rem" }}
        color={ink}
        sx={glassPanelSx}
      >
        <Stack spacing={1.5} flex={1}>
          <Typography
            fontFamily={displayFont}
            fontWeight={600}
            fontSize={"1.35rem"}
          >
            {"Cocoa Supply Chain Databank"}
          </Typography>
          <Typography variant={"body2"} color={inkSoft} maxWidth={"28rem"}>
            {
              "A research platform for the Thai Cocoa Project by CUSAR, in collaboration with CU Intania and ISTC."
            }
          </Typography>
          <Stack
            direction={"row"}
            spacing={1.75}
            alignItems={"center"}
            paddingTop={"0.5rem"}
          >
            {socials.map(({ label, icon: Icon }) => (
              <Box
                key={label}
                component={"a"}
                href={"/"}
                aria-label={label}
                display={"flex"}
                sx={{ color: ink, "&:hover": { color: accent } }}
              >
                <Icon />
              </Box>
            ))}
          </Stack>
        </Stack>
        <Stack direction={"row"} spacing={{ xs: 6, md: 8 }}>
          <Stack spacing={1.25}>
            <Typography component={"h3"} fontWeight={600} color={accent}>
              {"Pages"}
            </Typography>
            <Link underline={"none"} href={"/dashboard"} sx={linkSx}>
              {"Dashboard"}
            </Link>
            <Link underline={"none"} href={"/form"} sx={linkSx}>
              {"Form"}
            </Link>
            {isAuthenticated ? (
              <Link
                underline={"none"}
                component={"button"}
                onClick={() => setLogoutConfirmOpen(true)}
                sx={{ ...linkSx, textAlign: "left" }}
              >
                {"Log Out"}
              </Link>
            ) : (
              <Link underline={"none"} href={"/auth?page=login"} sx={linkSx}>
                {"Log In"}
              </Link>
            )}
            <Link underline={"none"} href={"/terms-of-use"} sx={linkSx}>
              {"Terms of Use"}
            </Link>
          </Stack>
          <Stack spacing={1.25}>
            <Typography component={"h3"} fontWeight={600} color={accent}>
              {"Contact"}
            </Typography>
            <Typography variant={"body2"} color={inkSoft}>
              {"Chulalongkorn University"}
            </Typography>
            <Typography variant={"body2"} color={inkSoft}>
              {"ISTC"}
            </Typography>
            <Typography variant={"body2"} color={inkSoft}>
              {"Chula Engineering"}
            </Typography>
          </Stack>
        </Stack>
      </Stack>
      <LogoutConfirmDialog
        open={logoutConfirmOpen}
        onClose={() => setLogoutConfirmOpen(false)}
      />
    </Box>
  );
}

export default Footer;
