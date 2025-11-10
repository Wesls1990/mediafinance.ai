import type { Config } from 'tailwindcss'

export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: { bg: '#0b0b0d' },
      boxShadow: {
        glass: '0 1px 0 rgba(255,255,255,0.08) inset, 0 8px 24px rgba(0,0,0,0.4)'
      }
    }
  },
  plugins: []
} satisfies Config
