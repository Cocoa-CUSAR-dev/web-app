"use client";

import {
  EditNoteRounded,
  PhoneIphoneRounded,
  PublicRounded,
} from "@mui/icons-material";
import { Box, Stack, Typography } from "@mui/material";
import type { Ref } from "react";

import ChapterHeading from "../components/ChapterHeading";
import { Reveal } from "../components/Reveal";
import { accent, glassPanelSx, ink, inkSoft } from "../homeScenes";

const steps = [
  {
    icon: PhoneIphoneRounded,
    text: "Farmers record activities from the field via the mobile app and LINE.",
  },
  {
    icon: EditNoteRounded,
    text: "Researchers design structured forms for farm and harvest data.",
  },
  {
    icon: PublicRounded,
    text: "Every record is mapped across Thai provinces for analysis.",
  },
] as const;

interface AboutUsSubmoduleProps {
  ref?: Ref<HTMLElement>;
}

function AboutUsSubmodule({ ref }: AboutUsSubmoduleProps) {
  return (
    <Box
      ref={ref}
      component={"section"}
      minHeight={"100dvh"}
      display={"flex"}
      alignItems={"center"}
      paddingX={{ xs: "1.5rem", md: "8%" }}
      paddingY={"6rem"}
    >
      <Stack spacing={4} maxWidth={"34rem"}>
        <Reveal from={"left"}>
          <ChapterHeading
            eyebrow={"The Journey · 01"}
            title={"From Farm to Data"}
          />
        </Reveal>
        <Reveal from={"left"} delay={0.15}>
          <Stack
            spacing={2.5}
            padding={{ xs: "1.5rem", sm: "2rem" }}
            sx={glassPanelSx}
          >
            <Typography color={ink} lineHeight={1.8}>
              {
                "This platform supports cocoa research in Thailand with structured data-collection forms, farm mapping, and analytics dashboards — turning field records from farmers and researchers into evidence the craft chocolate market can act on."
              }
            </Typography>
            <Stack spacing={1.75}>
              {steps.map(({ icon: Icon, text }) => (
                <Stack
                  key={text}
                  direction={"row"}
                  spacing={1.5}
                  alignItems={"center"}
                >
                  <Box
                    flexShrink={0}
                    width={"2.25rem"}
                    height={"2.25rem"}
                    borderRadius={"50%"}
                    display={"flex"}
                    alignItems={"center"}
                    justifyContent={"center"}
                    sx={{
                      background: "rgba(59,125,85,0.12)",
                      color: accent,
                    }}
                  >
                    <Icon fontSize={"small"} />
                  </Box>
                  <Typography variant={"body2"} color={inkSoft}>
                    {text}
                  </Typography>
                </Stack>
              ))}
            </Stack>
            <Typography variant={"body2"} color={accent}>
              {"Built and maintained with ISTC and Chulalongkorn University."}
            </Typography>
          </Stack>
        </Reveal>
      </Stack>
    </Box>
  );
}

export default AboutUsSubmodule;
