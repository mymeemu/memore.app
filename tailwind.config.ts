
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        memore: {
          purple: "#8257FF",
          pink: "#FF4FA3",
          yellow: "#FFD84D",
          mint: "#5BE6B0",
          dark: "#211B36"
        }
      }
    }
  },
  plugins: []
};

export default config;
