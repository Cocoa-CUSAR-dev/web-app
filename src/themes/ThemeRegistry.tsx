"use client";

import { ThemeProvider } from "@mui/material/styles";

import { mainTheme } from "./mainTheme";

function ThemeRegistry({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={mainTheme}>{children}</ThemeProvider>;
}

export default ThemeRegistry;
