import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      keyframes: {
        kenburns: {
          '0%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1.2)' }
        }
      },
      animation: {
        kenburns: 'kenburns 15s ease-in-out infinite alternate'
      }
    }
  },
  plugins: [],
}

export default config 