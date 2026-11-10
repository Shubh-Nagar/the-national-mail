/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: '#1B2A4A', 900: '#101A30', 700: '#2A3B5E', 500: '#4A5B7C' },
        post: { DEFAULT: '#B4232A', dark: '#8F1B21', light: '#F7E4E3' },
        letter: { DEFAULT: '#E7F0F2', 200: '#D3E3E7', 300: '#B9D1D7' },
        body: '#1C2230',
        muted: '#5A6375',
        line: '#DDE3E8',
        mist: '#F5F7F8',
      },
      fontFamily: {
        serif: ['"Newsreader Variable"', 'Georgia', 'Cambria', 'serif'],
        sans: ['Mukta', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      fontSize: {
        // Modular scale (ratio ~1.25) anchored at a 17px base
        xs: ['0.8125rem', { lineHeight: '1.25rem' }],
        sm: ['0.9375rem', { lineHeight: '1.4rem' }],
        base: ['1.0625rem', { lineHeight: '1.65rem' }],
        lg: ['1.1875rem', { lineHeight: '1.6rem' }],
        xl: ['1.375rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.75rem', { lineHeight: '2.1rem' }],
        '3xl': ['2.125rem', { lineHeight: '2.45rem' }],
        '4xl': ['2.75rem', { lineHeight: '3rem' }],
        '5xl': ['3.375rem', { lineHeight: '3.55rem' }],
      },
      maxWidth: { site: '80rem', read: '42rem' },
      typography: ({ theme }) => ({
        mail: {
          css: {
            '--tw-prose-body': theme('colors.body'),
            '--tw-prose-headings': theme('colors.ink.900'),
            '--tw-prose-links': theme('colors.post.DEFAULT'),
            '--tw-prose-bold': theme('colors.ink.900'),
            '--tw-prose-quotes': theme('colors.ink.DEFAULT'),
            '--tw-prose-quote-borders': theme('colors.post.DEFAULT'),
            '--tw-prose-captions': theme('colors.muted'),
            '--tw-prose-bullets': theme('colors.post.DEFAULT'),
            '--tw-prose-hr': theme('colors.line'),
          },
        },
      }),
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
