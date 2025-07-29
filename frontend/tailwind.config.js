module.exports = {
  content: ["./public/index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        bebas: ['"Bebas Neue"', "sans-serif"],
      },
      keyframes: {
        wave: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-0.2rem)" },
        },
        fadeDown: {
          "0%": { opacity: 0, transform: "translateY(-20px)" },
          "20%": { opacity: 1, transform: "translateY(0)" },
          "80%": { opacity: 1, transform: "translateY(0)" },
          "100%": { opacity: 0, transform: "translateY(20px)" },
        },
      },
      animation: {
        wave: "wave 1.5s ease-in-out infinite",
        fadeDown: "fadeDown 2.5s ease-in-out forwards",
      },
    },
  },
  plugins: [],
};
