/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Rajdhani', 'sans-serif'],
        rajdhani: ['Rajdhani', 'sans-serif'],
      },
      colors: {
        primary: "#00D4FF",
        secondary: "#0EA5E9",
        dark: {
          DEFAULT: "#121212",
          surface: "#1E293B",
          hover: "#334155",
        },
      },
    },
  },
  plugins: [],
}
