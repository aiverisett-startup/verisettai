import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
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
