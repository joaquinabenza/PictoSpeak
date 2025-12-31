/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./app/**/*.{vue,js,ts,jsx,tsx}"],
  darkMode: 'media', // or 'media' or 'class'
  theme: {
    extend: {
      fontFamily: {
        sans: ['Open Sans', 'sans-serif'],
      },
      colors: {
        'aac-yellow': '#fff9c4', // People
        'aac-green': '#c8e6c9', // Verbs
        'aac-blue': '#bbdefb', // Adjectives/Descriptive
        'aac-orange': '#ffe0b2', // Nouns
        'aac-pink': '#f8bbd0', // Social
        'aac-gray': '#f5f5f5', // Misc
      }
    }
  },
}
