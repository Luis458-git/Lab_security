/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        expensify: {
          forest: '#002E22',
          forestLight: '#064232',
          forestMid: '#0B533E',
          emerald: '#03D47C',
          emeraldHover: '#02B86B',
          mint: '#C2F5DF',
          sageBg: '#EDF7F2',
          sageCard: '#F7FCF9',
          sageSurface: '#E1F2EA',
          sageBorder: '#BBE2CE',
          textDark: '#002E22',
          textMuted: '#3B6E5C'
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        serif: ['Georgia', 'Cambria', '"Times New Roman"', 'Times', 'serif'],
        mono: ['"JetBrains Mono"', 'monospace']
      }
    },
  },
  plugins: [],
}
