"use client";

import { Stack, Typography } from "@mui/material";

function AboutUsSubmodule() {
  return (
    <Stack
      width={"100%"}
      flexShrink={0}
      alignItems={"center"}
      padding={
        "min(6rem, 100dvh - 30rem) max(1rem, calc((100% - 1280px) / 2)) 0"
      }
    >
      <Typography
        variant={"h2"}
        fontSize={{
          xs: "2rem",
          sm: "2.5rem",
          md: "3.5rem",
        }}
        fontWeight={"600"}
      >
        {"About Us"}
      </Typography>
      <Typography>
        {`Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum luctus velit quis risus rutrum facilisis. Praesent fringilla justo ac nunc vehicula, et sollicitudin neque tristique. Nulla at sapien malesuada, blandit tellus ut, blandit massa. Proin ligula eros, blandit ac dolor feugiat, tincidunt faucibus mauris. Donec laoreet hendrerit felis, ut fermentum felis sodales vitae. Curabitur dictum iaculis varius. Donec aliquam enim felis, facilisis pellentesque risus gravida ac. Proin viverra venenatis est sed pulvinar. Nullam in odio vehicula, feugiat justo quis, laoreet erat. Interdum et malesuada fames ac ante ipsum primis in faucibus. Sed malesuada nisl elit, sed molestie dui venenatis consectetur.`}
      </Typography>
    </Stack>
  );
}

export default AboutUsSubmodule;
