/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: {
          DEFAULT: "var(--surface)",
          muted: "var(--surface-muted)",
        },
        text: {
          DEFAULT: "var(--text)",
          muted: "var(--text-muted)",
        },
        border: "var(--border)",
        primary: {
          DEFAULT: "var(--primary)",
          hover: "var(--primary-hover)",
        },
        positive: {
          DEFAULT: "var(--positive)",
          soft: "var(--positive-soft)",
        },
        negative: {
          DEFAULT: "var(--negative)",
          soft: "var(--negative-soft)",
        },
        neutral: {
          DEFAULT: "var(--neutral)",
          soft: "var(--neutral-soft)",
        },
        info: "var(--info)",
        warning: "var(--warning)",
        danger: "var(--danger)",
      },
      borderRadius: {
        card: "14px",
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
};

