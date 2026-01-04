import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        game: ['Orbitron', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
