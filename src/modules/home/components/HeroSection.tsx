import { Box, Stack, Typography } from "@mui/material";

import HeroNavBar from "./HeroNavbar";

function HeroSection() {
  return (
    <Box
      width={"100%"}
      height={"100dvh"}
      position={"relative"}
      flexShrink={"0"}
      sx={{
        background: "url(/images/darkwood-chocolate_alter.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <HeroNavBar />
      <Stack height={"100%"} justifyContent={"center"} alignItems={"center"}>
        <Typography
          variant={"h1"}
          fontWeight={700}
          color={"#FFFFFF"}
          fontSize={{
            xs: "3.5rem",
            sm: "4rem",
            md: "6rem",
          }}
        >
          {"Enhance"}
        </Typography>
        <Typography
          variant={"h1"}
          fontWeight={700}
          color={"#FFFFFF"}
          textAlign={"center"}
          lineHeight={{
            xs: "2.5rem",
            sm: "3rem",
            md: "4rem",
          }}
          fontSize={{
            xs: "2.5rem",
            sm: "3.25rem",
            md: "4.5rem",
          }}
        >
          {"Craft Chocolate Market"}
        </Typography>
        <Typography
          variant={"h1"}
          fontWeight={700}
          color={"#FFFFFF"}
          textAlign={"center"}
          fontSize={{
            xs: "2rem",
            sm: "2.75rem",
            md: "4rem",
          }}
        >
          {"In Thailand"}
        </Typography>
        <Typography
          variant={"body1"}
          color={"#FFFFFF"}
          textAlign={"center"}
          fontSize={{
            xs: "1rem",
            sm: "1.25rem",
          }}
        >
          {"with ISTC and Chulalongkorn University"}
        </Typography>
      </Stack>
      <Typography
        variant={"caption"}
        color={"#FFFFFF"}
        position={"absolute"}
        bottom={"0.25rem"}
        left={"0.25rem"}
      >
        {"Image from Jessica Loaiza (@jessicaloaizar) at Unsplash"}
      </Typography>
    </Box>
  );
}

export default HeroSection;
