/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#070707",
        surface: "#0d0d0d",
        card: "rgba(13, 13, 13, 0.7)",
        primary: {
          DEFAULT: "#c41e3a", // Velvet Premium Red
          dark: "#8b0000",
          light: "#e63946",
        },
        gold: {
          DEFAULT: "#d4af37", // Elegant Brass Gold
          light: "#f3e5ab",
          dark: "#aa7c11",
        },
        text: {
          DEFAULT: "#f5f5f7",
          muted: "#a1a1a6",
        }
      },
      fontFamily: {
        sans: ["Poppins", "Inter", "sans-serif"],
        urdu: ["Noto Nastaliq Urdu", "serif"],
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
}
