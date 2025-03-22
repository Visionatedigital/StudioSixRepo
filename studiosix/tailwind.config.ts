import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          blue: '#76B3F8',
          cyan: '#A0EAF6',
          purple: '#965BF9',
          pink: '#DA7AD4',
          dark: '#1B1464',
        },
        brand: {
          purple: {
            light: '#AC4FF1',
            DEFAULT: '#844BDC',
            dark: '#7144D3',
          }
        },
        neutral: {
          100: '#FFFFFF',
          300: '#F1F3F7',
          600: '#6D758F',
        },
        text: {
          primary: '#1B1464',
          secondary: '#6B6B6B',
        },
        button: {
          gray: '#F4F4F4',
        }
      },
      fontFamily: {
        inter: ['var(--font-inter)', 'Inter', 'sans-serif'],
        roboto: ['var(--font-roboto)', 'Roboto', 'sans-serif'],
        poppins: ['var(--font-poppins)', 'Poppins', 'sans-serif'],
        lato: ['var(--font-lato)', 'Lato', 'sans-serif'],
        cabin: ['var(--font-cabin)', 'Cabin', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(86.67deg, #844BDC 7.23%, #AC4FF1 100%)',
        'gradient-secondary': 'linear-gradient(90deg, #814ADA 0%, #4130A7 100%)',
        'gradient-text': 'linear-gradient(180deg, #2A0856 3.12%, #3E0B80 80.21%)',
      },
      boxShadow: {
        'menu': '0px 2px 3px rgba(0, 0, 0, 0.01), 0px 2px 2px rgba(135, 80, 255, 0.06)',
        'card': '0px 4px 10px rgba(0, 0, 0, 0.02), 0px 4px 4px rgba(135, 80, 255, 0.1)',
      },
      keyframes: {
        'scroll-left': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        }
      },
      animation: {
        'scroll-left': 'scroll-left 60s linear infinite',
      },
    },
  },
  plugins: [],
}

export default config 