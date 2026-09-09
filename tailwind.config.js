/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50: "#fffdfa",
          100: "#fff9ec",
          200: "#fff2cc",
          300: "#f7e399",
          400: "#f0cf66",
          500: "#e5b95c",
          600: "#b88528",
          700: "#946318",
          800: "#6e4511",
          900: "#4d2e0b",
          950: "#2d1703",
        },
        temple: {
          950: "#070503",
          900: "#120d09",
          850: "#18110b",
          800: "#22170f",
          700: "#382517",
          600: "#573922",
        },
        sacred: {
          saffron: "#e07a1e",
          marigold: "#f59e0b",
          kumkum: "#991b1b",
          sandalwood: "#d4a373",
        },
      },
      fontFamily: {
        divine: ["var(--font-cinzel)", "Cinzel", "Georgia", "serif"],
        ornate: ["var(--font-cinzel-decorative)", "Cinzel Decorative", "Georgia", "serif"],
        serif: ["var(--font-cormorant)", "Cormorant Garamond", "Playfair Display", "serif"],
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "sacred-float": "sacredFloat 6s ease-in-out infinite",
        "halo-pulse": "haloPulse 5s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        sacredFloat: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        haloPulse: {
          "0%, 100%": { opacity: "0.4", transform: "scale(1)" },
          "50%": { opacity: "0.85", transform: "scale(1.08)" },
        },
      },
    },
  },
  plugins: [],
};
