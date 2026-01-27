/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Floyie brand (matches web app index.css)
        primary: "#5b8def",
        "primary-foreground": "#ffffff",
        "brand-cyan": "#6ee5f7",
        "brand-sky": "#5bc4f0",
        "brand-blue": "#5b8def",
        "brand-indigo": "#6666e6",
        "brand-purple": "#7846d4",
        "brand-violet": "#9333ea",
      },
    },
  },
  plugins: [],
};
