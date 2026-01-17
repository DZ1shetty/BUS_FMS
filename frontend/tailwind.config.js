/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Playfair Display', 'serif'], // Optional for elegant headers if needed, otherwise Inter covers it
      },
      colors: {
        primary: {
          DEFAULT: "#2563eb", // Royal Blue
          hover: "#1d4ed8",
          light: "#dbeafe",
        },
        secondary: "#64748b", // Slate
        accent: "#f59e0b", // Amber for subtle highlights
        dark: {
          DEFAULT: "#0f172a", // Slate 900
          surface: "#1e293b", // Slate 800
          lighter: "#334155", // Slate 700
          border: "#e2e8f0", // Slate 200 (Light mode border)
          "border-dark": "#334155",
        },
        surface: {
          light: "#ffffff",
          dark: "#1e293b",
        }
      },
      backgroundImage: {
        'gradient-subtle': 'linear-gradient(to top right, #f8fafc, #edf2f7)',
        'gradient-dark': 'linear-gradient(to top right, #0f172a, #1e293b)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.5s ease-out forwards',
        'pulse-subtle': 'pulse 3s infinite ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
