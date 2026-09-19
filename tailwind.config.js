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
        // LinkedIn's text scale, measured from the iOS app (see Figma Colour page).
        // #666 is 5.7:1 on white and 4.5:1 on the app canvas, so AA holds.
        ink: {
          DEFAULT: '#191919', // rgba(0,0,0,.9) on white: primary text
          muted: '#666666', // rgba(0,0,0,.6): secondary text, timestamps
          faint: '#666666', // LinkedIn uses the same .6 grey for meta text
          action: '#404040', // rgba(0,0,0,.75): post action icons and labels
        },
        surface: {
          DEFAULT: '#ffffff',
          page: '#f4f2ee', // LinkedIn web canvas
          app: '#e9e5df', // LinkedIn iOS canvas (gaps between feed posts)
          hover: '#f3f6f8',
        },
        line: 'rgba(0,0,0,0.08)',
        danger: '#CB112D', // LinkedIn notification badge / error red
        reaction: {
          like: '#378FE9',
          love: '#DF704D',
        },
        // "Start a post" action tints on LinkedIn web
        feed: {
          video: '#5F9B41',
          photo: '#378FE9',
          article: '#E06847',
        },
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
