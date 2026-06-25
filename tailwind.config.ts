import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Rwanda-inspired palette
        sky: {
          DEFAULT: "#20a4f3",
        },
        brand: {
          blue: "#1eb0ff",
          deep: "#0a2540",
          sun: "#ffd200",
          green: "#1fc77d",
          red: "#ff5d5d",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(255,255,255,0.06), 0 10px 40px -10px rgba(30,176,255,0.45)",
        card: "0 20px 60px -20px rgba(0,0,0,0.55)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pop": {
          "0%": { transform: "scale(0.92)" },
          "60%": { transform: "scale(1.04)" },
          "100%": { transform: "scale(1)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        "pulse-ring": {
          "0%": { boxShadow: "0 0 0 0 rgba(31,199,125,0.5)" },
          "100%": { boxShadow: "0 0 0 16px rgba(31,199,125,0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s cubic-bezier(0.22,1,0.36,1) both",
        pop: "pop 0.35s cubic-bezier(0.22,1,0.36,1) both",
        "pulse-ring": "pulse-ring 1s ease-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
