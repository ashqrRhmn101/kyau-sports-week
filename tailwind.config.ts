import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        pitch: {
          950: "#081711",
          900: "#0B1F17",
          800: "#12301F",
          700: "#1B4229",
          600: "#1F6E43",
          500: "#2E8B57",
        },
        chalk: {
          100: "#FCFBF6",
          200: "#F5F3EA",
          300: "#E4E1D3",
        },
        floodlight: {
          400: "#FFD873",
          500: "#FFC94A",
          600: "#E8A825",
        },
        card: "rgba(245,243,234,0.06)",
        cardline: "rgba(245,243,234,0.10)",
        crimson: "#E24C4B",
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
        mono: ["var(--font-mono)"],
      },
      backgroundImage: {
        "pitch-lines": "repeating-linear-gradient(90deg, rgba(245,243,234,0.035) 0px, rgba(245,243,234,0.035) 1px, transparent 1px, transparent 64px)",
        "floodlight-glow": "radial-gradient(circle at 50% 0%, rgba(255,201,74,0.15), transparent 60%)",
      },
      letterSpacing: {
        widest2: "0.22em",
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        sportsweek: {
          primary: "#FFC94A",
          secondary: "#1F6E43",
          accent: "#E24C4B",
          neutral: "#12301F",
          "base-100": "#0B1F17",
          "base-200": "#12301F",
          "base-300": "#1B4229",
          info: "#7DD3FC",
          success: "#2E8B57",
          warning: "#FFC94A",
          error: "#E24C4B",
        },
      },
    ],
    darkTheme: "sportsweek",
  },
};

export default config;
