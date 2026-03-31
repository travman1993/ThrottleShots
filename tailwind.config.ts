import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0a0a0a",
        "bg-card": "#141414",
        "bg-elevated": "#1c1c1c",
        "bg-hover": "#242424",
        accent: "#ff4d00",
        "accent-hover": "#ff6a2a",
        "text-primary": "#f0f0f0",
        "text-secondary": "#8a8a8a",
        "text-muted": "#555555",
        border: "#2a2a2a",
        "border-hover": "#3a3a3a",
      },
      fontFamily: {
        display: ['"Bebas Neue"', "sans-serif"],
        body: ['"DM Sans"', "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;