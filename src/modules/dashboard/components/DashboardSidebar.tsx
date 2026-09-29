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
  Stack,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { useBreadcrumbs } from "@/hooks/useBreadcrumbs";

import {
  dashboardMapModuleContents,
  dashboardModuleContents,
  dashboardPages,
} from "../dashboardConstants";
import { DashboardContent } from "../dashboardTypes";

const breakpoint = "lg";

// Only two top-level pages exist today (see dashboardConstants) -- keyed by
// their last path segment, same key `sidebarContent` already derives below.
const pageIcons = {
  dashboard: SpaceDashboardRounded,
  map: MapRounded,
} as const;

// Each page's sub-items are static (see dashboardConstants -- both
// DashboardModule and DashboardMapModule just push this same list into the
// old runtime context on mount), so the sidebar can read them directly
// instead of only knowing whichever page happens to be mounted right now.
// That's what lets every page's section be expanded from anywhere, not just
// the one you're currently on.
const contentByPageLink: Record<string, DashboardContent[]> = {
  "/dashboard": dashboardModuleContents,
  "/dashboard/map": dashboardMapModuleContents,
};

function DashboardSidebar() {
  const [open, setOpen] = useState<boolean>(false);

  const router = useRouter();
  const breadcrumbs = useBreadcrumbs();

  const [openPages, setOpenPages] = useState<Set<string>>(new Set());

  const currentPageLink = useMemo(() => {
    return dashboardPages.find((page) => {
      const pageLinkHierarchy = page["link"].split("/");
      const pageLabel = pageLinkHierarchy[pageLinkHierarchy.length - 1];
      return (
        breadcrumbs[breadcrumbs.length - 1] === pageLabel.toLocaleLowerCase()
      );
    })?.link;
  }, [breadcrumbs]);

  // Auto-expand whichever page you navigate to, without collapsing a
  // section you already opened manually.
  useEffect(() => {
    if (!currentPageLink) return;
    setOpenPages((prev) => {
      if (prev.has(currentPageLink)) return prev;
      return new Set(prev).add(currentPageLink);
    });
  }, [currentPageLink]);

  const sidebarContent = useMemo(() => {
    return (
      <Stack id={"sidebar-content"} width={"100%"} spacing={0.5}>
        {dashboardPages.map((page, idx) => {
          const pageLinkHierarchy = page["link"].split("/");
          const pageLabel = pageLinkHierarchy[pageLinkHierarchy.length - 1];
          const pageLink = page["link"];
          const isCurrentPage = pageLink === currentPageLink;
          const isOpen = openPages.has(pageLink);
          const pageContent = contentByPageLink[pageLink] ?? [];
          const Icon =
            pageIcons[
              pageLabel.toLocaleLowerCase() as keyof typeof pageIcons
            ] ?? SpaceDashboardRounded;

          return (
            <Stack key={"dashboard-content" + idx}>
              <Stack
                direction={"row"}
                spacing={1}
                alignItems={"center"}
                onClick={() => {
                  if (isCurrentPage) {
                    setOpenPages((prev) => {
                      const next = new Set(prev);
                      if (next.has(pageLink)) {
                        next.delete(pageLink);
                      } else {
                        next.add(pageLink);
                      }
                      return next;
                    });
                    return;
                  }
                  router.push(pageLink);
                }}
                sx={{
                  width: "100%",
                  borderRadius: "0.5rem",
                  padding: "0.5rem 0.75rem",
                  cursor: "pointer",
                  ...(isCurrentPage
                    ? {
                        bgcolor: (theme) =>
                          alpha(theme.palette.primary.main, 0.1),
                      }
                    : { "&:hover": { bgcolor: "action.hover" } }),
                }}
              >
                <Icon
                  fontSize={"small"}
                  sx={{
                    color: isCurrentPage ? "primary.dark" : "text.secondary",
                  }}
                />
                <Typography
                  variant={"body2"}
                  fontWeight={isCurrentPage ? 600 : 500}
                  color={isCurrentPage ? "primary.dark" : undefined}
                  noWrap
                  flex={1}
                >
                  {pageLabel}
                </Typography>
                <IconButton
                  size={"small"}
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenPages((prev) => {
                      const next = new Set(prev);
                      if (next.has(pageLink)) {
                        next.delete(pageLink);
                      } else {
                        next.add(pageLink);
                      }
                      return next;
                    });
                  }}
                  sx={{ padding: "0.125rem" }}
                >
                  <ExpandMoreRounded
                    fontSize={"small"}
                    sx={{
                      color: isCurrentPage ? "primary.dark" : "text.secondary",
                      transition: "transform 0.2s ease",
                      transform: isOpen ? "rotate(180deg)" : "none",
                    }}
                  />
                </IconButton>
              </Stack>
              <Collapse in={isOpen}>
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
                  {pageContent.map((content, innerIdx) => {
                    return (
                      <Box
                        key={"inner-dashboard-content" + innerIdx}
                        onClick={() => router.push(pageLink + content["link"])}
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
              </Collapse>
            </Stack>
          );
        })}
      </Stack>
    );
  }, [currentPageLink, openPages, router]);

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
