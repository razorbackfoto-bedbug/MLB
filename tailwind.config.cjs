/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx,md,mdx}'],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: '#FBF3E7',
          50: '#FFFDFA',
          100: '#FBF3E7',
          200: '#F6E9D3',
        },
        teal: {
          50: '#EEF5F4',
          100: '#D9E9E7',
          200: '#B3D3CE',
          300: '#82B7AF',
          400: '#529A8F',
          500: '#357F74',
          600: '#2B6D63',
          700: '#215750', // primary brand teal (headings, buttons)
          800: '#1B4640',
          900: '#153732',
        },
        sage: {
          50: '#F3F6EE',
          100: '#E4EBD8',
          200: '#CBDAB3',
          300: '#AFC78C',
          400: '#93B268',
          500: '#7A9C4F',
          600: '#61803D',
        },
        coral: {
          50: '#FDF1EC',
          100: '#FADFD2',
          200: '#F3B79E',
          300: '#EC8F6B',
          400: '#E56F42', // accent (headline highlight, hearts, CTA outline)
          500: '#D6592D',
          600: '#B44822',
        },
        sunny: {
          50: '#FEF9EC',
          100: '#FCEEC6',
          200: '#F9DD8D',
          300: '#F5C451', // warm yellow accent (stars, highlights)
          400: '#EBAA23',
          500: '#C98A15',
        },
        ink: {
          DEFAULT: '#22303A',
          light: '#4B5C67',
        },
      },
      fontFamily: {
        display: ['"Fraunces"', '"Georgia"', 'serif'],
        body: ['"Nunito Sans"', '"Segoe UI"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      },
      boxShadow: {
        soft: '0 10px 30px -12px rgba(33, 87, 80, 0.18)',
        card: '0 6px 20px -8px rgba(33, 87, 80, 0.22)',
      },
    },
  },
  plugins: [],
};
