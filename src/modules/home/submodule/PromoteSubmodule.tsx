"use client";

import {
  DescriptionRounded,
  HistoryRounded,
  InsightsRounded,
  MapRounded,
} from "@mui/icons-material";
import { Box, Stack, Typography } from "@mui/material";
import type { Ref } from "react";

import ChapterHeading from "../components/ChapterHeading";
import PaperStack from "../components/PaperStack";
import { Reveal } from "../components/Reveal";
import { accent, glassPanelSx, ink, inkSoft } from "../homeScenes";

const features = [
  {
    title: "Data Collection Forms",
    description:
      "Build and manage structured forms for farm and harvest records.",
    icon: DescriptionRounded,
  },
  {
    title: "Analytics Dashboard",
    description: "Track harvest trends, yields, and farmer activity over time.",
    icon: InsightsRounded,
  },
  {
    title: "Farm Mapping",
    description: "View submissions and plots geographically across provinces.",
    icon: MapRounded,
  },
  {
    title: "Submission History",
    description: "Review every recorded activity and diary entry by farmer.",
    icon: HistoryRounded,
  },
] as const;

const cardTints = [
  ["#d6e5dc", "#f6dccf"],
  ["#e4def0", "#d6e5dc"],
  ["#f6dccf", "#f3e7c4"],
  ["#d3e3e8", "#e4def0"],
] as const;

interface PromoteSubmoduleProps {
  ref?: Ref<HTMLElement>;
}

function PromoteSubmodule({ ref }: PromoteSubmoduleProps) {
  return (
    <Box
      ref={ref}
      component={"section"}
      minHeight={"100dvh"}
      display={"flex"}
      flexDirection={"column"}
      justifyContent={"center"}
      alignItems={"center"}
      paddingX={{ xs: "1.5rem", md: "8%" }}
      paddingY={"6rem"}
    >
      <Stack
        spacing={5}
        width={"100%"}
        maxWidth={"72rem"}
        alignItems={"center"}
      >
        <Reveal>
          <ChapterHeading
            numeral={"02"}
            eyebrow={"The Journey · 02"}
            title={"Crafted Tools for Research"}
            align={"center"}
          />
        </Reveal>
        <Box
          width={"100%"}
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              lg: "repeat(4, 1fr)",
            },
            gap: 2.5,
          }}
        >
          {features.map(({ title, description, icon: Icon }, index) => (
            <Reveal key={title} delay={0.1 * index}>
              <PaperStack
                fill={true}
                lean={index % 2 ? -1 : 1}
                tints={cardTints[index % cardTints.length]}
              >
                <Stack
                  spacing={1.5}
                  height={"100%"}
                  padding={"1.75rem"}
                  sx={{
                    ...glassPanelSx,
                    transition: "transform 0.35s ease, border-color 0.35s ease",
                    "&:hover": {
                      transform: "translateY(-6px)",
                      borderColor: "rgba(59,125,85,0.45)",
                    },
                  }}
                >
                  <Box
                    width={"3rem"}
                    height={"3rem"}
                    borderRadius={"1rem"}
                    display={"flex"}
                    alignItems={"center"}
                    justifyContent={"center"}
                    sx={{
                      background:
                        "linear-gradient(135deg, rgba(59,125,85,0.16), rgba(192,112,90,0.16))",
                      color: accent,
                    }}
                  >
                    <Icon />
                  </Box>
                  <Typography variant={"h6"} fontWeight={600} color={ink}>
                    {title}
                  </Typography>
                  <Typography variant={"body2"} color={inkSoft}>
                    {description}
                  </Typography>
                </Stack>
              </PaperStack>
            </Reveal>
          ))}
        </Box>
      </Stack>
    </Box>
  );
}

export default PromoteSubmodule;
