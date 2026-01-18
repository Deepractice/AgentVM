/**
 * Claude-inspired warm theme colors
 */
export const theme = {
  // Background colors
  bg: {
    primary: "#FAF9F7", // Main background (warm white)
    secondary: "#F5F4F0", // Sidebar background
    tertiary: "#EFEEE8", // Hover/active states
    card: "#FFFFFF", // Cards/inputs
  },
  // Border colors
  border: {
    light: "#E8E6E0",
    medium: "#D9D6CE",
  },
  // Text colors
  text: {
    primary: "#1A1915", // Main text (warm black)
    secondary: "#6B6961", // Secondary text
    muted: "#9B9990", // Muted/placeholder
  },
  // Accent colors
  accent: {
    primary: "#D97757", // Claude orange/coral
    primaryHover: "#C4684A",
    success: "#10A37F", // Green
    error: "#EF4444", // Red
  },
  // Sizes
  sizes: {
    activityBar: "54px",
    sidebar: "260px",
  },
} as const;

// Tailwind-compatible CSS variables
export const cssVariables = `
  :root {
    --bg-primary: #FAF9F7;
    --bg-secondary: #F5F4F0;
    --bg-tertiary: #EFEEE8;
    --bg-card: #FFFFFF;
    --border-light: #E8E6E0;
    --border-medium: #D9D6CE;
    --text-primary: #1A1915;
    --text-secondary: #6B6961;
    --text-muted: #9B9990;
    --accent-primary: #D97757;
    --accent-hover: #C4684A;
  }
`;
