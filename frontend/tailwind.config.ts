import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./data/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#1f2937",
        stone: "#e7e5e4",
        sand: "#f9f7f3",
        pine: "#204430",
        gold: "#b87b3b",
        accent: "#3f7d4f"
      },
      boxShadow: {
        card: "0 10px 30px rgba(17, 24, 39, 0.08)"
      },
      borderRadius: {
        xl2: "1rem"
      },
      fontFamily: {
        sans: ["Avenir Next", "Nunito Sans", "Trebuchet MS", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Iowan Old Style", "Book Antiqua", "Palatino Linotype", "ui-serif", "Georgia", "serif"]
      }
    }
  },
  plugins: []
};

export default config;
