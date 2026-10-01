import type { Config } from "tailwindcss";

// The old site toggled light/dark via html[data-theme="light|dark"] (see
// globals.css), not Tailwind's own `dark:` variant -- kept that convention
// here rather than rewriting every themed class, so the port can lift
// classes from the vanilla markup near-verbatim.
const config: Config = {
  // The old site toggled theme by swapping html[data-theme="light"/"dark"]
  // and then hand-wrote a light-mode override for every Tailwind class that
  // needed one (hundreds of lines in styles.css). Tailwind's own dark mode
  // variant does the same job natively -- write `dark:bg-slate-900
  // bg-white` once per element as each page gets migrated, instead of
  // maintaining a second, parallel stylesheet of overrides. Pointing it at
  // the same data-theme attribute keeps the existing toggle button/
  // localStorage logic working unchanged.
  darkMode: ["selector", '[data-theme="dark"]'],
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
