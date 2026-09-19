/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        whatsapp: {
          50: '#E7FBEE',
          100: '#C6F6D5',
          200: '#9AE6B4',
          300: '#68D391',
          400: '#48D17E',
          500: '#25D366',
          600: '#1FBA57',
          700: '#199E49',
          800: '#147B3A',
          900: '#0E582A',
        },
        cream: {
          50: '#FDFCF8',
          100: '#FAF8F1',
          200: '#F5F2E8',
          300: '#EDE8D8',
        },
        ink: {
          900: '#1A1A1A',
          800: '#2D2D2D',
          700: '#3D3D3D',
          600: '#5A5A5A',
          500: '#7A7A7A',
          400: '#9A9A9A',
        },
      },
      fontFamily: {
        serif: ['"Fraunces"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      animation: {
        'float-slow': 'float 6s ease-in-out infinite',
        'float-slower': 'float 8s ease-in-out infinite',
        'float-slowest': 'float 10s ease-in-out infinite',
        'bubble-pulse': 'bubblePulse 4s ease-in-out infinite',
        'typing': 'typing 1.4s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-18px)' },
        },
        bubblePulse: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.4' },
          '50%': { transform: 'scale(1.08)', opacity: '0.25' },
        },
        typing: {
          '0%, 60%, 100%': { transform: 'translateY(0)', opacity: '0.4' },
          '30%': { transform: 'translateY(-6px)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
