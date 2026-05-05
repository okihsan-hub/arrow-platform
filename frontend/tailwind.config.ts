import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        corporate: {
          950: "#0a0f1a",
          900: "#0f172a",
          800: "#1e293b",
          border: "#1e3a5f",
          accent: "#2563eb",
          "accent-hover": "#1d4ed8"
        }
      }
    }
  },
  plugins: []
} satisfies Config;
