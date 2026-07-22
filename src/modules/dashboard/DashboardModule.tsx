"use client";

import { Divider, Stack } from "@mui/material";
import { useEffect } from "react";

import { dashboardModuleContents } from "./dashboardConstants";
import { useDashboardContent } from "./hooks/useDashboardContent";
import DashboardHarvestSubmodule from "./submodule/DashboardHarvestSubmodule";
import DashboardUserSubmodule from "./submodule/DashboardUserSubmodule";

function DashboardModule() {
  // #region context
  const { setContent, setIsLoading } = useDashboardContent();

  // #region context effect
  useEffect(() => {
    try {
      setIsLoading(true);
      setContent(dashboardModuleContents);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [setContent, setIsLoading]);

  return (
    <Stack
      width={"100%"}
      height={"100%"}
      maxHeight={"100%"}
      borderTop={"1px solid grey"}
      alignItems={"start"}
      flexWrap={"nowrap"}
      minHeight={0}
      sx={{
        overflowX: "auto",
        overflowY: "auto",
        scrollbarWidth: "thin",
      }}
      id={"dashboard-container"}
      divider={<Divider flexItem />}
      spacing={3}
    >
      <DashboardHarvestSubmodule />
      <DashboardUserSubmodule />
    </Stack>
  );
}

export default DashboardModule;
