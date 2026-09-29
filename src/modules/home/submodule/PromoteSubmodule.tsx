"use client";

import {
  DescriptionRounded,
  HistoryRounded,
  InsightsRounded,
  MapRounded,
} from "@mui/icons-material";
import { alpha, Stack, Typography } from "@mui/material";

const features = [
  {
    title: "Data Collection Forms",
    description:
      "Build and manage structured forms for farm and harvest records.",
    icon: DescriptionRounded,
  },
  {
    title: "Analytics Dashboard",
    description:
      "Track harvest trends, yields, and farmer activity over time.",
    icon: InsightsRounded,
  },
  {
    title: "Farm Mapping",
    description:
      "View submissions and plots geographically across provinces.",
    icon: MapRounded,
  },
  {
    title: "Submission History",
    description: "Review every recorded activity and diary entry by farmer.",
    icon: HistoryRounded,
  },
] as const;

function PromoteSubmodule() {
  return (
    <Stack
      width={"100%"}
      flexShrink={0}
      alignItems={"center"}
      spacing={4}
      padding={{
        xs: "4rem 1.5rem",
        md: "6rem max(1.5rem, calc((100% - 1280px) / 2))",
      }}
    >
      <Stack spacing={1} alignItems={"center"} textAlign={"center"}>
        <Typography
          variant={"h2"}
          fontWeight={600}
          fontSize={{ xs: "1.75rem", sm: "2.25rem" }}
        >
          {"What You Can Do"}
        </Typography>
        <Typography color={"text.secondary"} maxWidth={"36rem"}>
          {
            "Everything researchers need to collect, analyze, and track cocoa farm data in one place."
          }
        </Typography>
      </Stack>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        flexWrap={"wrap"}
        justifyContent={"center"}
        spacing={3}
        width={"100%"}
      >
        {features.map(({ title, description, icon: Icon }) => (
          <Stack
            key={title}
            spacing={1.5}
            alignItems={"center"}
            textAlign={"center"}
            sx={{ width: { xs: "100%", sm: "14rem" } }}
          >
            <Stack
              width={"3.5rem"}
              height={"3.5rem"}
              borderRadius={"50%"}
              alignItems={"center"}
              justifyContent={"center"}
              sx={{
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.12),
                color: "primary.dark",
              }}
            >
              <Icon fontSize={"medium"} />
            </Stack>
            <Typography variant={"h6"} fontWeight={600}>
              {title}
            </Typography>
            <Typography variant={"body2"} color={"text.secondary"}>
              {description}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Stack>
  );
}

export default PromoteSubmodule;
