/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'tb-purple': '#8b5cf6', // TripBuddy Purple
      },
    },
  },
  plugins: [],
};
