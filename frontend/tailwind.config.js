/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mobbin: {
          bg: '#FFFFFF',
          surface: '#F7F7F8',
          surfaceSubtle: '#FAFAFA',
          surfaceHover: '#F0F0F2',
          border: '#E5E5E5',
          borderHover: '#D4D4D8',
          borderActive: '#111111',
          text: '#111111',
          muted: '#666666',
          subtle: '#8E8E93',
          dark: '#111111',
          darkHover: '#262626'
        },
        status: {
          success: '#15803d',
          successBg: '#f0fdf4',
          successBorder: '#bbf7d0',
          warning: '#b45309',
          warningBg: '#fffbeb',
          warningBorder: '#fde68a',
          danger: '#b91c1c',
          dangerBg: '#fef2f2',
          dangerBorder: '#fecaca'
        },
        // Mapeo retrocompatible para clases vault legacy
        vault: {
          bg: '#FFFFFF',
          card: '#FFFFFF',
          surface: '#F7F7F8',
          border: '#E5E5E5',
          borderHover: '#D4D4D8',
          emerald: '#111111',
          amber: '#b45309',
          red: '#b91c1c'
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace']
      },
      letterSpacing: {
        tightest: '-0.03em',
        tighter: '-0.02em',
      }
    },
  },
  plugins: [],
}
