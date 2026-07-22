import { Box, Stack } from "@mui/material";

import InstantBreadcrumbs from "@/components/InstantBreadcrumbs";

function FormLayout({ children }: { children: React.ReactNode }) {
  return (
    <Stack
      width={"100%"}
      height={"100%"}
      alignItems={"center"}
      sx={{
        paddingX: "clamp(0px, calc((100% - 1280px) / 2), 2rem)",
      }}
    >
      <Stack
        width={"100%"}
        maxWidth={"1280px"}
        height={"100%"}
        spacing={1}
        padding={"2rem"}
        sx={
          {
            // borderRight: "1px solid grey",
            // borderLeft: "1px solid grey",
          }
        }
      >
        <InstantBreadcrumbs />
        <Box width={"100%"} flex={"1"}>
          {children}
        </Box>
      </Stack>
    </Stack>
  );
}

export default FormLayout;
