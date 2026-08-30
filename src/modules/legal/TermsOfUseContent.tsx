"use client";

import { Stack, Typography } from "@mui/material";

import { TERMS_OF_USE_SECTIONS } from "@/modules/legal/termsOfUseSections";

function TermsOfUseContent() {
  return (
    <Stack spacing={2}>
      {TERMS_OF_USE_SECTIONS.map((section) => (
        <Stack key={section.heading} spacing={0.5}>
          <Typography variant={"subtitle1"} fontWeight={600}>
            {section.heading}
          </Typography>
          <Typography variant={"body1"} textAlign={"justify"}>
            {section.body}
          </Typography>
        </Stack>
      ))}
    </Stack>
  );
}

export default TermsOfUseContent;
