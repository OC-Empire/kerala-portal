import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: { DEFAULT: "var(--card)", foreground: "var(--card-foreground)" },
        popover: { DEFAULT: "var(--popover)", foreground: "var(--popover-foreground)" },
        primary: { DEFAULT: "var(--primary)", foreground: "var(--primary-foreground)" },
        secondary: { DEFAULT: "var(--secondary)", foreground: "var(--secondary-foreground)" },
        muted: { DEFAULT: "var(--muted)", foreground: "var(--muted-foreground)" },
        accent: { DEFAULT: "var(--accent)", foreground: "var(--accent-foreground)" },
        destructive: { DEFAULT: "var(--destructive)", foreground: "var(--destructive-foreground)" },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        kerala: {
          green:   "#1B6B3A",
          light:   "#2E8B57",
          gold:    "#E8A020",
          red:     "#D94F2B",
          dark:    "#0A1628",
          surface: "#0F2744",
          card:    "#162035",
          white:   "#F9F5EE",
          muted:   "#94A3B8",
          border:  "#1E3A5F",
        },
      },
      fontFamily: {
        newsreader: ["Newsreader", "Georgia", "serif"],
        inter: ["Inter", "system-ui", "sans-serif"],
        malayalam: ["Noto Sans Malayalam", "sans-serif"],
      },
      backgroundImage: {
        "kerala-gradient": "linear-gradient(135deg, #0A1628 0%, #0F2744 50%, #162035 100%)",
        "green-glow": "radial-gradient(ellipse at top, #1B6B3A22 0%, transparent 60%)",
        "gold-glow":  "radial-gradient(ellipse at bottom right, #E8A02011 0%, transparent 60%)",
      },
      animation: {
        "pulse-slow":   "pulse 3s cubic-bezier(0.4,0,0.6,1) infinite",
        "float":        "float 6s ease-in-out infinite",
        "ripple":       "ripple 2s linear infinite",
        "slide-up":     "slideUp 0.5s ease-out",
        "fade-in":      "fadeIn 0.4s ease-out",
        "ticker":       "ticker 30s linear infinite",
      },
      keyframes: {
        float: {
          "0%,100%": { transform: "translateY(0px)" },
          "50%":     { transform: "translateY(-8px)" },
        },
        ripple: {
          "0%":   { transform: "scale(1)",   opacity: "0.8" },
          "100%": { transform: "scale(2.5)", opacity: "0" },
        },
        slideUp: {
          "0%":   { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)",    opacity: "1" },
        },
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        ticker: {
          "0%":   { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      boxShadow: {
        "kerala":      "0 0 30px #1B6B3A33",
        "gold":        "0 0 30px #E8A02033",
        "card":        "0 4px 24px #00000044",
        "glow-green":  "0 0 20px #1B6B3A55, 0 0 40px #1B6B3A22",
        "glow-gold":   "0 0 20px #E8A02055, 0 0 40px #E8A02022",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
    },
  },
  plugins: [],
};

export default config;
