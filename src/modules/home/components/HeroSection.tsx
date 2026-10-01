"use client";

import { PlayArrowRounded } from "@mui/icons-material";
import { Box, Button, Stack, Typography } from "@mui/material";
import { motion } from "framer-motion";
import type { Ref } from "react";

import { useAuthInfo } from "@/hooks/useAuthInfo";

import { accent, displayFont, ink, inkSoft } from "../homeScenes";
import SplitWords from "./SplitWords";

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.14, delayChildren: 0.25 } },
};

const item = {
  hidden: { opacity: 0, y: 32, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 1, ease: [0.16, 1, 0.3, 1] as const },
  },
};

interface HeroSectionProps {
  ref?: Ref<HTMLElement>;
  onStartJourney: () => void;
}

function HeroSection({ ref, onStartJourney }: HeroSectionProps) {
  const { isAuthenticated } = useAuthInfo();

  return (
    <Box
      ref={ref}
      component={"section"}
      position={"relative"}
      minHeight={"100dvh"}
      display={"flex"}
      alignItems={"center"}
      paddingX={{ xs: "1.5rem", md: "8%" }}
      paddingTop={"4rem"}
    >
      <motion.div initial={"hidden"} animate={"visible"} variants={container}>
        <Stack
          spacing={2}
          maxWidth={"44rem"}
          alignItems={{ xs: "center", md: "flex-start" }}
          textAlign={{ xs: "center", md: "left" }}
        >
          <motion.div variants={item}>
            <Stack direction={"row"} spacing={1.5} alignItems={"center"}>
              <Box width={"2.5rem"} height={"2px"} bgcolor={accent} />
              <Typography
                variant={"overline"}
                color={accent}
                fontWeight={600}
                letterSpacing={"0.3em"}
              >
                {"Thai Cocoa Research Databank"}
              </Typography>
            </Stack>
          </motion.div>
          <Typography
            component={"h1"}
            fontFamily={displayFont}
            fontWeight={700}
            color={ink}
            lineHeight={0.98}
            fontSize={{ xs: "3rem", sm: "5rem", md: "6.25rem" }}
            sx={{ textShadow: "0 0.25rem 2rem rgba(255,255,255,0.8)" }}
          >
            <SplitWords text={"Enhance"} trigger={"mount"} delay={0.35} />
            <br />
            <SplitWords
              text={"Craft Chocolate"}
              trigger={"mount"}
              delay={0.5}
              color={accent}
            />
          </Typography>
          <motion.div variants={item}>
            <Typography
              fontFamily={displayFont}
              fontWeight={600}
              color={ink}
              fontSize={{ xs: "1.5rem", sm: "2rem", md: "2.5rem" }}
            >
              {"Market in Thailand"}
            </Typography>
          </motion.div>
          <motion.div variants={item}>
            <Typography
              color={inkSoft}
              fontSize={{ xs: "1rem", sm: "1.125rem" }}
              maxWidth={"32rem"}
            >
              {
                "From hillside cocoa farms to the craft chocolate counter — a research platform built with ISTC and Chulalongkorn University."
              }
            </Typography>
          </motion.div>
          <motion.div variants={item}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              paddingTop={"1rem"}
              alignItems={"center"}
            >
              <Button
                onClick={onStartJourney}
                variant={"contained"}
                size={"large"}
                endIcon={<PlayArrowRounded />}
                sx={{
                  borderRadius: "2rem",
                  padding: "0.8rem 2.25rem",
                  background: accent,
                  boxShadow: "0 0.75rem 1.75rem rgba(59,125,85,0.35)",
                  transition: "transform 0.25s ease, box-shadow 0.25s ease",
                  "&:hover": {
                    background: accent,
                    transform: "translateY(-2px)",
                    boxShadow: "0 1rem 2.25rem rgba(59,125,85,0.45)",
                  },
                }}
              >
                {"Start the journey"}
              </Button>
              <Button
                href={isAuthenticated ? "/dashboard" : "/auth?page=login"}
                variant={"outlined"}
                size={"large"}
                sx={{
                  borderRadius: "2rem",
                  padding: "0.8rem 2.25rem",
                  color: ink,
                  borderColor: "rgba(35,54,44,0.35)",
                  background: "rgba(255,255,255,0.78)",
                  "&:hover": {
                    borderColor: ink,
                    background: "rgba(255,255,255,0.8)",
                  },
                }}
              >
                {isAuthenticated ? "Open Dashboard" : "Log In"}
              </Button>
            </Stack>
          </motion.div>
        </Stack>
      </motion.div>

      <Stack
        position={"absolute"}
        bottom={"2rem"}
        left={"50%"}
        alignItems={"center"}
        spacing={1}
        display={{ xs: "none", md: "flex" }}
        sx={{ transform: "translateX(-50%)", pointerEvents: "none" }}
      >
        <Typography variant={"caption"} color={inkSoft} letterSpacing={"0.3em"}>
          {"SCROLL"}
        </Typography>
        <Box
          width={"2px"}
          height={"3rem"}
          overflow={"hidden"}
          bgcolor={"rgba(35,54,44,0.15)"}
        >
          <Box
            className={"hero-scroll-line"}
            width={"100%"}
            height={"50%"}
            bgcolor={accent}
          />
        </Box>
      </Stack>
    </Box>
  );
}

export default HeroSection;
