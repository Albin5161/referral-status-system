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
        cardHover: '0 0 0 1px rgba(0,0,0,0.10), 0 6px 16px rgba(0,0,0,0.10)',
        pop: '0 8px 28px rgba(0,0,0,0.18)',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        popIn: {
          from: { opacity: '0', transform: 'translateY(6px) scale(0.98)' },
          to: { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out both',
        'slide-up': 'slideUp 0.34s cubic-bezier(0.2,0.7,0.3,1) both',
        'pop-in': 'popIn 0.3s cubic-bezier(0.2,0.8,0.3,1) both',
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
