/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
  extend: {
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
      },
      // new dark-cave shade, for deep-dark mode
      dark: {
        bg: '#161616',        // deepest cave floor
        surface: '#1F1F1F',   // panel, card sit on floor
        elevated: '#292929',  // raise-up card, modal
        border: '#333333',    // stone crack line
        'border-light': '#404040',
        text: {
          primary: '#FBFBF8',   // main bone-white word
          secondary: '#B5B5B0', // dim gray word
          muted: '#7A7A76',     // faint shadow word
        },
        accent: '#FB6557',     // fire stay same, always visible
        'accent-hover': '#ff7c6f',
        'accent-muted': '#4a2c28', // fire dim, for subtle bg tint
        success: '#4ADE80',
        warning: '#FBBF24',
        danger: '#EF4444',
      }
    }
  }
},
  plugins: [],
}
