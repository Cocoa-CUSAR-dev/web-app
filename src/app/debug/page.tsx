"use client";

import { Button, Stack, Tooltip, Typography } from "@mui/material";

import CustomBreadcrumbs from "@/components/CustomBreadcrumbs";
import { CustomToast } from "@/components/utility/CustomToast";
import { useBreadcrumbs } from "@/hooks/useBreadcrumbs";

export default function Debug() {
  const breadcrumbs = useBreadcrumbs();
  return (
    <Stack padding={"3rem"} spacing={2} alignItems={"start"}>
      <Button
        variant={"outlined"}
        onClick={() => {
          CustomToast.success("Yay!");
        }}
      >
        {"Test Success Toast"}
      </Button>
      <CustomBreadcrumbs
        breadcrumbs={breadcrumbs}
        textColor={"#505050"}
        currentTextColor={"#000000"}
      />
      <Tooltip open={true} placement={"right"} title={"Hey"} arrow>
        <Typography>{"Hello"}</Typography>
      </Tooltip>
    </Stack>
  );
}
