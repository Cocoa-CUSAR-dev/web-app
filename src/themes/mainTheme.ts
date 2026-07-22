import { createTheme } from "@mui/material/styles";

const mainTheme = createTheme({
  typography: {
    fontFamily: "var(--ibm-plex-sans-thai-looped), sans-serif",
    htmlFontSize: 16,
    fontSize: 14,
    h1: {
      fontSize: "2rem",
      fontWeight: "500",
      lineHeight: "150%",
    },
    h2: {
      fontSize: "1.75rem",
      fontWeight: "400",
      lineHeight: "150%",
    },
    h3: {
      fontSize: "1.5rem",
      fontWeight: "400",
      lineHeight: "150%",
    },
    h4: {
      fontSize: "1.25rem",
      fontWeight: "400",
      lineHeight: "150%",
    },
    h5: {
      fontSize: "1.25rem",
      fontWeight: "400",
      lineHeight: "150%",
    },
    h6: {
      fontSize: "1.25rem",
      fontWeight: "400",
      lineHeight: "150%",
    },
    body1: {
      fontSize: "1rem",
      fontWeight: "400",
      lineHeight: "175%",
    },
    body2: {
      fontSize: "0.875rem",
      fontWeight: "400",
      lineHeight: "150%",
    },
    button: {
      fontSize: "1rem",
      fontWeight: "500",
      textTransform: "none",
    },
    caption: {
      fontSize: "0.875rem",
    },
    subtitle1: {
      fontSize: "0.875rem",
    },
    subtitle2: {
      fontSize: "0.75rem",
      fontWeight: "400",
    },
  },
  palette: {
    primary: {
      main: "#518D29",
      light: "#63a338",
      dark: "#3d691d",
      contrastText: "white",
    },
  },
  components: {
    MuiToggleButton: {
      defaultProps: {
        style: {
          padding: "0.125rem 0.75rem",
          textTransform: "none",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          width: "inherit",
        },
      },
    },
  },
});

export { mainTheme };
