"use client";

import { Stack, Typography } from "@mui/material";

import { TERMS_OF_USE_SECTIONS } from "@/modules/legal/termsOfUseSections";

// Rendered both inside AuthLoginModule's confirmation modal and on the
// standalone /terms-of-use page (see FE-7) -- one source of text so the two
// surfaces can't drift apart.
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
