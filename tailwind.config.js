/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./views/**/*.ejs",
    "./public/**/*.html",
    "./public/**/*.js"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Manrope', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#00103e',
          container: '#00216b',
          fixed: '#dce1ff',
          dim: '#b5c4ff'
        },
        tertiary: {
          DEFAULT: '#705d00',
          container: '#c9a900',
          fixed: '#ffe16d',
          dim: '#e9c400'
        },
        surface: {
          DEFAULT: '#faf8ff',
          tint: '#3557bc',
          variant: '#e3e2e8',
          container: {
            lowest: '#ffffff',
            low: '#f4f3f9',
            DEFAULT: '#efedf3',
            high: '#e9e7ee',
            highest: '#e3e2e8'
          }
        },
        outline: {
          DEFAULT: '#757682',
          variant: '#c5c6d2'
        }
      },
      boxShadow: {
        'ambient': '0 10px 30px rgba(0, 16, 62, 0.05)',
        'ambient-hover': '0 20px 40px rgba(0, 16, 62, 0.08)',
      },
      backgroundImage: {
        'gradient-135': 'linear-gradient(135deg, var(--tw-gradient-stops))',
      }
    },
  },
  plugins: [],
}
