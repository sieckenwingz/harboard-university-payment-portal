module.exports = {
  content: [
    "./src/**/*.{html,js,jsx,ts,tsx}",  // Ensure your React files are included here
  ],
  theme: {
    extend: {
      fontFamily: {
        roboto: ['Roboto', 'sans-serif'],
        tinos: ['Tinos', 'serif'],
      },
      colors: {
        yellow: "var(--yellow)",
        maroon: "var(--maroon)",
      },
    },
  },
  plugins: [],
};
