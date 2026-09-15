/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        osBg: '#111315',
        osSurface: '#191C1F',
        osGlass: 'rgba(255, 255, 255, 0.06)',
        osGlassBorder: 'rgba(255, 255, 255, 0.10)',
        textPrimary: '#F2F0EA',
        textSecondary: '#9B9B96',
        accent: '#0d9488', // Deep teal
        success: '#16a34a', // Muted green
        warning: '#dc2626' // Muted red
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'monospace']
      }
    },
  },
  plugins: [],
}
