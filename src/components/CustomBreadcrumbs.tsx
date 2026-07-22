import { ArrowBackIosNew, HomeRounded } from "@mui/icons-material";
import { Breadcrumbs, IconButton, Stack } from "@mui/material";
import { useRouter } from "next/navigation";

import type { Breadcrumbs as BreadcrumsType } from "@/core/types";

import AnimatedLink from "./utility/AnimatedLink";

function CustomBreadcrumbs({
  breadcrumbs,
  textColor = "#f3f3f3",
  currentTextColor = "#ffffff",
  icon,
}: {
  breadcrumbs: BreadcrumsType;
  textColor?: string;
  currentTextColor?: string;
  icon?: React.ReactNode;
}) {
  const router = useRouter();

  const defaultIcon = (
    <IconButton
      onClick={() => {
        router.push("/");
      }}
      disableRipple={true}
      sx={{
        padding: "0",
      }}
    >
      <HomeRounded />
    </IconButton>
  );

  return (
    <Stack
      direction={"row"}
      spacing={0.5}
      alignItems={"center"}
      divider={
        <ArrowBackIosNew
          sx={{
            width: "1rem",
            height: "1rem",
            rotate: "180deg",
          }}
        />
      }
    >
      {icon ?? defaultIcon}
      <Breadcrumbs
        aria-label={"breadcrumb"}
        sx={{
          paddingTop: "0.25rem",
        }}
      >
        {breadcrumbs.map((breadcrumb, idx) => {
          const title = breadcrumb[0].toUpperCase() + breadcrumb.slice(1);
          const isLast = idx === breadcrumbs.length - 1;
          return (
            <AnimatedLink
              key={breadcrumb + idx}
              underline={"none"}
              href={
                idx === breadcrumbs.length - 1
                  ? undefined
                  : `/${breadcrumbs.slice(0, idx + 1).join("/")}`
              }
              color={isLast ? currentTextColor : textColor}
              bottomLineGap={2}
            >
              {title}
            </AnimatedLink>
          );
        })}
      </Breadcrumbs>
    </Stack>
  );
}

export default CustomBreadcrumbs;
