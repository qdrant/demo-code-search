import { createTheme } from "@mantine/core";

/**
 * Qdrant brand theme.
 * Colors follow the official palette: primary red #DC244C on a dark
 * #0B0F19 background, with Mona Sans for UI text and Geist Mono for code.
 */
export const theme = createTheme({
  fontFamily:
    '"Mona Sans", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  fontFamilyMonospace:
    '"Geist Mono", "JetBrains Mono", "Fira Code", "SF Mono", Consolas, monospace',
  colors: {
    // Qdrant primary red scale, primaryShade points at #DC244C.
    Primary: [
      "#FDECEF",
      "#FBD5DC",
      "#FF8792",
      "#F5587F",
      "#E93A62",
      "#DC244C",
      "#CC1845",
      "#9E0D38",
      "#7A0A2B",
      "#660223",
    ],
    // Dark-theme neutral scale: page background is #0B0F19,
    // surfaces #111824/#141A2A, borders #4E5366.
    Neutral: [
      "#F0F3FA",
      "#D3D9EB",
      "#ABB1C7",
      "#656B7F",
      "#4E5366",
      "#303547",
      "#212635",
      "#141A2A",
      "#111824",
      "#0B0F19",
    ],
  },
  primaryColor: "Primary",
  primaryShade: 5,
  defaultRadius: 8,
});
