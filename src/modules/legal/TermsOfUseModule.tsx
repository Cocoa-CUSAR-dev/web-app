"use client";

import { Stack, Typography } from "@mui/material";

import TermsOfUseContent from "@/modules/legal/TermsOfUseContent";

function TermsOfUseModule() {
  return (
    <Stack
      width={"100%"}
      alignItems={"center"}
      padding={{ xs: "3rem 1rem", md: "4rem calc((100% - 1280px) / 2)" }}
    >
      <Stack width={"100%"} maxWidth={"48rem"} spacing={3}>
        <Typography
          variant={"h2"}
          fontSize={{ xs: "2rem", sm: "2.5rem" }}
          fontWeight={600}
        >
          {"Terms of Use"}
        </Typography>
        <TermsOfUseContent />
      </Stack>
    </Stack>
  );
}

export default TermsOfUseModule;
