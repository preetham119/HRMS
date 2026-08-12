import type { Config } from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff8ff',
          100: '#dbeefe',
          200: '#bcdffb',
          300: '#8fcff9',
          400: '#56b1f3',
          500: '#2d8fe8',
          600: '#1c70c7',
          700: '#185da0',
          800: '#184f81',
          900: '#18436a',
          950: '#102b44',
        },
        accent: {
          50: '#edfdf7',
          100: '#d2f8e7',
          200: '#a9efd0',
          300: '#6be2b2',
          400: '#31ce90',
          500: '#13b47d',
          600: '#0f945e',
          700: '#0e764d',
          800: '#0d5e3f',
          900: '#0d5037',
          950: '#062d20',
        },
      },
      boxShadow: {
        glow: '0 20px 45px -20px rgba(45, 143, 232, 0.35)',
      },
      borderRadius: {
        '2xl': '1rem',
      },
    },
  },
  plugins: [],
} satisfies Config;
