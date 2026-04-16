/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#060918',
          surface: '#0d1230',
          border: '#1e2d6b',
          cyan: '#00e5ff',
          violet: '#7c3aed',
          rose: '#f43f5e',
          green: '#10b981',
          amber: '#f59e0b',
          muted: '#4a5696',
          text: '#e2e8ff',
        }
      },
      fontFamily: {
        heading: ['"Bricolage Grotesque"', 'sans-serif'],
        body: ['"Plus Jakarta Sans"', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

