module.exports = {
  content: [
    "./src/**/*.{html,js,jsx,ts,tsx}",  // Ensure your React files are included here
  ],
  theme: {
    extend: {
      colors: {
        yellow: "var(--yellow)",
        maroon: "var(--maroon)",
      },
    },
  },
  plugins: [],
};
