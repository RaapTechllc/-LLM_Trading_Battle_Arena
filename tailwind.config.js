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
        // Neon accent palette (used throughout JSX)
        'neon-profit':  '#22c55e',
        'neon-loss':    '#ef4444',
        'neon-neutral': '#3b82f6',
        'neon-warning': '#f59e0b',
        // Void background palette
        'void-deep':    '#0a0a0a',
        'void-mid':     '#111111',
        'void-surface': '#141414',
        'void-hover':   '#1a1a1a',
        // Text palette
        'secondary':    '#a1a1aa',
        'tertiary':     '#71717a',
        // Rarity
        'rarity-legendary': '#f59e0b',
        // Model identity colors
        'accent-gpt':       '#10b981',
        'accent-gemini':    '#3b82f6',
        'accent-grok':      '#ff6b2b',
        'accent-claude':    '#d4a574',
        'accent-deepseek':  '#00d4ff',
        'accent-qwen':      '#a855f7',
        // Legacy
        'profit': '#22c55e',
        'loss':   '#ef4444',
        'muted':  '#a1a1aa',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
