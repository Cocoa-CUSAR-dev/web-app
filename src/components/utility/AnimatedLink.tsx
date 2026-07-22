"use client";

import { Link, LinkProps } from "@mui/material";
import { styled } from "@mui/material/styles";

interface AnimatedLinkProps extends LinkProps {
  bottomLineGap?: number;
}

const AnimatedLink = styled(Link, {
  shouldForwardProp: (prop) => prop !== "bottomLineGap",
})<AnimatedLinkProps>(({ bottomLineGap = 1 }: { bottomLineGap?: number }) => ({
  position: "relative",
  display: "inline-block",
  cursor: "pointer",
  "&::after": {
    content: '""',
    position: "absolute",
    bottom: bottomLineGap,
    left: 0,
    width: "0%",
    height: "2px",
    backgroundColor: "currentColor",
    transition: "width 0.3s ease",
  },

  "&:hover::after": {
    width: "100%",
  },
}));

export default AnimatedLink;
