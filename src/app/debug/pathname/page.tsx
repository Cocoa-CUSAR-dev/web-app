"use client";

import { Stack } from "@mui/material";

import CustomBreadcrumbs from "@/components/CustomBreadcrumbs";
import { useBreadcrumbs } from "@/hooks/useBreadcrumbs";

export default function DebugPathname() {
  const breadcrumbs = useBreadcrumbs();
  return (
    <Stack padding={"3rem"}>
      <CustomBreadcrumbs
        breadcrumbs={breadcrumbs}
        textColor={"darkgray"}
        currentTextColor={"black"}
      />
    </Stack>
  );
}
