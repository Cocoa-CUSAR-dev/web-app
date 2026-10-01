import { Box, Typography } from "@mui/material";

import { accent, displayFont, ink } from "../homeScenes";

interface ChapterHeadingProps {
  eyebrow: string;
  title: string;
  align?: "left" | "center";
}

function ChapterHeading({
  eyebrow,
  title,
  align = "left",
}: ChapterHeadingProps) {
  return (
    <Box textAlign={align}>
      <Typography
        variant={"overline"}
        color={accent}
        fontWeight={600}
        letterSpacing={"0.25em"}
        fontSize={"0.8rem"}
      >
        {eyebrow}
      </Typography>
      <Typography
        component={"h2"}
        fontFamily={displayFont}
        fontWeight={700}
        color={ink}
        fontSize={{ xs: "2.25rem", sm: "3rem", md: "3.75rem" }}
        lineHeight={1.08}
        sx={{ textShadow: "0 0.125rem 1.25rem rgba(255,255,255,0.7)" }}
      >
        {title}
      </Typography>
      <Box
        width={"4rem"}
        height={"3px"}
        borderRadius={"2px"}
        marginTop={"1.25rem"}
        marginX={align === "center" ? "auto" : 0}
        sx={{
          background: `linear-gradient(90deg, ${accent}, rgba(59,125,85,0))`,
        }}
      />
    </Box>
  );
}

export default ChapterHeading;
