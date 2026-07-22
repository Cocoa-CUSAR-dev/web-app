import { Stack } from "@mui/material";

import Footer from "./components/Footer";
import HeroSection from "./components/HeroSection";
import AboutUsSubmodule from "./submodule/AboutUsSubmodule";
import PromoteSubmodule from "./submodule/PromoteSubmodule";

function HomeModule() {
  return (
    <Stack
      height={"100dvh"}
      minHeight={"100dvh"}
      flexWrap={"nowrap"}
      sx={{
        overflowY: "auto",
        scrollbarWidth: "thin",
      }}
    >
      <HeroSection />
      <AboutUsSubmodule />
      <PromoteSubmodule />
      <Footer />
    </Stack>
  );
}

export default HomeModule;
