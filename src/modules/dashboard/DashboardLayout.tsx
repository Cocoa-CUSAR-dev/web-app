"use client";

import { Box, Stack, Typography } from "@mui/material";
import { usePathname } from "next/navigation";
import { createContext, useContext, useMemo, useState } from "react";

import InstantBreadcrumbs from "@/components/InstantBreadcrumbs";

import DashboardSidebar from "./components/DashboardSidebar";
import { DashboardContentProvider } from "./hooks/useDashboardContent";

const DashboardTitleContext = createContext<{
  title: string | React.ReactNode;
  setTitle: (title: string) => void;
}>({
  title: "",
  setTitle: () => {},
});

function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [title, setTitle] = useState<string>("");
  const contextValue = useMemo(() => {
    return {
      title,
      setTitle,
    };
  }, [title]);

  const pathname = usePathname();
  console.log(pathname);
  return (
    <Stack
      width={"100%"}
      height={"100%"}
      direction={"row"}
      id={"dashboard-layout"}
    >
      <DashboardContentProvider>
        <DashboardTitleContext value={contextValue}>
          <DashboardSidebar />
          <Stack flex={"1"} minWidth={"0"}>
            <Stack
              padding={"1rem 2rem"}
              direction={"row"}
              alignItems={"start"}
              justifyContent={"space-between"}
            >
              <Box
                display={{
                  xs: pathname.includes("map") ? "none" : "block",
                  sm: "block",
                }}
              >
                <InstantBreadcrumbs />
              </Box>
              <Typography variant={"h4"} fontWeight={500}>
                {title
                  ? title
                  : pathname.includes("map")
                    ? "กรุณาเลือกจังหวัด"
                    : ""}
              </Typography>
            </Stack>
            <Box flex={"1"} minWidth={"0"} overflow={"hidden"}>
              {children}
            </Box>
          </Stack>
        </DashboardTitleContext>
      </DashboardContentProvider>
    </Stack>
  );
}

export default DashboardLayout;

function useDashboardTitle() {
  const context = useContext(DashboardTitleContext);
  if (!context) {
    throw new Error("useDashboardTitle is only available in Dashboard module");
  }
  return context;
}

export { useDashboardTitle };
