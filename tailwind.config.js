/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './views/**/*.ejs',
    './public/js/**/*.js',
  ],
  theme: {
    extend: {
      colors: {
        marfil: '#F5F3EE',
        tinta: '#111111',
        gris: '#6E6E6E',
        linea: '#D8D4CC',
        coral: '#FF6B57',
        ambar: '#FFB347',
        lima: '#C6E377',
        turquesa: '#2EC4B6',
        cian: '#4CC9F0',
        indigo: '#4361EE',
        violeta: '#9B5DE5',
        rosa: '#F15BB5',
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        suave: '0 20px 60px -30px rgba(17, 17, 17, 0.25)',
      },
    },
  },
  plugins: [],
};
