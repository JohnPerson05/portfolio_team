import type { Config } from "tailwindcss";

// Design tokens and theme (Task 2 — "Establish design tokens and Tailwind
// theme"). Colors map to the CSS variables declared in `globals.css` so the
// token system has a single source of truth. Fluid typography uses clamp()
// for hero → section headings → body → caption, and spacing follows an
// 8px-based rhythm.
const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx,mdx}",
    "./src/components/**/*.{ts,tsx,mdx}",
    "./src/features/**/*.{ts,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Backgrounds
        bg: {
          DEFAULT: "var(--bg)",
          secondary: "var(--bg-secondary)",
        },
        card: "var(--card)",
        // Text — exposes `text-text`, `text-muted`, `text-accent`
        text: {
          DEFAULT: "var(--text)",
          muted: "var(--text-muted)",
        },
        muted: "var(--text-muted)",
        accent: {
          DEFAULT: "var(--accent)",
        },
        // Border — exposes `border-hairline`
        hairline: "var(--border)",
      },
      borderColor: {
        DEFAULT: "var(--border)",
        hairline: "var(--border)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: [
          "var(--font-display)",
          "var(--font-sans)",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
      },
      // Fluid typography scale (clamp-based). Each entry is
      // [font-size, { lineHeight, letterSpacing }].
      fontSize: {
        // Caption / fine print
        caption: [
          "clamp(0.75rem, 0.72rem + 0.15vw, 0.875rem)",
          { lineHeight: "1.5", letterSpacing: "0.01em" },
        ],
        // Body
        body: [
          "clamp(1rem, 0.96rem + 0.2vw, 1.125rem)",
          { lineHeight: "1.7", letterSpacing: "0em" },
        ],
        "body-lg": [
          "clamp(1.125rem, 1.05rem + 0.4vw, 1.375rem)",
          { lineHeight: "1.6", letterSpacing: "0em" },
        ],
        // Section headings
        h3: [
          "clamp(1.25rem, 1.1rem + 0.75vw, 1.75rem)",
          { lineHeight: "1.3", letterSpacing: "-0.01em" },
        ],
        h2: [
          "clamp(1.75rem, 1.4rem + 1.75vw, 3rem)",
          { lineHeight: "1.2", letterSpacing: "-0.02em" },
        ],
        h1: [
          "clamp(2.25rem, 1.65rem + 3vw, 4.5rem)",
          { lineHeight: "1.08", letterSpacing: "-0.035em" },
        ],
        // Hero / display
        hero: [
          "clamp(2.5rem, 1.6rem + 4.5vw, 5.5rem)",
          { lineHeight: "1.05", letterSpacing: "-0.03em" },
        ],
      },
      // 8px-based spacing rhythm (extends the default Tailwind scale with
      // larger luxury-whitespace steps; named in 8px multiples).
      spacing: {
        "space-1": "0.5rem", // 8px
        "space-2": "1rem", // 16px
        "space-3": "1.5rem", // 24px
        "space-4": "2rem", // 32px
        "space-5": "2.5rem", // 40px
        "space-6": "3rem", // 48px
        "space-8": "4rem", // 64px
        "space-10": "5rem", // 80px
        "space-12": "6rem", // 96px
        "space-16": "8rem", // 128px
        "space-20": "10rem", // 160px
        section: "clamp(4rem, 2rem + 8vw, 8rem)", // fluid section padding
      },
      borderRadius: {
        lg: "0.75rem",
        xl: "1rem",
        "2xl": "1.5rem",
      },
      maxWidth: {
        content: "72rem", // 1152px — primary content container
      },
    },
  },
  plugins: [],
};

export default config;
