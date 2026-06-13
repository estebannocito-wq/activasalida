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
        primary: { DEFAULT: "#F4552E", dark: "#D8431F" },
        secondary: { DEFAULT: "#1E2A78" },
        rio: "#F4552E",
        noche: "#1E2A78",
        arena: "#F4552E",
        crema: "#FFF7F4",
        tinta: "#1F2933",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
