import { Box } from "@mui/material";

function PlaceholderSection({ heightRem }: { heightRem: number }) {
  return <Box flexShrink={"0"} height={`${heightRem}rem`}></Box>;
}

export default PlaceholderSection;
