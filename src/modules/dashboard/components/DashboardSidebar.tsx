"use client";

import {
  DoubleArrowRounded,
  ExpandMoreRounded,
  MapRounded,
  SpaceDashboardRounded,
} from "@mui/icons-material";
import {
  alpha,
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

import { useBreadcrumbs } from "@/hooks/useBreadcrumbs";

import { dashboardPages } from "../dashboardConstants";
import { useDashboardContent } from "../hooks/useDashboardContent";

const breakpoint = "lg";

// Only two top-level pages exist today (see dashboardConstants) -- keyed by
// their last path segment, same key `sidebarContent` already derives below.
const pageIcons = {
  dashboard: SpaceDashboardRounded,
  map: MapRounded,
} as const;

function DashboardSidebar() {
  const [open, setOpen] = useState<boolean>(false);

  const router = useRouter();
  const { content, isLoading: isContentLoading } = useDashboardContent();
  const breadcrumbs = useBreadcrumbs();

  const { isShowing, setIsShowing } = useDashboardContent();

  const sidebarContent = useMemo(() => {
    return (
      <Stack id={"sidebar-content"} width={"100%"} spacing={0.5}>
        {dashboardPages.map((page, idx) => {
          const pageLinkHierarchy = page["link"].split("/");
          const pageLabel = pageLinkHierarchy[pageLinkHierarchy.length - 1];
          const pageLink = page["link"];
          const isCurrentPage =
            breadcrumbs[breadcrumbs.length - 1] ===
            pageLabel.toLocaleLowerCase();
          const Icon =
            pageIcons[pageLabel.toLocaleLowerCase() as keyof typeof pageIcons] ??
            SpaceDashboardRounded;

          if (!isCurrentPage) {
            return (
              <Stack
                key={"dashboard-content" + idx}
                direction={"row"}
                spacing={1}
                alignItems={"center"}
                onClick={() => router.push(pageLink)}
                sx={{
                  width: "100%",
                  borderRadius: "0.5rem",
                  padding: "0.5rem 0.75rem",
                  cursor: "pointer",
                  "&:hover": { bgcolor: "action.hover" },
                }}
              >
                <Icon fontSize={"small"} sx={{ color: "text.secondary" }} />
                <Typography variant={"body2"} fontWeight={500} noWrap>
                  {pageLabel}
                </Typography>
              </Stack>
            );
          }

          return (
            <Stack key={"dashboard-content" + idx}>
              <Stack
                direction={"row"}
                spacing={1}
                alignItems={"center"}
                onClick={() => setIsShowing((isShowing) => !isShowing)}
                sx={{
                  width: "100%",
                  borderRadius: "0.5rem",
                  padding: "0.5rem 0.75rem",
                  cursor: "pointer",
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                }}
              >
                <Icon fontSize={"small"} sx={{ color: "primary.dark" }} />
                <Typography
                  variant={"body2"}
                  fontWeight={600}
                  color={"primary.dark"}
                  noWrap
                  flex={1}
                >
                  {pageLabel}
                </Typography>
                <ExpandMoreRounded
                  fontSize={"small"}
                  sx={{
                    color: "primary.dark",
                    transition: "transform 0.2s ease",
                    transform: isShowing ? "rotate(180deg)" : "none",
                  }}
                />
              </Stack>
              <Collapse in={isShowing}>
                {isContentLoading || !content ? (
                  <Box padding={"0.5rem 0.75rem 0.5rem 2.25rem"}>
                    <Skeleton variant={"rounded"} height={"6rem"} />
                  </Box>
                ) : (
                  <Stack
                    padding={"0.25rem 0.5rem 0.25rem 1.75rem"}
                    spacing={0.25}
                    width={"100%"}
                    sx={{
                      borderLeft: "1px solid",
                      borderColor: "divider",
                      marginLeft: "1rem",
                    }}
                  >
                    {content.map((content, innerIdx) => {
                      return (
                        <Box
                          key={"inner-dashboard-content" + innerIdx}
                          onClick={() => router.push(content["link"])}
                          sx={{
                            borderRadius: "0.5rem",
                            padding: "0.375rem 0.75rem",
                            cursor: "pointer",
                            "&:hover": { bgcolor: "action.hover" },
                          }}
                        >
                          <Typography
                            variant={"body2"}
                            color={"text.secondary"}
                            noWrap
                          >
                            {content["label"]}
                          </Typography>
                        </Box>
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
        bgcolor={"background.paper"}
        display={{
          xs: "none",
          [breakpoint]: "flex",
        }}
        width={"13rem"}
        maxWidth={"50%"}
        height={"100%"}
        sx={{
          borderRight: "1px solid",
          borderColor: "divider",
        }}
        padding={"1.5rem 0.75rem"}
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
            backgroundColor: "background.paper",
            color: "text.secondary",
            display: {
              [breakpoint]: "none",
            },
            outline: "1px solid",
            outlineColor: "divider",
            "&:hover": {
              backgroundColor: "action.hover",
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
            bgcolor={"background.paper"}
            width={"16rem"}
            height={"100%"}
            padding={"1.5rem 0.75rem"}
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
