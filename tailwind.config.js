/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // nof1.ai color palette
        'arena': {
          bg: '#0a0a0a',
          card: '#141414',
          border: '#262626',
          'border-hover': '#404040',
        },
        'profit': '#22c55e',
        'loss': '#ef4444',
        'neutral': '#3b82f6',
        'muted': '#a1a1aa',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
