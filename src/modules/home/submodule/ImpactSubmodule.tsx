"use client";

import { ArrowForwardRounded } from "@mui/icons-material";
import { Box, Button, Stack, Typography } from "@mui/material";
import type { Ref } from "react";

import ChapterHeading from "../components/ChapterHeading";
import { Reveal } from "../components/Reveal";
import { accent, glassPanelSx, ink, pinnedHeight } from "../homeScenes";

interface ImpactSubmoduleProps {
  ref?: Ref<HTMLElement>;
}

function ImpactSubmodule({ ref }: ImpactSubmoduleProps) {
  return (
    <Box
      ref={ref}
      component={"section"}
      minHeight={{ xs: "100dvh", md: pinnedHeight }}
    >
      <Box
        top={0}
        position={{ md: "sticky" }}
        minHeight={"100dvh"}
        display={"flex"}
        alignItems={"center"}
        paddingX={{ xs: "1.5rem", md: "8%" }}
        paddingY={"6rem"}
      >
        <Stack spacing={4} maxWidth={"34rem"}>
          <Reveal from={"right"}>
            <ChapterHeading
              eyebrow={"The Journey · 03"}
              title={"To Market Impact"}
            />
          </Reveal>
          <Reveal from={"right"} delay={0.15}>
            <Stack
              spacing={3}
              padding={{ xs: "1.5rem", sm: "2rem" }}
              sx={glassPanelSx}
            >
              <Typography color={ink} lineHeight={1.8}>
                {
                  "Dashboards turn field data into evidence — guiding Thailand's craft chocolate makers toward decisions backed by real farms, real harvests, and real people."
                }
              </Typography>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                <Button
                  href={"/dashboard"}
                  variant={"contained"}
                  endIcon={<ArrowForwardRounded />}
                  sx={{
                    borderRadius: "2rem",
                    paddingX: "1.75rem",
                    background: accent,
                  }}
                >
                  {"View Dashboard"}
                </Button>
                <Button
                  href={"/form"}
                  variant={"text"}
                  endIcon={<ArrowForwardRounded />}
                  sx={{
                    borderRadius: "2rem",
                    paddingX: "1.5rem",
                    color: accent,
                  }}
                >
                  {"Explore Forms"}
                </Button>
              </Stack>
            </Stack>
          </Reveal>
        </Stack>
      </Box>
    </Box>
  );
}

export default ImpactSubmodule;
