import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "Geist Sans",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        mono: [
          "Geist Mono",
          "JetBrains Mono",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },
      colors: {
        obsidian: {
          DEFAULT: "#09090b",
          950: "#000000",
          900: "#09090b",
          800: "#18181b",
          700: "#27272a",
        },
        electric: {
          blue: "#2563eb",
          cyan: "#06b6d4",
          sky: "#38bdf8",
        },
      },
    },
  },
  plugins: [],
};

export default config;
