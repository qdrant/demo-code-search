import { heights, sizing, widths } from "./sizing";
import { createTheme } from "@mantine/core";

export const theme = createTheme({
  fontFamily: "Roboto,Roboto Mono",
  colors: {
    Primary: [
      "#FFC2D6",
      "#F5587F",
      "#DC244C",
      "#A31030",
      "#660223",
      "#FFC2D6",
      "#F5587F",
      "#DC244C",
      "#A31030",
      "#660223",
    ],

    neutral: [
      "#F2F6FF",
      "#DCE4FA",
      "#AEBDE5",
      "#8B9CCC",
      "#6A80BD",
      "#5069AD",
      "#39508F",
      "#1F3266",
      "#102252",
      "#06153D",
    ],
    pink: [
      "#FFF0F6",
      "#FFDEEB",
      "#FCC2D7",
      "#FAA2C1",
      "#F783AC",
      "#F06595",
      "#DC244C",
      "#D6336C",
      "#C2255C",
      "#A61E4D",
    ],
  },
  primaryColor: "Primary",
  primaryShade: 2,
  spacing: {
    xxs: "0.2rem",
  },
  other: {
    sizing,
    heights,
    widths,
    fontWeights: {
      thin: 100,
      extraLight: 200,
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
      black: 900,
    },
    subheading: {
      sizes: {
        SH18: {
          fontSize: "1.125rem",
          lineHeight: "1.5rem",
        },
        SH12: {
          fontSize: "0.75rem",
          lineHeight: "1.125rem",
        },
      },
    },
    paragraph: {
      sizes: {
        P24: {
          fontSize: "1.5rem",
          lineHeight: "2rem",
        },
        P18: {
          fontSize: "1.125rem",
          lineHeight: "1.6875rem",
          fontWeight: 400,
        },
        P16: {
          fontSize: "1rem",
          lineHeight: "1.5rem",
        },
        P14: {
          fontSize: "0.875rem",
          lineHeight: "1.3125rem",
          fontWeight: 400,
        },
        P12: {
          fontSize: "0.75rem",
          lineHeight: "1.125rem",
        },
      },
    },
  },
});
