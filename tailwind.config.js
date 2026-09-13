/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#0B1220',
          900: '#111827',
          800: '#161F2E',
          700: '#1C2739',
          600: '#26324A',
          500: '#37455E',
        },
        paper: {
          100: '#F3F4F6',
          300: '#C7CDD9',
          500: '#94A3B8',
        },
        gain: {
          DEFAULT: '#10B981',
          soft: '#0F3D31',
        },
        loss: {
          DEFAULT: '#EF4444',
          soft: '#3F1717',
        },
        signal: {
          DEFAULT: '#F59E0B',
          soft: '#3A2A0C',
        },
        accent: {
          DEFAULT: '#6366F1',
          soft: '#232244',
        },
      },
      fontFamily: {
        display: ['"Manrope"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
      },
      borderRadius: {
        sm: '6px',
        DEFAULT: '10px',
        lg: '14px',
      },
      boxShadow: {
        none: 'none',
      },
    },
  },
  plugins: [],
}
