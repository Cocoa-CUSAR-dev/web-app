"use client";

import { Box, Paper, Typography } from "@mui/material";

function PlaceholderImage() {
  return (
    <Box
      component={Paper}
      elevation={2}
      height={"70%"}
      borderRadius={"1rem"}
      display={"flex"}
      justifyContent={"center"}
      alignItems={"center"}
      sx={{
        aspectRatio: "9/16",
      }}
    >
      <Typography variant={"body1"}>{"Placeholder"}</Typography>
    </Box>
  );
}

export default PlaceholderImage;
