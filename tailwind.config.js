/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#1B4F72',
        accent: '#1ABC9C',
        background: '#F8FAFB',
        surface: '#FFFFFF',
        'text-main': '#2C3E50',
        'up-color': '#E67E22',
        'down-color': '#2980B9',
        'ns-color': '#BDC3C7',
        hypo: '#7D3C98',
        pitui: '#2E86C1',
        ovary: '#D4AC0D',
      },
      fontFamily: {
        heading: ['"Source Serif 4"', 'Georgia', 'serif'],
        body: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
