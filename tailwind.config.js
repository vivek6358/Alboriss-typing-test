/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        alboriss: {
          dark: '#0f172a',
          navy: '#1e293b',
          blue: '#0284c7',
          blueHover: '#0369a1',
          accent: '#0ea5e9',
          surface: '#f8fafc',
          border: '#e2e8f0',
          textMuted: '#64748b'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace']
      },
      minHeight: {
        touch: '44px'
      },
      minWidth: {
        touch: '44px'
      }
    },
  },
  plugins: [],
}
