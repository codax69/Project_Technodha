/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        theme: {
          bg: "#2C2C2C",
          card: "#222222",
          light: "#FBFBF8",
          accent: "#FB6557",
          "accent-hover": "#e05345",
          muted: "#9e9e9e",
          border: "#3d3d3d",
        },
        coral: {
          50: "#fff5f5",
          100: "#ffe3e0",
          500: "#FB6557",
          600: "#e05345",
          700: "#c54236",
        },
        charcoal: {
          700: "#444444",
          800: "#383838",
          900: "#2C2C2C",
          950: "#1F1F1F",
        },
        cream: {
          100: "#FBFBF8",
          200: "#e8e8e3",
          300: "#d5d5cd",
        },
        // new dark-cave shade, for deep-dark mode
        dark: {
          bg: "#161616", // cave floor
          surface: "#1E1E1E", // panel float above floor
          elevated: "#272727", // modal, dropdown rise higher
          border: "#333333", // crack line
          "border-light": "#454545", // crack line, more visible
          text: {
            primary: "#F5F3EE", // bone-white, warm not stark
            secondary: "#B8B4AC", // dim word, warm gray tie to bone hue
            muted: "#8C8880", // faint word, bumped for readability
          },
          accent: "#FB6557", // fire, unchanged — good already
          "accent-hover": "#FF8468",
          "accent-muted": "#3D241F", // ember char, deeper than before
          success: "#8BC96B", // moss green, earthy not neon
          warning: "#E8A23D", // ochre amber, fire-family hue
          danger: "#E5544A", // ember red, distinct from accent but same warmth
        },
      },
    },
  },
  plugins: [],
};
