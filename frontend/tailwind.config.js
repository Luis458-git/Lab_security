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
          surfaceHover: '#EFEFF1',
          border: '#E5E5E5',
          borderHover: '#CCCCCC',
          borderActive: '#111111',
          text: '#111111',
          muted: '#666666',
          subtle: '#999999',
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
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace']
      }
    },
  },
  plugins: [],
}
