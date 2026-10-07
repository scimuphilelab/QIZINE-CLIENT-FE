/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--color-primary, #1F3D2B)',
          foreground: 'var(--color-primary-fg, #FFFFFF)',
        },
        secondary: {
          DEFAULT: 'var(--color-secondary, #C8A15B)',
          foreground: 'var(--color-secondary-fg, #1A1A1A)',
        },
        accent: {
          DEFAULT: 'var(--color-accent, #D9534F)',
        },
        surface: {
          DEFAULT: 'var(--color-surface, #FFFFFF)',
          alt: 'var(--color-surface-alt, #F9FAFB)',
        },
        background: {
          DEFAULT: 'var(--color-background, #FBF8F1)',
        },
        muted: {
          DEFAULT: 'var(--color-text-muted, #6B6B6B)',
        },
      },
      fontFamily: {
        heading: ['var(--font-heading)', 'sans-serif'],
        body: ['var(--font-body)', 'sans-serif'],
      },
      borderRadius: {
        'brand': 'var(--radius-brand, 1rem)',
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'elevated': '0 10px 30px -4px rgba(0, 0, 0, 0.08)',
        'floating': '0 20px 40px -6px rgba(0, 0, 0, 0.12)',
      },
    },
  },
  plugins: [],
}
