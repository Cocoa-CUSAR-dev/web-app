"use client";

import { Stack, Typography } from "@mui/material";

function AboutUsSubmodule() {
  return (
    <Stack
      width={"100%"}
      flexShrink={0}
      alignItems={"center"}
      spacing={2}
      padding={
        "min(6rem, 100dvh - 30rem) max(1rem, calc((100% - 1280px) / 2)) 0"
      }
    >
      <Typography
        variant={"h2"}
        fontSize={{
          xs: "2rem",
          sm: "2.5rem",
          md: "3.5rem",
        }}
        fontWeight={"600"}
      >
        {"About Us"}
      </Typography>
      <Typography textAlign={"center"} maxWidth={"48rem"}>
        {
          "This platform supports cocoa research in Thailand with structured data-collection forms, farm mapping, and analytics dashboards — turning field records from farmers and researchers into evidence the craft chocolate market can act on."
        }
      </Typography>
      <Typography
        textAlign={"center"}
        maxWidth={"48rem"}
        color={"text.secondary"}
      >
        {"Built and maintained with ISTC and Chulalongkorn University."}
      </Typography>
    </Stack>
  );
}

export default AboutUsSubmodule;
