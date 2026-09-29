import { Box } from "@mui/material";

import CocoaCupLoader from "@/components/loading/CocoaCupLoader";

function Loading() {
  return (
    <Box
      width={"100%"}
      height={"100dvh"}
      display={"flex"}
      justifyContent={"center"}
      alignItems={"center"}
    >
      <CocoaCupLoader />
    </Box>
  );
}

export default Loading;
