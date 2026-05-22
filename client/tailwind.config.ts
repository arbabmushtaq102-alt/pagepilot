import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0a0a0f",
        surface: "rgba(255, 255, 255, 0.03)",
        surfaceHover: "rgba(255, 255, 255, 0.08)",
        primary: "#4f46e5",
        primaryHover: "#6366f1",
        secondary: "#a855f7",
        border: "rgba(255, 255, 255, 0.1)",
        textMain: "#f8fafc",
        textMuted: "#94a3b8"
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-glow': 'conic-gradient(from 180deg at 50% 50%, #4f46e555 0deg, #a855f755 180deg, #4f46e555 360deg)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
export default config;
