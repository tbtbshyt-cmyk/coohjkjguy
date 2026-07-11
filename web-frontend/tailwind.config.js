/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#D4AF37',
          50: '#FBF6E5', 100: '#F6ECBF', 200: '#EDD685', 300: '#E5C04B', 400: '#D4AF37',
          500: '#B8941F', 600: '#947418', 700: '#705512', 800: '#4C3A0D', 900: '#281F07',
        },
        ink: {
          DEFAULT: '#0A0A0A',
          50: '#F7F7F7', 100: '#EDEDED', 200: '#D4D4D4', 300: '#A0AEC0', 400: '#6B7280',
          500: '#374151', 600: '#1F2937', 700: '#141414', 800: '#0A0A0A', 900: '#000',
        },
      },
      fontFamily: { arabic: ['"Noto Sans Arabic"', 'system-ui', 'sans-serif'] },
      animation: {
        marquee: 'marquee 30s linear infinite',
        'pulse-gold': 'pulseGold 2s ease-in-out infinite',
        'fade-in': 'fadeIn .35s ease-out both',
        'slide-up': 'slideUp .45s cubic-bezier(.2,.7,.2,1) both',
      },
      keyframes: {
        marquee: { '0%': { transform: 'translateX(0%)' }, '100%': { transform: 'translateX(50%)' } },
        pulseGold: { '0%,100%': { boxShadow: '0 0 0 0 rgba(212,175,55,0.6)' }, '50%': { boxShadow: '0 0 0 12px rgba(212,175,55,0)' } },
        fadeIn: { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        slideUp: { '0%': { opacity: 0, transform: 'translateY(16px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
      },
      boxShadow: {
        gold: '0 8px 30px -10px rgba(212,175,55,0.55)',
        'gold-lg': '0 20px 50px -15px rgba(212,175,55,0.7)',
      },
    },
  },
  plugins: [],
};