/**@type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0c8599',
        hoverAccent: '#15aabf',
        urgent: '#dc2626',
        high: '#ea580c',
        medium: '#d97706',
        low: '#16a34a'
      }
    }
  },
  plugins: []
}
