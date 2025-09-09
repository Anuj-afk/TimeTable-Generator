// tailwind.config.js
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      keyframes: {
        zoomIn: {
          "0%": {}
        },
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        marquee_reverse: {
          '0%': { transform: 'translateX(-50%)' },
          '100%': { transform: 'translateX(0%)' },
        },
        cubeRotate: {
          '0%': { transform: 'rotateY(0deg)' },
          '25%': { transform: 'rotateY(90deg)' },
          '50%': { transform: 'rotateY(180deg)' },
          '75%': { transform: 'rotateY(270deg)' },
          '100%': { transform: 'rotateY(360deg)' },
        },
      },
      animation: {
        marquee: 'marquee 20s linear infinite',
        marquee_reverse: 'marquee_reverse 20s linear infinite',
        'cube-spin': 'cubeRotate 20s infinite linear',
      },
      transform: {
        'rotate-y-180': 'rotateY(180deg)',
      },
      fontFamily: {
        sans: ['Exo', 'sans-serif'],
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        '.rotate-y-180': {
          transform: 'rotateY(180deg)',
        },
        '.-rotate-y-180': {
          transform: 'rotateY(-180deg)',
        },
      });
    },
  ],
}