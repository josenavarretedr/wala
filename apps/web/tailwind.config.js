/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Outfit', 'Inter', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        wala: {
          primary: '#E35336',
          hover: '#c2412b',
          soft: '#FFF5F2',
          ink: '#111827',
        },
      },
    },
  },
  plugins: [],
}