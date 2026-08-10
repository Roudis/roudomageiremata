import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        surface: {
          50: "rgba(255,255,255,0.8)",
          100: "rgba(255,255,255,0.6)",
          200: "rgba(255,255,255,0.4)",
        },
      },
      animation: {
        "float": "float 6s ease-in-out infinite",
        "fade-in-up": "fadeInUp 0.8s ease-out forwards",
        "mesh": "mesh 15s ease-in-out infinite alternate",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        mesh: {
          "0%": { backgroundPosition: "0% 0%" },
          "100%": { backgroundPosition: "100% 100%" },
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "hero-glow": "conic-gradient(from 180deg at 50% 50%, #fef3c7 0deg, #ffe4e6 180deg, #ffedd5 360deg)",
      },
    },
  },
  plugins: [],
};
export default config;
