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
        brand: {
          50:  '#EEF2FF',
          100: '#E0E7FF',
          500: '#6366F1',
          600: '#4F46E5',
          700: '#4338CA',
        },
        positive: {
          DEFAULT: '#10B981',
          soft: 'var(--positive-soft)',
        },
        'neutral-sentiment': '#F59E0B',
        neutral: {
          DEFAULT: '#F59E0B',
          soft: 'var(--neutral-soft)',
        },
        negative: {
          DEFAULT: '#EF4444',
          soft: 'var(--negative-soft)',
        },
        bg: "var(--bg)",
        surface: {
          DEFAULT: "var(--surface)",
          muted: "var(--surface-muted)",
          hover: "var(--surface-hover)",
        },
        text: {
          DEFAULT: "var(--text)",
          muted: "var(--text-muted)",
          subtle: "var(--text-subtle)",
        },
        border: {
          DEFAULT: "var(--border)",
          strong: "var(--border-strong)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          hover: "var(--primary-hover)",
          soft: "var(--primary-soft)",
          muted: "var(--primary-muted)",
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
