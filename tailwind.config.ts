import type { Config } from "tailwindcss";

/** A colour backed by a CSS variable in app/globals.css, so `bg-primary/50` and dark mode both work. */
const token = (name: string) => `hsl(var(--${name}) / <alpha-value>)`;

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: token("background"),
        foreground: token("foreground"),
        card: token("card"),
        border: token("border"),
        ring: token("ring"),
        muted: {
          DEFAULT: token("muted"),
          foreground: token("muted-foreground"),
        },
        // Aubergine purple: actions, links, step numbers.
        primary: {
          DEFAULT: token("primary"),
          foreground: token("primary-foreground"),
          soft: token("primary-soft"),
        },
        // Olive green: categories, labels, checkboxes.
        secondary: {
          DEFAULT: token("secondary"),
          foreground: token("secondary-foreground"),
          soft: token("secondary-soft"),
        },
        // The deep aubergine band behind a recipe's family story.
        feature: {
          DEFAULT: token("feature"),
          foreground: token("feature-foreground"),
          accent: token("feature-accent"),
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};
export default config;
