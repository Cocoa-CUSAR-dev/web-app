"use client";

import { DoubleArrowRounded, NavigateNextRounded } from "@mui/icons-material";
import {
  Box,
  Collapse,
  Drawer,
  IconButton,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import AnimatedLink from "@/components/utility/AnimatedLink";
import { useBreadcrumbs } from "@/hooks/useBreadcrumbs";

import { dashboardPages } from "../dashboardConstants";
import { useDashboardContent } from "../hooks/useDashboardContent";

const breakpoint = "lg";

function DashboardSidebar() {
  const [open, setOpen] = useState<boolean>(false);

  const router = useRouter();
  const { content, isLoading: isContentLoading } = useDashboardContent();
  const breadcrumbs = useBreadcrumbs();

  const { isShowing, setIsShowing } = useDashboardContent();

  const sidebarContent = useMemo(() => {
    return (
      <Stack id={"sidebar-content"} width={"100%"}>
        {dashboardPages.map((page, idx) => {
          const pageLinkHierarchy = page["link"].split("/");
          const pageLabel = pageLinkHierarchy[pageLinkHierarchy.length - 1];
          const pageLink = page["link"];
          const isCurrentPage =
            breadcrumbs[breadcrumbs.length - 1] ===
            pageLabel.toLocaleLowerCase();

          if (!isCurrentPage) {
            return (
              <Stack
                key={"dashboard-content" + idx}
                direction={"row"}
                spacing={"0.5"}
                alignItems={"center"}
                width={"100%"}
              >
                <IconButton
                  onClick={() => {
                    router.push(pageLink);
                  }}
                  sx={{
                    padding: "0.25rem",
                  }}
                >
                  <NavigateNextRounded />
                </IconButton>
                <AnimatedLink
                  href={pageLink}
                  underline={"none"}
                  color={"#000000"}
                  bottomLineGap={3}
                  paddingTop={"0.125rem"}
                  noWrap
                >
                  {pageLabel}
                </AnimatedLink>
              </Stack>
            );
          }

          return (
            <Stack key={"dashboard-content" + idx}>
              <Stack direction={"row"} alignItems={"center"}>
                <IconButton
                  onClick={() => {
                    setIsShowing((isShowing) => !isShowing);
                  }}
                  sx={{
                    padding: "0.25rem",
                    rotate: isShowing ? "90deg" : "none",
                  }}
                >
                  <NavigateNextRounded color={"action"} />
                </IconButton>
                <Typography color={"#000000"} paddingTop={"0.125rem"} noWrap>
                  {pageLabel}
                </Typography>
              </Stack>
              <Collapse in={isShowing}>
                {isContentLoading || !content ? (
                  <Box padding={"0.5rem 2rem"}>
                    <Skeleton variant={"rectangular"} height={"8rem"} />
                  </Box>
                ) : (
                  <Stack padding={"0.5rem 2rem"} spacing={1} width={"100%"}>
                    {content.map((content, innerIdx) => {
                      return (
                        <AnimatedLink
                          key={"inner-dashboard-content" + innerIdx}
                          href={content["link"]}
                          underline={"none"}
                          width={"fit-content"}
                          color={"black"}
                          variant={"body2"}
                          noWrap
                        >
                          {content["label"]}
                        </AnimatedLink>
                      );
                    })}
                  </Stack>
                )}
              </Collapse>
            </Stack>
          );
        })}
      </Stack>
    );
  }, [breadcrumbs, content, isContentLoading, isShowing, router, setIsShowing]);

  const desktopSidebar = useMemo(() => {
    return (
      <Stack
        alignItems={"start"}
        bgcolor={"#FFFFFF"}
        color={"#FFFFFF"}
        display={{
          xs: "none",
          [breakpoint]: "flex",
        }}
        width={"10rem"}
        maxWidth={"50%"}
        height={"100%"}
        sx={{
          borderRight: "1px solid #808080",
        }}
        padding={"1.5rem 0.5rem"}
      >
        {sidebarContent}
      </Stack>
    );
  }, [sidebarContent]);

  const mobileSidebar = useMemo(() => {
    return (
      <>
        <IconButton
          onClick={() => {
            setOpen((p) => !p);
          }}
          sx={{
            height: "100%",
            borderRadius: "0",
            backgroundColor: "#FFFFFF",
            color: "#808080",
            display: {
              [breakpoint]: "none",
            },
            outline: "1px solid #808080",
            "&:hover": {
              backgroundColor: "#F0F0F0",
            },
          }}
        >
          <DoubleArrowRounded />
        </IconButton>
        <Drawer
          open={open}
          onClose={() => {
            setOpen(false);
          }}
          sx={{
            display: {
              [breakpoint]: "none",
            },
          }}
          anchor={"left"}
        >
          <Stack
            bgcolor={"#white"}
            color={"white"}
            width={"16rem"}
            height={"100%"}
            padding={"1.5rem 0.5rem"}
          >
            {sidebarContent}
          </Stack>
        </Drawer>
      </>
    );
  }, [open, sidebarContent]);

  return (
    <>
      {desktopSidebar}
      {mobileSidebar}
    </>
  );
}

export default DashboardSidebar;
