/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        pricedown: ['Pricedown', 'sans-serif']
      },
      backgroundImage: {
        'palm-trees': "url('/palm-trees-bg.jpg')",
      },
    },
  },
  plugins: [],
}