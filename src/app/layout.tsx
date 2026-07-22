import "./global.css";

import { CssBaseline } from "@mui/material";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import type { Metadata } from "next";
import { Bai_Jamjuree, IBM_Plex_Sans_Thai_Looped } from "next/font/google";

import RootProvider from "@/providers/RootProvider";
import ThemeRegistry from "@/themes/ThemeRegistry";

const baiJamjuree = Bai_Jamjuree({
  variable: "--bai-jamjuree",
  weight: ["200", "300", "400", "500", "600", "700"],
  subsets: ["thai", "latin"],
});

const ibmPlexSansThaiLooped = IBM_Plex_Sans_Thai_Looped({
  variable: "--ibm-plex-sans-thai-looped",
  weight: ["200", "300", "400", "500", "600", "700"],
  subsets: ["thai", "latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Researchers Web App",
    template: "%s | Researchers Web App",
  },
  description:
    "Researchers Web App is an app for researchers in the Thai Cocoa Project from CUSAR with collaborations with CU Intania",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${ibmPlexSansThaiLooped.variable} ${baiJamjuree.variable}`}
    >
      <body
        style={{
          margin: 0,
        }}
      >
        <AppRouterCacheProvider>
          <RootProvider>
            <ThemeRegistry>
              <CssBaseline />
              {children}
            </ThemeRegistry>
          </RootProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
