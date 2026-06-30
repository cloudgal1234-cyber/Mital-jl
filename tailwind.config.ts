import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: { "2xl": "1280px" },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        pearl: {
          50: "#fffdfb",
          100: "#fdf9f4",
          200: "#faf2e9",
        },
        powder: {
          50: "#fdf4f6",
          100: "#fbe8ec",
          200: "#f6d2da",
          300: "#eeb0bf",
          400: "#e28aa0",
          500: "#cf6a85",
        },
        nude: {
          50: "#faf5ef",
          100: "#f3e7d8",
          200: "#e7d2b6",
          300: "#d8b78d",
          400: "#c69b6a",
          500: "#a87f50",
        },
        gold: {
          DEFAULT: "#c9a961",
          light: "#e3cd96",
          dark: "#a3863f",
        },
        ink: "#2b2420",
        primary: {
          DEFAULT: "#cf6a85",
          foreground: "#fffdfb",
        },
        accent: {
          DEFAULT: "#c9a961",
          foreground: "#2b2420",
        },
        muted: {
          DEFAULT: "#f6efe7",
          foreground: "#7a6f64",
        },
        card: {
          DEFAULT: "#ffffff",
          foreground: "#2b2420",
        },
        destructive: {
          DEFAULT: "#c2554a",
          foreground: "#fffdfb",
        },
        input: "#e7d2b6",
        ring: "#c9a961",
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        sans: ["var(--font-sans)", "sans-serif"],
      },
      borderRadius: {
        lg: "1rem",
        xl: "1.5rem",
        "2xl": "2rem",
      },
      boxShadow: {
        soft: "0 10px 40px -15px rgba(43, 36, 32, 0.15)",
        gold: "0 8px 30px -10px rgba(201, 169, 97, 0.45)",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
      },
      animation: {
        shimmer: "shimmer 3s linear infinite",
        float: "float 6s ease-in-out infinite",
      },
      backgroundImage: {
        "gold-shimmer":
          "linear-gradient(110deg, transparent 40%, rgba(201,169,97,0.35) 50%, transparent 60%)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
