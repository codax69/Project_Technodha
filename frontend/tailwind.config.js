/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
      colors: {
        theme: {
          bg: '#2C2C2C',
          card: '#222222',
          light: '#FBFBF8',
          accent: '#FB6557',
          'accent-hover': '#e05345',
          muted: '#9e9e9e',
          border: '#3d3d3d',
        },
        coral: {
          50: '#fff5f5',
          100: '#ffe3e0',
          500: '#FB6557',
          600: '#e05345',
          700: '#c54236',
        },
        charcoal: {
          700: '#444444',
          800: '#383838',
          900: '#2C2C2C',
          950: '#1F1F1F',
        },
        cream: {
          100: '#FBFBF8',
          200: '#e8e8e3',
          300: '#d5d5cd',
        }
      }
    },
  },
  plugins: [],
}
