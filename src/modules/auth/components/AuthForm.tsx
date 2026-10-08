"use client";

import {
  Box,
  Button,
  CircularProgress,
  Link,
  Stack,
  Typography,
} from "@mui/material";

function AuthForm({
  title,
  children,
  onSubmit,
  disabledOnSubmit = false,
  footerLinkLabel,
  footerLink,
  onCornderButtonClick,
  cornerButtonLabel,
  isLoading = false,
}: {
  title: string;
  children: React.ReactNode;
  onSubmit?: () => void;
  disabledOnSubmit?: boolean;
  footerLinkLabel?: string;
  footerLink?: string;
  onCornderButtonClick?: () => void;
  cornerButtonLabel?: string;
  isLoading?: boolean;
}) {
  const content: React.ReactNode = (
    <>
      <Link
        href={"/"}
        underline={"hover"}
        position={"absolute"}
        top={"0.75rem"}
        left={"0.75rem"}
        padding={"0.5rem"}
        fontSize={"0.75rem"}
      >
        {"Home"}
      </Link>
      <Typography fontSize={"1.75rem"}>{title}</Typography>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (disabledOnSubmit) return;
          if (onSubmit) onSubmit();
        }}
        style={{
          width: "100%",
        }}
      >
        {children}
      </form>
      {footerLink && (
        <Link
          href={footerLink}
          underline={"none"}
          sx={{
            position: "absolute",
            fontSize: "0.75rem",
            bottom: "1rem",
            left: "1rem",
          }}
        >
          {footerLinkLabel ?? "Click Here"}
        </Link>
      )}
      {onCornderButtonClick && (
        <Typography
          component={Button}
          onClick={() => {
            onCornderButtonClick();
          }}
          fontSize={"0.75rem"}
          position={"absolute"}
          bottom={"0.75rem"}
          left={"0.75rem"}
          textTransform={"none"}
        >
          {cornerButtonLabel ?? "Click Here"}
        </Typography>
      )}
    </>
  );

  const loadingForeground = isLoading && (
    <Box
      width={"100%"}
      height={"100%"}
      position={"fixed"}
      top={"0"}
      left={"0"}
      sx={{
        opacity: "0.33",
      }}
      display={"flex"}
      justifyContent={"center"}
      alignItems={"center"}
      bgcolor={"white"}
    >
      <CircularProgress size={"1.5rem"} />
    </Box>
  );

  return (
    <Stack
      width={"24rem"}
      padding={onCornderButtonClick ? "2.75rem 2rem 3.5rem" : "2.75rem 2rem"}
      borderRadius={"0.5rem"}
      sx={{
        outline: "1px solid lightgray",
      }}
      alignItems={"center"}
      position={"relative"}
      spacing={2}
    >
      {content}
      {loadingForeground}
    </Stack>
  );
}

export default AuthForm;
