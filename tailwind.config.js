/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: 'var(--color-primary)',
          'primary-hover': 'var(--color-primary-hover)',
          dark: 'var(--color-dark)',
          accent: 'var(--color-accent)',
          secondary: 'var(--color-secondary)',
          bg: 'var(--color-background)',
          surface: 'var(--color-surface)',
          text: 'var(--color-text)',
          muted: 'var(--color-text-muted)',
          border: 'var(--color-border)',
        },
      },
      fontFamily: {
        sans: ['Cairo', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
