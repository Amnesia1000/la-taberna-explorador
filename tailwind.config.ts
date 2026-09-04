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
        background: "var(--background)",
        foreground: "var(--foreground)",
        tavern: {
          dark: "#190f09",
          wood: "#2c1a11",
          oak: "#42281a",
          leather: "#633c24",
          parchment: "#fcf8ef",
          parchmentDark: "#f4ead2",
          parchmentBorder: "#d8c49e",
          amber: "#d97706",
          gold: "#b45309",
          brass: "#c27803",
          forest: "#1c3d2e",
          wine: "#661720",
        },
      },
      fontFamily: {
        tavern: ["var(--font-cinzel)", "Georgia", "serif"],
        serif: ["var(--font-crimson)", "Georgia", "serif"],
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },
      boxShadow: {
        tavern: "0 4px 20px -2px rgba(44, 26, 17, 0.15)",
        parchment: "0 2px 10px rgba(66, 40, 26, 0.08)",
        glow: "0 0 15px rgba(217, 119, 6, 0.25)",
      },
    },
  },
  plugins: [],
};

export default config;
