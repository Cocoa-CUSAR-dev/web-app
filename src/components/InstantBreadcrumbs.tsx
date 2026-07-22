"use client";

import { useBreadcrumbs } from "@/hooks/useBreadcrumbs";

import CustomBreadcrumbs from "./CustomBreadcrumbs";

function InstantBreadcrumbs({
  textColor = "#404040",
  currentTextColor = "#202020",
}: {
  textColor?: string;
  currentTextColor?: string;
}) {
  const breadcrumbs = useBreadcrumbs();
  return (
    <CustomBreadcrumbs
      breadcrumbs={breadcrumbs}
      textColor={textColor}
      currentTextColor={currentTextColor}
    />
  );
}

export default InstantBreadcrumbs;
