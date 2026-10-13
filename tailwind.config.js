/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        heritage: {
          maroon: '#722F37',
          'maroon-dark': '#551F26',
          'maroon-light': '#8F3E48',
          stone: '#E8DFCF',
          ivory: '#FAF7F0',
          'ivory-dark': '#F0EAD6',
          charcoal: '#292521',
          'charcoal-dark': '#1C1917',
          aged: '#8B8276',
          gold: '#C49A45',
          'gold-light': '#DFC17B',
          red: '#B83232',
          orange: '#D97732',
          green: '#355E3B',
          'green-light': '#4A7C52',
          blue: '#286A83',
          'blue-light': '#3A8BAA',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Manrope', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
        odia: ['Noto Sans Oriya', 'sans-serif'],
      },
      boxShadow: {
        'heritage': '0 4px 20px -2px rgba(114, 47, 55, 0.08), 0 2px 6px -1px rgba(41, 37, 33, 0.06)',
        'heritage-lg': '0 10px 30px -4px rgba(114, 47, 55, 0.12), 0 4px 12px -2px rgba(41, 37, 33, 0.08)',
        'gold-glow': '0 0 15px rgba(196, 154, 69, 0.35)',
      },
      backgroundImage: {
        'konark-radial': 'radial-gradient(circle at center, rgba(196, 154, 69, 0.15) 0%, rgba(232, 223, 207, 0) 70%)',
        'pattachitra-pattern': 'radial-gradient(#722F37 0.75px, transparent 0.75px)',
      }
    },
  },
  plugins: [],
}
