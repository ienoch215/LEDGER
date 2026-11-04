/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        monolith: {
          950: '#090a0c',
          900: '#0e1014',
          850: '#14161a',
          800: '#1a1d22',
          700: '#262930',
          600: '#353a44',
          500: '#525866',
          400: '#7c8494',
          300: '#a3abb8',
          200: '#cbd0d8',
          100: '#e5e8ec',
          50: '#f4f5f7',
        }
      },
      fontFamily: {
        sans: ['Manrope', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      }
    },
  },
  plugins: [],
}
