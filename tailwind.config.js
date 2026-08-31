/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Single blue accent — reserved ONLY for actionable elements (PRD §9).
        accent: {
          DEFAULT: '#0A66C2',
          hover: '#004182',
          disabled: '#7FA9D4',
        },
        // Neutral surface / text scale inspired by LinkedIn's dense functional UI.
        ink: {
          DEFAULT: 'rgba(0,0,0,0.90)', // primary text
          muted: 'rgba(0,0,0,0.60)', // secondary / timestamps
          faint: 'rgba(0,0,0,0.45)',
        },
        surface: {
          DEFAULT: '#ffffff',
          page: '#f4f2ee', // LinkedIn-style warm gray canvas
          hover: '#f3f6f8',
        },
        line: 'rgba(0,0,0,0.12)',
      },
      borderRadius: {
        card: '8px',
      },
      boxShadow: {
        card: '0 0 0 1px rgba(0,0,0,0.08), 0 2px 3px rgba(0,0,0,0.06)',
        pop: '0 4px 12px rgba(0,0,0,0.15)',
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
}
