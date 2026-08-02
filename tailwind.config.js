/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eefcf6",
          100: "#d6f7e8",
          200: "#aeefd3",
          300: "#76e0b7",
          400: "#3fcb94",
          500: "#1bb277",
          600: "#109060",
          700: "#0e734f",
          800: "#0f5b41",
          900: "#0d4a37",
          950: "#04281c",
        },
        ocean: {
          50: "#eef7ff",
          100: "#d9edff",
          200: "#bce0ff",
          300: "#8eccff",
          400: "#59afff",
          500: "#338dff",
          600: "#1c6df5",
          700: "#1556e1",
          800: "#1846b6",
          900: "#1a3f8f",
          950: "#142857",
        },
        sand: {
          50: "#fdf9ed",
          100: "#faf0cc",
          200: "#f4df93",
          300: "#eec95a",
          400: "#e9b233",
          500: "#e2941b",
          600: "#c87013",
          700: "#a54e13",
          800: "#853e16",
          900: "#6e3417",
          950: "#3f1809",
        },
        danger: {
          50: "#fef2f2",
          100: "#fee2e2",
          200: "#fecaca",
          300: "#fca5a5",
          400: "#f87171",
          500: "#ef4444",
          600: "#dc2626",
          700: "#b91c1c",
          800: "#991b1b",
          900: "#7f1d1d",
          950: "#450a0a",
        },
      },
      fontFamily: {
        sans: ["Plus Jakarta Sans", "system-ui", "sans-serif"],
        display: ["Sora", "system-ui", "sans-serif"],
      },
      animation: {
        "pulse-ring": "pulseRing 2s cubic-bezier(0.4,0,0.6,1) infinite",
        "sos-pulse": "sosPulse 1.5s ease-in-out infinite",
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.35s cubic-bezier(0.16,1,0.3,1)",
        "scale-in": "scaleIn 0.25s cubic-bezier(0.16,1,0.3,1)",
        shimmer: "shimmer 2s linear infinite",
        countdown: "countdown 1s linear",
        ripple: "ripple 1.4s ease-out infinite",
      },
      keyframes: {
        pulseRing: {
          "0%, 100%": { transform: "scale(1)", opacity: "0.6" },
          "50%": { transform: "scale(1.08)", opacity: "1" },
        },
        sosPulse: {
          "0%, 100%": {
            transform: "scale(1)",
            boxShadow: "0 0 0 0 rgba(239,68,68,0.7)",
          },
          "50%": {
            transform: "scale(1.05)",
            boxShadow: "0 0 0 24px rgba(239,68,68,0)",
          },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(16px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.9)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        countdown: {
          "0%": { strokeDashoffset: "0" },
          "100%": { strokeDashoffset: "283" },
        },
        ripple: {
          "0%": { transform: "scale(0.8)", opacity: "0.8" },
          "100%": { transform: "scale(2.4)", opacity: "0" },
        },
      },
      boxShadow: {
        "glow-brand": "0 0 24px rgba(27,178,119,0.35)",
        "glow-danger": "0 0 24px rgba(239,68,68,0.45)",
        card: "0 2px 8px rgba(15,23,42,0.06), 0 12px 32px rgba(15,23,42,0.08)",
        "card-lg":
          "0 4px 16px rgba(15,23,42,0.08), 0 24px 48px rgba(15,23,42,0.12)",
      },
    },
  },
  plugins: [],
};
