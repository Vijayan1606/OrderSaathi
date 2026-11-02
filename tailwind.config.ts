import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50: "#f0f5f2",
          100: "#e0ece4",
          200: "#c2d9cb",
          300: "#99beaa",
          400: "#6d9d85",
          500: "#487d65",
          600: "#32624e",
          700: "#244d3e",
          800: "#1a3d31",
          900: "#173F35", // Primary deep forest green
          950: "#0b201a",
        },
        sage: {
          50: "#f6f9f7",
          100: "#E5EEE8", // Secondary soft sage
          200: "#cbded2",
          300: "#a9c8b4",
          400: "#80ab90",
          500: "#5d8f6f",
        },
        citrus: {
          50: "#fef9ee",
          100: "#fdf1d6",
          200: "#fbe0aa",
          300: "#f7ca74",
          400: "#f2ae3e",
          500: "#E9A83B", // Accent warm citrus
          600: "#ca7f1f",
          700: "#9f5b1a",
        },
        ivory: {
          50: "#fbfbf8",
          100: "#F8F8F3", // Background warm ivory
          200: "#f0f0e6",
          300: "#e2e2d0",
        },
        charcoal: {
          50: "#f6f7f6",
          100: "#e7e9e7",
          200: "#cfd3cf",
          300: "#aab2ab",
          400: "#7B857E", // Muted text
          500: "#576059",
          600: "#424a44",
          700: "#343b35",
          800: "#2b302c",
          900: "#202923", // Primary Charcoal
          950: "#111613",
        },
      },
      fontFamily: {
        sans: ["var(--font-manrope)", "system-ui", "sans-serif"],
        display: ["var(--font-manrope)", "system-ui", "sans-serif"],
        body: ["var(--font-dmsans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        subtle: "0 1px 3px 0 rgba(23, 63, 53, 0.05), 0 1px 2px -1px rgba(23, 63, 53, 0.05)",
        card: "0 4px 12px -2px rgba(23, 63, 53, 0.06), 0 2px 6px -2px rgba(23, 63, 53, 0.04)",
        float: "0 12px 32px -4px rgba(23, 63, 53, 0.12), 0 4px 12px -2px rgba(23, 63, 53, 0.06)",
      },
    },
  },
  plugins: [],
};

export default config;
