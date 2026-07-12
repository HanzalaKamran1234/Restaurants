/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0B0B0B",
        secondaryBg: "#111111",
        surface: "#1A1A1A",
        primary: {
          DEFAULT: "#C8A96A", // Vestra Gold Accent
          dark: "#A3864B",
          light: "#E5D4B3",
        },
        gold: {
          DEFAULT: "#C8A96A",
          light: "#E5D4B3",
          dark: "#A3864B",
        },
        ivory: "#F8F6F2",
        text: {
          DEFAULT: "#FFFFFF",
          muted: "#B5B5B5",
        }
      },
      fontFamily: {
        sans: ["Outfit", "Inter", "sans-serif"],
        serif: ["Cinzel", "serif"],
      },
      backdropBlur: {
        xs: "2px",
      },
      borderColor: {
        premium: "rgba(255, 255, 255, 0.08)",
      }
    },
  },
  plugins: [],
}
