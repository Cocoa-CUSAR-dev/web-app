import { Stack } from "@mui/material";

import PlaceholderImage from "../components/PlaceholderImage";

function PromoteSubmodule() {
  const numElement = 8;
  const arr = [];
  for (let i = 0; i < numElement; i++) {
    arr.push(i);
  }
  return (
    <Stack
      direction={"row"}
      height={"100dvh"}
      minHeight={"20rem"}
      width={"100%"}
      alignItems={"center"}
      padding={{
        xs: "0 4rem",
        sm: "0 12rem",
        md: "0 20rem",
      }}
      spacing={4}
      flexWrap={"nowrap"}
      overflow={"auto"}
      sx={{
        scrollbarWidth: "none",
      }}
      flexShrink={0}
    >
      {arr.map((i) => {
        return <PlaceholderImage key={i} />;
      })}
    </Stack>
  );
}

export default PromoteSubmodule;
