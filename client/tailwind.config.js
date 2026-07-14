/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  important: '#root', // To ensure MUI components styles are not broken and Tailwind takes precedence where needed
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'Inter', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(31, 38, 135, 0.08)',
        'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      colors: {
        orange: {
          50: 'var(--color-primary-lightest)',
          100: 'var(--color-primary-light)',
          500: 'var(--color-primary)',
          600: 'var(--color-primary-hover)',
          550: 'var(--color-primary-hover)',
        },
        teal: {
          50: 'var(--color-secondary-lightest)',
          500: 'var(--color-secondary)',
          600: 'var(--color-secondary-hover)',
        },
        themeBg: 'var(--color-bg-default)',
        themePaper: 'var(--color-bg-paper)',
        themeSidebar: 'var(--color-bg-sidebar)',
        themeText: 'var(--color-text-primary)',
        themeTextSecondary: 'var(--color-text-secondary)',
        themeBorder: 'var(--color-border)',
      }
    },
  },
  plugins: [],
}
