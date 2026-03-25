import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg-primary)",
        surface: "var(--bg-surface)",
        border: "var(--border)",
        primary: "var(--accent-purple)",
        secondary: "var(--accent-cyan)",
        textPrimary: "var(--text-primary)",
        textSecondary: "var(--text-secondary)",
        success: "var(--success)",
        danger: "var(--error)",
        "accent-purple": "var(--accent-purple)",
        "accent-cyan": "var(--accent-cyan)",
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "bg-card": "var(--bg-card)"
      },
      keyframes: {
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        dotBounce: {
          "0%, 80%, 100%": { transform: "translateY(0)", opacity: "0.6" },
          "40%": { transform: "translateY(-4px)", opacity: "1" }
        }
      },
      animation: {
        fadeInUp: "fadeInUp 220ms ease-out",
        dotBounce: "dotBounce 1.2s infinite"
      }
    }
  },
  plugins: []
};

export default config;
